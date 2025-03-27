import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { BetHouse } from '../target/types/bet_house'

describe('Test Bet House', () => {
  const CHEST_REWARD = 100000000
  const TRANSACTION_COST = 5000
  const provider = anchor.AnchorProvider.env()
  const connection = provider.connection
  const wallet = provider.wallet as anchor.Wallet
  anchor.setProvider(provider)
  const program = anchor.workspace.BetHouse as Program<BetHouse>

  it('Initlialize', async () => {
    const [poolAccount, poolBump] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('pool', 'utf8')],
      program.programId,
    )

    let txHash = await program.methods
      .initializeContractPool()
      .accounts({
        //@ts-ignore
        poolAccount: poolAccount,
        signer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet.payer])
      .rpc()
    const blockhashContext = await connection.getLatestBlockhashAndContext()

    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`)
    await connection.confirmTransaction({
      signature: txHash,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
    })
  })

  it('Place Bet', async () => {
    const [poolAccount, poolBump] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('pool', 'utf8')],
      program.programId,
    )

    let balanceBefore = await connection.getBalance(wallet.publicKey)
    console.log(`My balance before place a bet: ${balanceBefore} SOL`)

    let txHash = await program.methods
      .placeBet()
      .accounts({
        //@ts-ignore
        poolAccount: poolAccount,
        signer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet.payer])
      .rpc()

    const blockhashContext = await connection.getLatestBlockhashAndContext()

    await connection.confirmTransaction({
      signature: txHash,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
    })

    let balanceAfter = await connection.getBalance(wallet.publicKey)
    console.log(`My balance after place a bet: ${balanceAfter} SOL`)

    expect(balanceBefore - CHEST_REWARD - TRANSACTION_COST).toEqual(balanceAfter)
  })
  it('Resolve Bet', async () => {
    const [poolAccount, poolBump] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('pool', 'utf8')],
      program.programId,
    )

    let balanceBefore = await connection.getBalance(wallet.publicKey)
    console.log(`My balance before win a bet: ${balanceBefore} SOL`)

    let txHash = await program.methods
      .resolveBet(true)
      .accounts({
        //@ts-ignore
        poolAccount: poolAccount,
        signer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet.payer])
      .rpc()

    const blockhashContext = await connection.getLatestBlockhashAndContext()

    await connection.confirmTransaction({
      signature: txHash,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
    })

    let balanceAfter = await connection.getBalance(wallet.publicKey)
    console.log(`My balance after win a bet: ${balanceAfter} SOL`)

    expect(balanceBefore + CHEST_REWARD - TRANSACTION_COST).toEqual(balanceAfter)
  })
})
