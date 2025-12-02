import { studionet } from 'genlayer-js/chains'

// Create a custom GenLayer chain based on studionet but with environment-specific overrides
// This preserves all GenLayer-specific properties (consensus contracts, validators, etc.)
// while allowing different networks (DevConnect vs regular Studio)
export const genlayerStudio = {
  ...studionet,
  // Override with environment-specific values
  id: Number(process.env.BUN_PUBLIC_GENLAYER_CHAIN_ID) || studionet.id,
  name: process.env.BUN_PUBLIC_GENLAYER_CHAIN_NAME || studionet.name,
  rpcUrls: {
    default: {
      http: [process.env.BUN_PUBLIC_GENLAYER_RPC_URL || studionet.rpcUrls.default.http[0]],
    },
  },
  nativeCurrency: {
    ...studionet.nativeCurrency,
    name: process.env.BUN_PUBLIC_GENLAYER_SYMBOL || studionet.nativeCurrency.name,
    symbol: process.env.BUN_PUBLIC_GENLAYER_SYMBOL || studionet.nativeCurrency.symbol,
  },
}
