import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface ReorderControlsProps {
  onMoveUp?: () => void
  onMoveDown?: () => void
  disableUp?: boolean
  disableDown?: boolean
  isLoading?: boolean
}

export const ReorderControls: React.FC<ReorderControlsProps> = ({
  onMoveUp,
  onMoveDown,
  disableUp = false,
  disableDown = false,
  isLoading = false,
}) => {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={disableUp || isLoading}
        onClick={onMoveUp}
        title="Move Up"
        className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
      <button
        type="button"
        disabled={disableDown || isLoading}
        onClick={onMoveDown}
        title="Move Down"
        className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <ArrowDown className="w-4 h-4" />
      </button>
    </div>
  )
}
