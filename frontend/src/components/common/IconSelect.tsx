import React from 'react'
import { ICON_OPTIONS } from '../../lib/iconOptions'
import DynamicIcon from './DynamicIcon'

interface IconSelectProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
  id?: string
}

export const IconSelect: React.FC<IconSelectProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  placeholder = 'Select an icon',
  id,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        {/* Live Icon Preview Badge */}
        <div
          title={value ? `Selected: ${value}` : 'No icon selected'}
          className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
            value
              ? 'bg-orange/10 border-orange/30 text-orange shadow-xs'
              : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}
        >
          {value ? (
            <DynamicIcon name={value} className="w-4 h-4 text-orange" />
          ) : (
            <span className="text-[10px] font-medium text-slate-400">?</span>
          )}
        </div>

        {/* Dropdown container */}
        <div className="relative flex-1 min-w-0">
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`w-full h-8 px-2.5 py-1 text-xs bg-white border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-orange appearance-none pr-7 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              error ? 'border-red-500' : 'border-slate-300'
            }`}
          >
            <option value="">{placeholder}</option>
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Dropdown chevron */}
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>

      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export default IconSelect

