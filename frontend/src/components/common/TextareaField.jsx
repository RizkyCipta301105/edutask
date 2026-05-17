export default function TextareaField({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  rows = 3,
  optional,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="label">
          {label}
          {optional && <span className="text-primary-400 font-normal text-xs ml-1">(opsional)</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`input-field resize-none ${error ? 'border-red-400 focus:ring-red-300' : ''}`}
      />
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
