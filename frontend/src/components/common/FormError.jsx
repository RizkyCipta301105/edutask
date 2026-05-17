export default function FormError({ children }) {
  if (!children) return null

  return (
    <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
      {children}
    </p>
  )
}
