export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

export const formatErrorMessage = (error: unknown): string => {
  if (!error) return 'An unexpected error occurred'
  if (typeof error === 'string') return error

  const errObj = error as {
    data?: { message?: string; errors?: Record<string, string> | string[] }
    message?: string
  }

  if (errObj.data?.message) {
    return errObj.data.message
  }

  if (errObj.data?.errors) {
    if (Array.isArray(errObj.data.errors)) {
      return errObj.data.errors.join(', ')
    }
    if (typeof errObj.data.errors === 'object') {
      return Object.values(errObj.data.errors).join(', ')
    }
  }

  if (errObj.message) {
    return errObj.message
  }

  return 'Operation failed. Please try again.'
}
