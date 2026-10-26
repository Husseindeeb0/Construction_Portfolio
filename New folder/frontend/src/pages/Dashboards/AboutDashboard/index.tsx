import React, { useState, useEffect } from 'react'
import {
  useGetAboutQuery,
  useCreateAboutMutation,
  useUpdateAboutMutation,
  useReorderAboutFeatureMutation,
} from '../../../../client/aboutAPI'
import { PageHeader } from '../../../components/common/PageHeader'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import { ImageUpload } from '../../../components/common/ImageUpload'
import { ReorderControls } from '../../../components/common/ReorderControls'
import { IconSelect } from '../../../components/common/IconSelect'
import { validateAboutForm } from '../../../../validators/featureValidators'
import { formatErrorMessage } from '../../../lib/utils'
import { Plus, Trash2, Save, CheckCircle } from 'lucide-react'
import type { AboutFeatureInput } from '../../../../types/aboutTypes'

export const AboutDashboard: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useGetAboutQuery()
  const [createAbout, { isLoading: isCreating }] = useCreateAboutMutation()
  const [updateAbout, { isLoading: isUpdating }] = useUpdateAboutMutation()
  const [reorderFeature, { isLoading: isReordering }] = useReorderAboutFeatureMutation()

  const about = data?.about

  const [formData, setFormData] = useState({ badge: '', title: '', description: '' })
  const [primaryImage, setPrimaryImage] = useState<{ file: string; fileName: string } | null>(null)
  const [secondaryImage, setSecondaryImage] = useState<{ file: string; fileName: string } | null>(null)
  const [features, setFeatures] = useState<AboutFeatureInput[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (about) {
      setFormData({ badge: about.badge, title: about.title, description: about.description })
      setFeatures(
        about.features.map((f) => ({
          id: f.id,
          title: f.title,
          description: f.description,
          icon: f.icon,
          isActive: f.isActive,
        }))
      )
    }
  }, [about])

  const handleAddFeature = () =>
    setFeatures([...features, { title: '', description: '', icon: '', isActive: true }])

  const handleRemoveFeature = (idx: number) =>
    setFeatures(features.filter((_, i) => i !== idx))

  const handleFeatureChange = (
    idx: number,
    field: keyof AboutFeatureInput,
    value: string | boolean
  ) => {
    const updated = [...features]
    updated[idx] = { ...updated[idx], [field]: value }
    setFeatures(updated)
  }

  const handleReorder = async (featureId: number, direction: 'up' | 'down') => {
    try {
      await reorderFeature({ id: featureId, data: { direction } }).unwrap()
    } catch (err) {
      setFormError(formatErrorMessage(err))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    const isCreate = !about
    const errors = validateAboutForm(
      {
        badge: formData.badge,
        title: formData.title,
        description: formData.description,
        primaryImage: primaryImage || undefined,
        secondaryImage: secondaryImage || undefined,
      },
      isCreate
    )

    for (let i = 0; i < features.length; i++) {
      if (!features[i].title.trim()) errors[`feat_title_${i}`] = 'Feature title is required'
      if (!features[i].description.trim()) errors[`feat_desc_${i}`] = 'Feature description is required'
      if (!features[i].icon.trim()) errors[`feat_icon_${i}`] = 'Icon name or URL is required'
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      if (isCreate) {
        if (!primaryImage || !secondaryImage) {
          setFieldErrors({
            primaryImage: !primaryImage ? 'Primary image is required' : '',
            secondaryImage: !secondaryImage ? 'Secondary image is required' : '',
          })
          return
        }
        await createAbout({
          badge: formData.badge,
          title: formData.title,
          description: formData.description,
          primaryImage,
          secondaryImage,
          features: features.map((f) => ({
            title: f.title,
            description: f.description,
            icon: f.icon,
            isActive: f.isActive,
          })),
        }).unwrap()
        setSuccessMessage('About section created successfully')
      } else {
        await updateAbout({
          badge: formData.badge,
          title: formData.title,
          description: formData.description,
          primaryImage: primaryImage || undefined,
          secondaryImage: secondaryImage || undefined,
          features: features.map((f) => ({
            title: f.title,
            description: f.description,
            icon: f.icon,
            isActive: f.isActive,
          })),
        }).unwrap()
        setSuccessMessage('About section updated successfully')
      }
      setPrimaryImage(null)
      setSecondaryImage(null)
    } catch (err) {
      setFormError(formatErrorMessage(err))
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" text="Loading About section..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="About Section"
        description="Manage the company's story, imagery, and highlighted feature cards"
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
        {/* Core Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            About Content & Images
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Badge</label>
              <input
                type="text"
                required
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Our Story"
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${fieldErrors.badge ? 'border-red-500' : 'border-slate-300'}`}
              />
              {fieldErrors.badge && <p className="text-xs text-red-600 mt-1">{fieldErrors.badge}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Building Excellence Since 1990"
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${fieldErrors.title ? 'border-red-500' : 'border-slate-300'}`}
              />
              {fieldErrors.title && <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Description</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="The company's story, values, and approach to construction..."
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${fieldErrors.description ? 'border-red-500' : 'border-slate-300'}`}
            />
            {fieldErrors.description && <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <ImageUpload
              label="Primary Image"
              currentImageUrl={about?.primaryImageUrl}
              error={fieldErrors.primaryImage}
              onChange={setPrimaryImage}
              helperText="Main about section photo (portrait or editorial)"
            />
            <ImageUpload
              label="Secondary Image"
              currentImageUrl={about?.secondaryImageUrl}
              error={fieldErrors.secondaryImage}
              onChange={setSecondaryImage}
              helperText="Accent photo shown beside the primary image"
            />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Feature Highlights</h3>
              <p className="text-xs text-slate-500 mt-0.5">Key advantages displayed as cards in the about section</p>
            </div>
            <button
              type="button"
              onClick={handleAddFeature}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Feature
            </button>
          </div>

          {features.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-2">No feature cards yet. Add your key differentiators.</p>
          ) : (
            <div className="space-y-4">
              {features.map((feat, idx) => {
                const isExisting = !!feat.id && about?.features.some((f) => f.id === feat.id)
                return (
                  <div key={feat.id || `new-feat-${idx}`} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Feature {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        {isExisting && feat.id && (
                          <ReorderControls
                            isLoading={isReordering}
                            disableUp={idx === 0}
                            disableDown={idx === features.length - 1}
                            onMoveUp={() => handleReorder(feat.id!, 'up')}
                            onMoveDown={() => handleReorder(feat.id!, 'down')}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
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
                          id={`feat-icon-${idx}`}
                          value={feat.icon}
                          onChange={(val) => handleFeatureChange(idx, 'icon', val)}
                          error={fieldErrors[`feat_icon_${idx}`]}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Title</label>
                        <input
                          type="text"
                          placeholder="Feature title"
                          value={feat.title}
                          onChange={(e) => handleFeatureChange(idx, 'title', e.target.value)}
                          className={`w-full h-8 px-3 py-1.5 text-xs bg-white border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${fieldErrors[`feat_title_${idx}`] ? 'border-red-500' : 'border-slate-300'}`}
                        />
                        {fieldErrors[`feat_title_${idx}`] && <p className="text-[11px] text-red-500 mt-1">{fieldErrors[`feat_title_${idx}`]}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Description</label>
                        <input
                          type="text"
                          placeholder="Brief description"
                          value={feat.description}
                          onChange={(e) => handleFeatureChange(idx, 'description', e.target.value)}
                          className={`w-full h-8 px-3 py-1.5 text-xs bg-white border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${fieldErrors[`feat_desc_${idx}`] ? 'border-red-500' : 'border-slate-300'}`}
                        />
                        {fieldErrors[`feat_desc_${idx}`] && <p className="text-[11px] text-red-500 mt-1">{fieldErrors[`feat_desc_${idx}`]}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`feat-active-${idx}`}
                        checked={feat.isActive ?? true}
                        onChange={(e) => handleFeatureChange(idx, 'isActive', e.target.checked)}
                        className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                      />
                      <label htmlFor={`feat-active-${idx}`} className="text-xs text-slate-600 cursor-pointer font-medium">
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
            <span>{isCreating || isUpdating ? 'Saving...' : 'Save About Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default AboutDashboard
