// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import BetHouseIDL from '../target/idl/bet_house.json'
import type { BetHouse } from '../target/types/bet_house'

// Re-export the generated IDL and type
export { BetHouse, BetHouseIDL }

// The programId is imported from the program IDL.
export const BET_HOUSE_PROGRAM_ID = new PublicKey(BetHouseIDL.address)

// This is a helper function to get the Basic Anchor program.
export function getBetHouseProgram(provider: AnchorProvider) {
  return new Program(BetHouseIDL as BetHouse, provider)
}
