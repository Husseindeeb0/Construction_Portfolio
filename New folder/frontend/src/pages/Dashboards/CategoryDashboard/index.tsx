import React, { useState } from 'react'
import {
  useGetProjectCategoriesQuery,
  useCreateProjectCategoryMutation,
  useUpdateProjectCategoryMutation,
  useDeleteProjectCategoryMutation,
  useReorderProjectCategoryMutation,
} from '../../../../client/categoryAPI'
import { PageHeader } from '../../../components/common/PageHeader'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import { EmptyState } from '../../../components/common/EmptyState'
import { ReorderControls } from '../../../components/common/ReorderControls'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { Pagination } from '../../../components/common/Pagination'
import { validateCategoryForm } from '../../../../validators/featureValidators'
import { formatErrorMessage } from '../../../lib/utils'
import { Plus, Pencil, Trash2, Save, X, Layers, CheckCircle } from 'lucide-react'
import type { ProjectCategory } from '../../../../types/projectTypes'

const PAGE_SIZE = 10

export const CategoryDashboard: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useGetProjectCategoriesQuery()
  const [createCategory, { isLoading: isCreating }] = useCreateProjectCategoryMutation()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateProjectCategoryMutation()
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteProjectCategoryMutation()
  const [reorderCategory, { isLoading: isReordering }] = useReorderProjectCategoryMutation()

  const categories = data?.categories ?? []
  const [currentPage, setCurrentPage] = useState(1)

  const paginatedCategories = categories.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const [createName, setCreateName] = useState('')
  const [createError, setCreateError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editError, setEditError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ProjectCategory | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const errors = validateCategoryForm({ name: createName })
    if (errors.name) { setCreateError(errors.name); return }
    try {
      await createCategory({ name: createName }).unwrap()
      setCreateName('')
      setCreateError('')
      setSuccessMessage('Category created successfully')
    } catch (err) {
      setFormError(formatErrorMessage(err))
    }
  }

  const handleEdit = (cat: ProjectCategory) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditError('')
  }

  const handleSaveEdit = async () => {
    setFormError(null)
    const errors = validateCategoryForm({ name: editName })
    if (errors.name) { setEditError(errors.name); return }
    try {
      await updateCategory({ id: editingId!, data: { name: editName } }).unwrap()
      setEditingId(null)
      setSuccessMessage('Category updated successfully')
    } catch (err) {
      setFormError(formatErrorMessage(err))
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deleteCategory(deleteTarget.id).unwrap()
      setDeleteTarget(null)
      setSuccessMessage('Category deleted successfully')
    } catch (err) {
      setDeleteTarget(null)
      setFormError(formatErrorMessage(err))
    }
  }

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    try {
      await reorderCategory({ id, data: { direction } }).unwrap()
    } catch (err) {
      setFormError(formatErrorMessage(err))
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" text="Loading categories..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Categories"
        description="Manage the categories used to organize portfolio projects"
      />

      {isError && <ErrorAlert message={formatErrorMessage(error)} onRetry={() => refetch()} />}
      {formError && <ErrorAlert message={formError} />}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-sm font-medium">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Create Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Add New Category</h3>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={createName}
              onChange={(e) => { setCreateName(e.target.value); setCreateError('') }}
              placeholder="Category name (e.g. Residential, Commercial)"
              className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${createError ? 'border-red-500' : 'border-slate-300'}`}
            />
            {createError && <p className="text-xs text-red-600 mt-1">{createError}</p>}
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? 'Creating...' : 'Add Category'}</span>
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          All Categories
          <span className="ml-2 text-xs font-normal text-slate-400">({categories.length})</span>
        </h3>

        {categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Start by adding a category above to organize your projects"
            icon={<Layers className="w-6 h-6" />}
          />
        ) : (
          <div className="space-y-2">
            {paginatedCategories.map((cat, idx) => {
              const globalIdx = (currentPage - 1) * PAGE_SIZE + idx
              return (
              <div
                key={cat.id}
                className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
              >
                <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-400">
                  {cat.displayOrder}
                </span>

                {editingId === cat.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editName}
                        autoFocus
                        onChange={(e) => { setEditName(e.target.value); setEditError('') }}
                        className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-orange ${editError ? 'border-red-500' : 'border-slate-300'}`}
                      />
                      {editError && <p className="text-xs text-red-500 mt-0.5">{editError}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={isUpdating}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Save"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-slate-800">{cat.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <ReorderControls
                        isLoading={isReordering}
                        disableUp={globalIdx === 0}
                        disableDown={globalIdx === categories.length - 1}
                        onMoveUp={() => handleReorder(cat.id, 'up')}
                        onMoveDown={() => handleReorder(cat.id, 'down')}
                      />
                      <button
                        type="button"
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 text-slate-500 hover:text-orange hover:bg-orange/10 rounded-md transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(cat)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )})}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={categories.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will fail if any projects are still assigned to this category.`}
        confirmText="Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default CategoryDashboard
