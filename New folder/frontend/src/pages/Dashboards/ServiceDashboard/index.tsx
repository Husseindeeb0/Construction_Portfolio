import React, { useState, useEffect } from 'react'
import {
  useGetServiceSectionQuery,
  useCreateServiceSectionMutation,
  useUpdateServiceSectionMutation,
  useReorderServiceItemMutation,
} from '../../../../client/serviceAPI'
import { PageHeader } from '../../../components/common/PageHeader'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import { ImageUpload } from '../../../components/common/ImageUpload'
import { ReorderControls } from '../../../components/common/ReorderControls'
import { IconSelect } from '../../../components/common/IconSelect'
import { validateServiceSectionForm } from '../../../../validators/featureValidators'
import { formatErrorMessage } from '../../../lib/utils'
import { Plus, Trash2, Save, CheckCircle } from 'lucide-react'
import type { ServiceItemInput } from '../../../../types/serviceTypes'

export const ServiceDashboard: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useGetServiceSectionQuery()
  const [createSection, { isLoading: isCreating }] = useCreateServiceSectionMutation()
  const [updateSection, { isLoading: isUpdating }] = useUpdateServiceSectionMutation()
  const [reorderItem, { isLoading: isReordering }] = useReorderServiceItemMutation()

  const section = data?.serviceSection

  const [formData, setFormData] = useState({ title: '', description: '', imageText: '' })
  const [sectionImage, setSectionImage] = useState<{ file: string; fileName: string } | null>(null)
  const [services, setServices] = useState<ServiceItemInput[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (section) {
      setFormData({
        title: section.title,
        description: section.description,
        imageText: section.imageText,
      })
      setServices(
        section.services.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          icon: s.icon,
          isActive: s.isActive,
        }))
      )
    }
  }, [section])

  const handleAddService = () =>
    setServices([...services, { title: '', description: '', icon: '', isActive: true }])

  const handleRemoveService = (idx: number) =>
    setServices(services.filter((_, i) => i !== idx))

  const handleServiceChange = (
    idx: number,
    field: keyof ServiceItemInput,
    value: string | boolean
  ) => {
    const updated = [...services]
    updated[idx] = { ...updated[idx], [field]: value }
    setServices(updated)
  }

  const handleReorder = async (itemId: number, direction: 'up' | 'down') => {
    try {
      await reorderItem({ id: itemId, data: { direction } }).unwrap()
    } catch (err) {
      setFormError(formatErrorMessage(err))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    const isCreate = !section
    const errors = validateServiceSectionForm(
      {
        title: formData.title,
        description: formData.description,
        imageText: formData.imageText,
        image: sectionImage || undefined,
      },
      isCreate
    )

    for (let i = 0; i < services.length; i++) {
      if (!services[i].title.trim()) errors[`svc_title_${i}`] = 'Service title is required'
      if (!services[i].description.trim()) errors[`svc_desc_${i}`] = 'Description is required'
      if (!services[i].icon.trim()) errors[`svc_icon_${i}`] = 'Icon name is required'
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      if (isCreate) {
        if (!sectionImage) {
          setFieldErrors({ image: 'Section image is required' })
          return
        }
        await createSection({
          title: formData.title,
          description: formData.description,
          imageText: formData.imageText,
          image: sectionImage,
          services: services.map((s) => ({
            title: s.title,
            description: s.description,
            icon: s.icon,
            isActive: s.isActive,
          })),
        }).unwrap()
        setSuccessMessage('Services section created successfully')
      } else {
        await updateSection({
          title: formData.title,
          description: formData.description,
          imageText: formData.imageText,
          image: sectionImage || undefined,
          services: services.map((s) => ({
            title: s.title,
            description: s.description,
            icon: s.icon,
            isActive: s.isActive,
          })),
        }).unwrap()
        setSuccessMessage('Services section updated successfully')
      }
      setSectionImage(null)
    } catch (err) {
      setFormError(formatErrorMessage(err))
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" text="Loading Services section..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services Section"
        description="Configure the services your company offers and section image"
      />

      {isError && <ErrorAlert message={formatErrorMessage(error)} onRetry={() => refetch()} />}
      {formError && <ErrorAlert message={formError} />}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-sm font-medium">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Section Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Section Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. What We Offer"
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${fieldErrors.title ? 'border-red-500' : 'border-slate-300'}`}
              />
              {fieldErrors.title && <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Image Caption</label>
              <input
                type="text"
                required
                value={formData.imageText}
                onChange={(e) => setFormData({ ...formData, imageText: e.target.value })}
                placeholder="Caption text overlaid on the image"
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${fieldErrors.imageText ? 'border-red-500' : 'border-slate-300'}`}
              />
              {fieldErrors.imageText && <p className="text-xs text-red-600 mt-1">{fieldErrors.imageText}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Description</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="An overview of the services your company provides..."
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${fieldErrors.description ? 'border-red-500' : 'border-slate-300'}`}
            />
            {fieldErrors.description && <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>}
          </div>

          <div className="pt-2">
            <ImageUpload
              label="Section Image"
              currentImageUrl={section?.imageUrl}
              error={fieldErrors.image}
              onChange={setSectionImage}
              helperText="Featured construction or service photo for this section"
            />
          </div>
        </div>

        {/* Service Items */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Service Items</h3>
              <p className="text-xs text-slate-500 mt-0.5">Individual services listed within this section</p>
            </div>
            <button
              type="button"
              onClick={handleAddService}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Service
            </button>
          </div>

          {services.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-2">No service items yet.</p>
          ) : (
            <div className="space-y-4">
              {services.map((svc, idx) => {
                const isExisting = !!svc.id && section?.services.some((s) => s.id === svc.id)
                return (
                  <div key={svc.id || `new-svc-${idx}`} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Service {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        {isExisting && svc.id && (
                          <ReorderControls
                            isLoading={isReordering}
                            disableUp={idx === 0}
                            disableDown={idx === services.length - 1}
                            onMoveUp={() => handleReorder(svc.id!, 'up')}
                            onMoveDown={() => handleReorder(svc.id!, 'down')}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveService(idx)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Icon</label>
                        <IconSelect
                          id={`svc-icon-${idx}`}
                          value={svc.icon}
                          onChange={(val) => handleServiceChange(idx, 'icon', val)}
                          error={fieldErrors[`svc_icon_${idx}`]}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Title</label>
                        <input
                          type="text"
                          placeholder="Service title"
                          value={svc.title}
                          onChange={(e) => handleServiceChange(idx, 'title', e.target.value)}
                          className={`w-full h-8 px-3 py-1.5 text-xs bg-white border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${fieldErrors[`svc_title_${idx}`] ? 'border-red-500' : 'border-slate-300'}`}
                        />
                        {fieldErrors[`svc_title_${idx}`] && <p className="text-[11px] text-red-500 mt-1">{fieldErrors[`svc_title_${idx}`]}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Description</label>
                        <input
                          type="text"
                          placeholder="Brief description"
                          value={svc.description}
                          onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                          className={`w-full h-8 px-3 py-1.5 text-xs bg-white border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${fieldErrors[`svc_desc_${idx}`] ? 'border-red-500' : 'border-slate-300'}`}
                        />
                        {fieldErrors[`svc_desc_${idx}`] && <p className="text-[11px] text-red-500 mt-1">{fieldErrors[`svc_desc_${idx}`]}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`svc-active-${idx}`}
                        checked={svc.isActive ?? true}
                        onChange={(e) => handleServiceChange(idx, 'isActive', e.target.checked)}
                        className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                      />
                      <label htmlFor={`svc-active-${idx}`} className="text-xs text-slate-600 cursor-pointer font-medium">
                        Active (visible on site)
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isCreating || isUpdating ? 'Saving...' : 'Save Services'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default ServiceDashboard
