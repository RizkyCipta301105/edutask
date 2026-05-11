/**
 * Reusable Input Field dengan label & error display
 */
export default function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required,
  icon: Icon,
  rightElement,
  disabled,
  hint,
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="label">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none">
            <Icon size={17} />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            input-field
            ${Icon ? 'pl-10' : ''}
            ${rightElement ? 'pr-10' : ''}
            ${error ? 'border-red-400 focus:ring-red-300' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-primary-50' : ''}
          `}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {hint && !error && (
        <p className="text-xs text-primary-400">{hint}</p>
      )}
      {error && (
        <p className="error-text">{error}</p>
      )}
    </div>
  )
}
