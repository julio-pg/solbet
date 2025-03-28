import { useWallet } from '@solana/wallet-adapter-react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { WalletButton } from '../solana/solana-provider'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { useBetHouseProgram } from './bet-house-data-access'
import MemoryGame from './bet-house-ui'

export default function BasicFeature() {
  const { publicKey } = useWallet()
  const { programId } = useBetHouseProgram()

  return publicKey ? (
    <div>
      <AppHero title="Memory Game" subtitle={'Run the program by clicking the "Start Game" button.'}>
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <MemoryGame />
      </AppHero>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    </div>
  )
}
