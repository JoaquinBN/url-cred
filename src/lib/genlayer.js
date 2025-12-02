import { createClient, createAccount } from 'genlayer-js';
import { genlayerStudio, CONTRACT_ADDRESS } from './chain-config';

/**
 * @typedef {Object} VerificationResult
 * @property {string} url
 * @property {string} timestamp
 * @property {number} status_code
 * @property {boolean} is_accessible
 * @property {string} error_message
 * @property {string} query
 * @property {boolean} content_found
 * @property {string} concise_answer
 * @property {string} analysis
 */

/**
 * @typedef {Object} ProcessUrlParams
 * @property {string} url
 * @property {string} [query]
 * @property {boolean} [force_refresh]
 */

class GenLayerService {
  constructor() {
    this.client = null;
    this.account = null;
    this.contractAddress = null;
  }

  async initialize() {
    try {
      // Get contract address from environment
      this.contractAddress = CONTRACT_ADDRESS;
      if (!this.contractAddress) {
        throw new Error('CONTRACT_ADDRESS environment variable is required');
      }

      // Create account and client
      this.account = createAccount();
      this.client = createClient({
        chain: genlayerStudio,
        account: this.account
      });

      // Initialize consensus smart contract
      await this.client.initializeConsensusSmartContract();

      return this.client;
    } catch (error) {
      throw new Error(`GenLayer initialization failed: ${error}`);
    }
  }

  /**
   * @param {ProcessUrlParams} params
   * @returns {Promise<boolean>} Returns true when transaction is confirmed
   */
  async processUrl(params) {
    if (!this.client || !this.contractAddress) {
      throw new Error('GenLayer not initialized. Call initialize() first.');
    }

    try {
      const hash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: 'process_url',
        args: [params.url, params.query || '', params.force_refresh || false]
      });


      // Wait for transaction confirmation
      await this.client.waitForTransactionReceipt({
        hash: hash,
        status: 'ACCEPTED',
        retries: 24,
        interval: 5000
      });


      return true;
    } catch (error) {
      throw new Error(`URL processing failed: ${error}`);
    }
  }

  /**
   * @returns {Promise<VerificationResult[]>}
   */
  async getVerifications() {
    if (!this.client || !this.contractAddress) {
      throw new Error('GenLayer not initialized. Call initialize() first.');
    }

    try {

      const result = await this.client.readContract({
        address: this.contractAddress,
        functionName: 'get_verifications',
        args: []
      });


      // Ensure we have an array and convert Map objects to plain objects
      let verifications = [];

      if (Array.isArray(result)) {
        verifications = result.map(item => {
          // Convert Map to plain object
          if (item instanceof Map) {
            const obj = {};
            for (const [key, value] of item) {
              obj[key] = value;
            }
            return obj;
          }
          return item;
        });
      } else if (result && typeof result === 'string') {
        try {
          verifications = JSON.parse(result);
        } catch {
          verifications = [];
        }
      } else {
        verifications = [];
      }


      return verifications;
    } catch (error) {
      throw new Error(`Failed to retrieve verifications: ${error}`);
    }
  }

  /**
   * @returns {string | null}
   */
  getContractAddress() {
    return this.contractAddress;
  }

  /**
   * @returns {boolean}
   */
  isInitialized() {
    return this.client !== null && this.account !== null;
  }

  /**
   * @returns {boolean}
   */
  isContractConfigured() {
    return this.contractAddress !== null;
  }
}

// Singleton instance
export const genLayerService = new GenLayerService();

// Export types and service
export default genLayerService;