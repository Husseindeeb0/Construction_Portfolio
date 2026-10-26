import React, { useState } from 'react'
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useReorderProjectMutation,
} from '../../../../client/projectAPI'
import { useGetProjectCategoriesQuery } from '../../../../client/categoryAPI'
import { PageHeader } from '../../../components/common/PageHeader'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import { EmptyState } from '../../../components/common/EmptyState'
import { ReorderControls } from '../../../components/common/ReorderControls'
import { ImageUpload } from '../../../components/common/ImageUpload'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { Pagination } from '../../../components/common/Pagination'
import { validateProjectForm } from '../../../../validators/featureValidators'
import { formatErrorMessage } from '../../../lib/utils'
import { Plus, Pencil, Trash2, Save, X, FolderGit2, CheckCircle } from 'lucide-react'
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '../../../../types/projectTypes'

const PAGE_SIZE = 10

type FormMode = 'create' | 'edit'

interface ProjectFormState {
  title: string
  description: string
  projectCategoryId: number | ''
  isActive: boolean
}

const initialFormState: ProjectFormState = {
  title: '',
  description: '',
  projectCategoryId: '',
  isActive: true,
}

export const ProjectDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const { data, isLoading, isError, error, refetch } = useGetProjectsQuery({
    page: currentPage,
    limit: PAGE_SIZE,
  })
  const { data: catData } = useGetProjectCategoriesQuery()
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation()
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation()
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation()
  const [reorderProject, { isLoading: isReordering }] = useReorderProjectMutation()

  const projects = data?.projects ?? []
  const totalItems = data?.totalItems ?? projects.length
  const categories = catData?.categories ?? []

  const [mode, setMode] = useState<FormMode | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState<ProjectFormState>(initialFormState)
  const [imagePayload, setImagePayload] = useState<{ file: string; fileName: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const paginatedProjects = projects

  const openCreateForm = () => {
    setMode('create')
    setEditingProject(null)
    setFormData(initialFormState)
    setImagePayload(null)
    setFieldErrors({})
    setFormError(null)
  }

  const openEditForm = (project: Project) => {
    setMode('edit')
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      projectCategoryId: project.projectCategoryId,
      isActive: project.isActive,
    })
    setImagePayload(null)
    setFieldErrors({})
    setFormError(null)
  }

  const closeForm = () => {
    setMode(null)
    setEditingProject(null)
    setFormData(initialFormState)
    setImagePayload(null)
    setFieldErrors({})
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const payload = {
      title: formData.title,
      description: formData.description,
      projectCategoryId: formData.projectCategoryId as number,
      isActive: formData.isActive,
      image: imagePayload || undefined,
    }

    const errors = validateProjectForm(payload, mode === 'create')
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      if (mode === 'create') {
        const req: CreateProjectRequest = {
          title: formData.title,
          description: formData.description,
          projectCategoryId: formData.projectCategoryId as number,
          isActive: formData.isActive,
          image: imagePayload!,
        }
        await createProject(req).unwrap()
        setSuccessMessage('Project created successfully')
      } else if (editingProject) {
        const req: UpdateProjectRequest = {
          title: formData.title,
          description: formData.description,
          projectCategoryId: formData.projectCategoryId as number,
          isActive: formData.isActive,
          image: imagePayload || undefined,
        }
        await updateProject({ id: editingProject.id, data: req }).unwrap()
        setSuccessMessage('Project updated successfully')
      }
      closeForm()
    } catch (err) {
      setFormError(formatErrorMessage(err))
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deleteProject(deleteTarget.id).unwrap()
      setDeleteTarget(null)
      setSuccessMessage('Project deleted successfully')
      if (paginatedProjects.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1)
      }
    } catch (err) {
      setDeleteTarget(null)
      setFormError(formatErrorMessage(err))
    }
  }

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    try {
      await reorderProject({ id, data: { direction } }).unwrap()
    } catch (err) {
      setFormError(formatErrorMessage(err))
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" text="Loading projects..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your construction portfolio projects"
        action={
          !mode ? (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          ) : undefined
        }
      />

      {isError && <ErrorAlert message={formatErrorMessage(error)} onRetry={() => refetch()} />}
      {formError && <ErrorAlert message={formError} />}
      {successMessage && !mode && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-sm font-medium">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Panel */}
      {mode && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-xs p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'create' ? 'Create New Project' : `Edit: ${editingProject?.title}`}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && <ErrorAlert message={formError} />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Project Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => { setFormData({ ...formData, title: e.target.value }); if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: '' }) }}
                  placeholder="e.g. Downtown Office Complex"
                  className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${fieldErrors.title ? 'border-red-500' : 'border-slate-300'}`}
                />
                {fieldErrors.title && <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Category</label>
                <select
                  required
                  value={formData.projectCategoryId}
                  onChange={(e) => { setFormData({ ...formData, projectCategoryId: e.target.value ? parseInt(e.target.value) : '' }); if (fieldErrors.projectCategoryId) setFieldErrors({ ...fieldErrors, projectCategoryId: '' }) }}
                  className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${fieldErrors.projectCategoryId ? 'border-red-500' : 'border-slate-300'}`}
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {fieldErrors.projectCategoryId && <p className="text-xs text-red-600 mt-1">{fieldErrors.projectCategoryId}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Description</label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => { setFormData({ ...formData, description: e.target.value }); if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: '' }) }}
                placeholder="Detailed description of the project, its scope, and notable achievements..."
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${fieldErrors.description ? 'border-red-500' : 'border-slate-300'}`}
              />
              {fieldErrors.description && <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="project-active"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
              />
              <label htmlFor="project-active" className="text-sm text-slate-700 cursor-pointer font-medium">
                Active (visible on public portfolio)
              </label>
            </div>

            <div className="pt-1">
              <ImageUpload
                label="Project Image"
                currentImageUrl={editingProject?.imageUrl}
                error={fieldErrors.image}
                onChange={(payload) => { setImagePayload(payload); if (fieldErrors.image) setFieldErrors({ ...fieldErrors, image: '' }) }}
                helperText={mode === 'create' ? 'Required: Main photo of the project' : 'Leave empty to keep existing image'}
              />
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isCreating || isUpdating ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Save Changes'}</span>
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          All Projects
          <span className="ml-2 text-xs font-normal text-slate-400">({totalItems})</span>
        </h3>

        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Click 'New Project' above to add your first portfolio project"
            icon={<FolderGit2 className="w-6 h-6" />}
            action={
              !mode ? (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-sm rounded-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Project
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-2">
            {paginatedProjects.map((project, idx) => {
              const globalIdx = (currentPage - 1) * PAGE_SIZE + idx
              return (
                <div
                  key={project.id}
                  className="flex items-center gap-3 p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                >
                  {project.imageUrl && (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">{project.title}</p>
                      {!project.isActive && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded uppercase tracking-wider shrink-0">
                          Hidden
                        </span>
                      )}
                    </div>
                    {project.category && (
                      <p className="text-xs text-amber-600 font-medium mt-0.5">{project.category.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <ReorderControls
                      isLoading={isReordering}
                      disableUp={globalIdx === 0}
                      disableDown={globalIdx === totalItems - 1}
                      onMoveUp={() => handleReorder(project.id, 'up')}
                      onMoveDown={() => handleReorder(project.id, 'down')}
                    />
                    <button
                      type="button"
                      onClick={() => openEditForm(project)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(project)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default ProjectDashboard
