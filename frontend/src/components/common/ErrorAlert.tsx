import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorAlertProps {
  message: string
  onRetry?: () => void
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 my-3">
      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-red-800">Error</h4>
        <p className="text-sm text-red-700 mt-0.5">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold text-red-700 hover:text-red-900 underline shrink-0 cursor-pointer"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
