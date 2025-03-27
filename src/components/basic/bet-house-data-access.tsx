import { BET_HOUSE_PROGRAM_ID as programId, getBetHouseProgram } from '@project/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'

import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { web3 } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'

export function useBetHouseProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const program = getBetHouseProgram(provider)
  const { publicKey } = useWallet()

  const [poolAccount, _poolBump] = PublicKey.findProgramAddressSync([Buffer.from('pool', 'utf8')], programId)

  const getProgramAccount = useQuery({
    queryKey: ['betHouse', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initializeContractPool = useMutation({
    mutationKey: ['betHouse', 'initialize', { cluster }],
    mutationFn: () =>
      program.methods
        .initializeContractPool()
        .accounts({
          //@ts-ignore
          poolAccount: poolAccount,
          signer: publicKey!,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
    },
    onError: () => {
      toast.error('Failed to run program')
    },
  })

  return {
    program,
    programId,
    getProgramAccount,
    initializeContractPool,
  }
}
