import { Eye, EyeOff } from 'lucide-react'

export default function PasswordToggleButton({ visible, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-primary-400 hover:text-primary-600 transition-colors"
      tabIndex={-1}
      aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
    >
      {visible ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  )
}
