import { useState, useEffect } from 'react'
import Card from './Card'
import Button from './Button'
import { useBetHouseProgram } from './bet-house-data-access'
import { useWallet } from '@solana/wallet-adapter-react'
import Modal from './Modal'

const images = ['🍎', '🍌', '🍒', '🍇', '🍍', '🍑'] // 5 unique images
const shuffledCards = () => {
  const pairs = [...images, ...images].slice(0, 12) // Ensure 3x3 grid
  return pairs
    .sort(() => Math.random() - 0.5)
    .map((img, index) => ({
      id: index,
      img,
      flipped: false,
      matched: false,
    }))
}

export default function MemoryGame() {
  const [cards, setCards] = useState(shuffledCards)
  const [selected, setSelected] = useState<number[]>([])
  const [timer, setTimer] = useState(0)
  const [gameOver, setGameOver] = useState(true)
  const [gameWon, setGameWon] = useState(false)
  const { publicKey } = useWallet()
  useEffect(() => {
    if (timer > 0 && !gameOver && !gameWon) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000)
      return () => clearInterval(countdown)
    } else {
      setGameOver(true)
    }
  }, [timer, gameOver, gameWon])

  useEffect(() => {
    if (selected.length === 2) {
      const [first, second] = selected
      if (cards[first].img === cards[second].img) {
        setCards((prev) =>
          prev.map((card, index) => (index === first || index === second ? { ...card, matched: true } : card)),
        )
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, index) => (index === first || index === second ? { ...card, flipped: false } : card)),
          )
        }, 1000)
      }
      setSelected([])
    }
  }, [selected, cards])

  useEffect(() => {
    if (cards.every((card) => card.matched)) {
      setGameWon(true)
    }
  }, [cards])

  const handleFlip = (index: number) => {
    if (cards[index].flipped || selected.length === 2 || gameOver) return
    const newCards = cards.map((card, i) => (i === index ? { ...card, flipped: true } : card))
    setCards(newCards)
    setSelected([...selected, index])
  }

  const resetGame = () => {
    setCards(shuffledCards)
    setSelected([])
    setTimer(180)
    setGameOver(false)
    setGameWon(false)
  }
  const { initializeContractPool, getPoolAccount, placeBet, resolveBet } = useBetHouseProgram()

  function handleSubmit() {
    initializeContractPool.mutateAsync()
  }

  function handlePlaceBet() {
    placeBet.mutateAsync()
  }

  function handleClaimReward() {
    resolveBet.mutateAsync({ win: true }).then(() => {
      setSelected([])
      setTimer(0)
      setGameOver(true)
      setGameWon(false)
    })
  }

  if (!publicKey) {
    return <p>Connect your wallet</p>
  }

  if (!getPoolAccount.data || getPoolAccount.data?.length <= 0) {
    return <Button onClick={handleSubmit}>Start game</Button>
  }
  return (
    <div className="flex flex-col items-center p-4">
      {!gameOver ? (
        <>
          <p className="text-lg">Time left: {timer}s</p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {cards.map((card, index) => (
              <Card key={card.id} card={card} onClick={() => handleFlip(index)} />
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-red-500 mt-4 font-bold text-4xl">Place a bet</p>
          <Button onClick={handlePlaceBet}>Place Bet</Button>
          <Button onClick={resetGame} disabled={!placeBet.isSuccess}>
            Start Game
          </Button>
        </>
      )}
      {gameWon && <Modal message="You Win!" onClose={handleClaimReward} />}
    </div>
  )
}
