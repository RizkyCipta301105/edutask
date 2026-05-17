export default function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  children,
  required,
  icon: Icon,
  optional,
  className = '',
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="label">
          {Icon && <Icon size={14} className="inline mr-1" />}
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
          {optional && <span className="text-primary-400 font-normal text-xs ml-1">(opsional)</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`input-field ${error ? 'border-red-400 focus:ring-red-300' : ''} ${className}`}
      >
        {children}
      </select>
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
