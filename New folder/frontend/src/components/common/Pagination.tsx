import React from 'react'

interface PaginationProps {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1

  if (totalPages <= 1) return null

  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 mt-4">
      <div className="hidden sm:block">
        <p className="text-sm text-slate-700">
          Showing <span className="font-semibold">{startIndex}</span> to{' '}
          <span className="font-semibold">{endIndex}</span> of{' '}
          <span className="font-semibold">{totalItems}</span> results
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:border-orange hover:text-orange hover:bg-orange/5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-300 disabled:hover:text-slate-700 disabled:hover:bg-white transition-colors cursor-pointer"
        >
          Previous
        </button>
        <div className="text-xs text-slate-600 font-medium px-2">
          Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:border-orange hover:text-orange hover:bg-orange/5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-300 disabled:hover:text-slate-700 disabled:hover:bg-white transition-colors cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  )
}
