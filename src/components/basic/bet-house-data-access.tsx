import { BASIC_PROGRAM_ID as programId, getBasicProgram } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'

import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useBetHouseProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const program = getBasicProgram(provider)

  const getProgramAccount = useQuery({
    queryKey: ['betHouse', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initializeContractPool = useMutation({
    mutationKey: ['betHouse', 'initialize', { cluster }],
    mutationFn: () => program.methods.initializeContractPool().rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
    },
    onError: () => toast.error('Failed to run program'),
  })

  return {
    program,
    programId,
    getProgramAccount,
    initializeContractPool,
  }
}
