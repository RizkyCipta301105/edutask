/**
 * Custom hook untuk manajemen state form
 * Menangani: nilai field, error, loading, submit
 */
import { useState, useCallback } from 'react'

export function useForm(initialValues = {}) {
  const [values, setValues]   = useState(initialValues)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Hapus error field yang sedang diubah
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }, [errors])

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const setFieldError = useCallback((name, message) => {
    setErrors((prev) => ({ ...prev, [name]: message }))
  }, [])

  // Parse error dari response Django REST Framework
  const setApiErrors = useCallback((apiErrors) => {
    if (!apiErrors) return
    const parsed = {}
    Object.entries(apiErrors).forEach(([key, val]) => {
      parsed[key] = Array.isArray(val) ? val.join(' ') : val
    })
    setErrors(parsed)
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setLoading(false)
  }, [initialValues])

  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e?.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      await onSubmit(values)
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) setApiErrors(apiErrors)
    } finally {
      setLoading(false)
    }
  }, [values, setApiErrors])

  return {
    values,
    errors,
    loading,
    handleChange,
    setValue,
    setFieldError,
    setApiErrors,
    setErrors,
    setLoading,
    reset,
    handleSubmit,
  }
}
