import React, { useState, useEffect } from 'react'
import {
  useGetHeroQuery,
  useCreateHeroMutation,
  useUpdateHeroMutation,
  useReorderHeroStatMutation,
} from '../../../../client/heroAPI'
import { PageHeader } from '../../../components/common/PageHeader'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import { ImageUpload } from '../../../components/common/ImageUpload'
import { ReorderControls } from '../../../components/common/ReorderControls'
import { validateHeroForm } from '../../../../validators/featureValidators'
import { formatErrorMessage } from '../../../lib/utils'
import { Plus, Trash2, Save, CheckCircle } from 'lucide-react'
import type { HeroStatInput } from '../../../../types/heroTypes'

export const HeroDashboard: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useGetHeroQuery()
  const [createHero, { isLoading: isCreating }] = useCreateHeroMutation()
  const [updateHero, { isLoading: isUpdating }] = useUpdateHeroMutation()
  const [reorderStat, { isLoading: isReordering }] = useReorderHeroStatMutation()

  const hero = data?.hero

  const [formData, setFormData] = useState({
    badge: '',
    title: '',
    description: '',
  })
  const [bgImage, setBgImage] = useState<{ file: string; fileName: string } | null>(null)
  const [stats, setStats] = useState<HeroStatInput[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (hero) {
      setFormData({
        badge: hero.badge,
        title: hero.title,
        description: hero.description,
      })
      setStats(
        hero.stats.map((s) => ({
          id: s.id,
          label: s.label,
          value: s.value,
        }))
      )
    }
  }, [hero])

  const handleAddStat = () => {
    setStats([...stats, { label: '', value: '' }])
  }

  const handleRemoveStat = (index: number) => {
    setStats(stats.filter((_, idx) => idx !== index))
  }

  const handleStatChange = (index: number, field: 'label' | 'value', value: string) => {
    const updated = [...stats]
    updated[index] = { ...updated[index], [field]: value }
    setStats(updated)
  }

  const handleReorder = async (statId: number, direction: 'up' | 'down') => {
    try {
      await reorderStat({ id: statId, data: { direction } }).unwrap()
    } catch (err) {
      setFormError(formatErrorMessage(err))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    const isCreate = !hero
    const errors = validateHeroForm(
      {
        badge: formData.badge,
        title: formData.title,
        description: formData.description,
        backgroundImage: bgImage || undefined,
      },
      isCreate
    )

    // Validate stats non-empty labels & values
    for (let i = 0; i < stats.length; i++) {
      if (!stats[i].label.trim()) {
        errors[`stat_label_${i}`] = 'Statistic label is required'
      }
      if (!stats[i].value.trim()) {
        errors[`stat_value_${i}`] = 'Statistic value is required'
      }
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      if (isCreate) {
        if (!bgImage) {
          setFieldErrors({ backgroundImage: 'Background image is required' })
          return
        }
        await createHero({
          badge: formData.badge,
          title: formData.title,
          description: formData.description,
          backgroundImage: bgImage,
          stats: stats.map((s) => ({ label: s.label, value: s.value })),
        }).unwrap()
        setSuccessMessage('Hero section created successfully')
      } else {
        await updateHero({
          badge: formData.badge,
          title: formData.title,
          description: formData.description,
          backgroundImage: bgImage || undefined,
          stats: stats.map((s) => ({ label: s.label, value: s.value })),
        }).unwrap()
        setSuccessMessage('Hero section updated successfully')
      }
      setBgImage(null)
    } catch (err) {
      setFormError(formatErrorMessage(err))
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading Hero section..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero Section"
        description="Configure banner text, headline, description, background image, and performance highlights"
      />

      {isError && (
        <ErrorAlert
          message={formatErrorMessage(error)}
          onRetry={() => refetch()}
        />
      )}

      {formError && <ErrorAlert message={formError} />}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-sm font-medium">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Hero Content & Messaging
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Badge Tagline
              </label>
              <input
                type="text"
                required
                value={formData.badge}
                onChange={(e) => {
                  setFormData({ ...formData, badge: e.target.value })
                  if (fieldErrors.badge) setFieldErrors({ ...fieldErrors, badge: '' })
                }}
                placeholder="e.g. #1 Commercial Builders"
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${
                  fieldErrors.badge ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {fieldErrors.badge && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.badge}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Hero Headline
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value })
                  if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: '' })
                }}
                placeholder="e.g. Constructing the Future with Excellence"
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${
                  fieldErrors.title ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {fieldErrors.title && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Description Paragraph
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value })
                if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: '' })
              }}
              placeholder="Provide a concise introduction to the company's building mission..."
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${
                fieldErrors.description ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {fieldErrors.description && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>
            )}
          </div>

          <div className="pt-2">
            <ImageUpload
              label="Background Banner Image"
              currentImageUrl={hero?.backgroundImageUrl}
              error={fieldErrors.backgroundImage}
              onChange={(payload) => {
                setBgImage(payload)
                if (fieldErrors.backgroundImage) setFieldErrors({ ...fieldErrors, backgroundImage: '' })
              }}
              helperText="Large hero background image (1920x1080 recommended)"
            />
          </div>
        </div>

        {/* Statistics Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hero Statistics</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Key metrics and achievements highlighted in the hero section
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddStat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Statistic</span>
            </button>
          </div>

          {stats.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-2">
              No statistics configured. Click &quot;Add Statistic&quot; to highlight your metrics.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.map((stat, idx) => {
                const isExisting = !!stat.id && hero?.stats.some((s) => s.id === stat.id)
                return (
                  <div
                    key={stat.id || `new-stat-${idx}`}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Label (e.g. Completed Projects)"
                          value={stat.label}
                          onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs bg-white border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${
                            fieldErrors[`stat_label_${idx}`] ? 'border-red-500' : 'border-slate-300'
                          }`}
                        />
                        {fieldErrors[`stat_label_${idx}`] && (
                          <p className="text-[11px] text-red-500 mt-0.5">
                            {fieldErrors[`stat_label_${idx}`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Value (e.g. 250+)"
                          value={stat.value}
                          onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs bg-white border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${
                            fieldErrors[`stat_value_${idx}`] ? 'border-red-500' : 'border-slate-300'
                          }`}
                        />
                        {fieldErrors[`stat_value_${idx}`] && (
                          <p className="text-[11px] text-red-500 mt-0.5">
                            {fieldErrors[`stat_value_${idx}`]}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0">
                      {isExisting && stat.id && (
                        <ReorderControls
                          isLoading={isReordering}
                          disableUp={idx === 0}
                          disableDown={idx === stats.length - 1}
                          onMoveUp={() => handleReorder(stat.id!, 'up')}
                          onMoveDown={() => handleReorder(stat.id!, 'down')}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveStat(idx)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="Delete statistic"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            <span>{isCreating || isUpdating ? 'Saving...' : 'Save Hero Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default HeroDashboard
