export default function SubmitButton({
  children,
  loading,
  className = 'btn-primary flex items-center justify-center gap-2 mt-1',
}) {
  return (
    <button type="submit" disabled={loading} className={className}>
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  )
}
