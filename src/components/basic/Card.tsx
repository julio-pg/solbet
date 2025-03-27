export default function Card({
  card,
  onClick,
}: {
  card: {
    id: number
    img: string
    flipped: boolean
    matched: boolean
  }
  onClick: () => void
}) {
  return (
    <div
      className={`h-20 w-20 flex items-center justify-center cursor-pointer border-2 rounded-lg text-3xl ${
        card.flipped || card.matched ? 'bg-white' : 'bg-gray-400'
      }`}
      onClick={onClick}
    >
      {card.flipped || card.matched ? card.img : ''}
    </div>
  )
}
