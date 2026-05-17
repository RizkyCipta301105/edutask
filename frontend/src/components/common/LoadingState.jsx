export default function LoadingState({ message = 'Memuat data...', className = 'h-64' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-primary-400 text-sm">{message}</p>
    </div>
  )
}
