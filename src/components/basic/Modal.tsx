import Button from './Button'

export default function Modal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">{message}</h2>
        <Button onClick={onClose}>Claim Your Reward</Button>
      </div>
    </div>
  )
}
