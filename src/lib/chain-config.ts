import { studionet } from 'genlayer-js/chains'

// Create a custom GenLayer chain based on studionet but with environment-specific overrides
// This preserves all GenLayer-specific properties (consensus contracts, validators, etc.)
// while allowing different networks (DevConnect vs regular Studio)
// Environment variables are statically replaced at build time
const CHAIN_ID = process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID;
const CHAIN_NAME = process.env.NEXT_PUBLIC_GENLAYER_CHAIN_NAME;
const RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL;
const SYMBOL = process.env.NEXT_PUBLIC_GENLAYER_SYMBOL;

// Debug logging
console.log('Environment variables in chain-config:', {
  RPC_URL: process.env.NEXT_PUBLIC_GENLAYER_RPC_URL,
  CHAIN_ID: process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID
});

export const genlayerStudio = {
  ...studionet,
  // Override with environment-specific values
  id: Number(CHAIN_ID) || studionet.id,
  name: CHAIN_NAME || studionet.name,
  rpcUrls: {
    default: {
      http: [RPC_URL || studionet.rpcUrls.default.http[0]],
    },
  },
  nativeCurrency: {
    ...studionet.nativeCurrency,
    name: SYMBOL || studionet.nativeCurrency.name,
    symbol: SYMBOL || studionet.nativeCurrency.symbol,
  },
}
