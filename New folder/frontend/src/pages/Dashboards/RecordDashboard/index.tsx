import React, { useState, useEffect } from 'react'
import {
  useGetTrackRecordSectionQuery,
  useCreateTrackRecordSectionMutation,
  useUpdateTrackRecordSectionMutation,
  useReorderTrackRecordStatMutation,
} from '../../../../client/trackRecordAPI'
import { PageHeader } from '../../../components/common/PageHeader'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import { ReorderControls } from '../../../components/common/ReorderControls'
import { IconSelect } from '../../../components/common/IconSelect'
import { validateTrackRecordForm } from '../../../../validators/featureValidators'
import { formatErrorMessage } from '../../../lib/utils'
import { Plus, Trash2, Save, CheckCircle } from 'lucide-react'
import type { TrackRecordStatInput } from '../../../../types/trackRecordTypes'

export const RecordDashboard: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useGetTrackRecordSectionQuery()
  const [createSection, { isLoading: isCreating }] = useCreateTrackRecordSectionMutation()
  const [updateSection, { isLoading: isUpdating }] = useUpdateTrackRecordSectionMutation()
  const [reorderStat, { isLoading: isReordering }] = useReorderTrackRecordStatMutation()

  const section = data?.trackRecordSection

  const [formData, setFormData] = useState({ badge: '', title: '', description: '' })
  const [stats, setStats] = useState<TrackRecordStatInput[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (section) {
      setFormData({ badge: section.badge, title: section.title, description: section.description })
      setStats(
        section.stats.map((s) => ({
          id: s.id,
          title: s.title,
          value: s.value,
          icon: s.icon,
          isActive: s.isActive,
        }))
      )
    }
  }, [section])

  const handleAddStat = () =>
    setStats([...stats, { title: '', value: '', icon: '', isActive: true }])

  const handleRemoveStat = (idx: number) =>
    setStats(stats.filter((_, i) => i !== idx))

  const handleStatChange = (
    idx: number,
    field: keyof TrackRecordStatInput,
    value: string | boolean
  ) => {
    const updated = [...stats]
    updated[idx] = { ...updated[idx], [field]: value }
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

    const isCreate = !section
    const errors = validateTrackRecordForm(
      {
        badge: formData.badge,
        title: formData.title,
        description: formData.description,
      },
      isCreate
    )

    for (let i = 0; i < stats.length; i++) {
      if (!stats[i].title.trim()) errors[`stat_title_${i}`] = 'Statistic title is required'
      if (!stats[i].value.trim()) errors[`stat_value_${i}`] = 'Statistic value is required'
      if (!stats[i].icon.trim()) errors[`stat_icon_${i}`] = 'Icon name is required'
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      if (isCreate) {
        await createSection({
          badge: formData.badge,
          title: formData.title,
          description: formData.description,
          stats: stats.map((s) => ({
            title: s.title,
            value: s.value,
            icon: s.icon,
            isActive: s.isActive,
          })),
        }).unwrap()
        setSuccessMessage('Track Record section created successfully')
      } else {
        await updateSection({
          badge: formData.badge,
          title: formData.title,
          description: formData.description,
          stats: stats.map((s) => ({
            title: s.title,
            value: s.value,
            icon: s.icon,
            isActive: s.isActive,
          })),
        }).unwrap()
        setSuccessMessage('Track Record section updated successfully')
      }
    } catch (err) {
      setFormError(formatErrorMessage(err))
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" text="Loading Track Record section..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Track Record"
        description="Showcase your company's key achievements, milestones, and performance metrics"
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
        {/* Section Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Section Heading
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Badge</label>
              <input
                type="text"
                required
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Our Track Record"
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
                placeholder="e.g. Decades of Proven Excellence"
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${fieldErrors.title ? 'border-red-500' : 'border-slate-300'}`}
              />
              {fieldErrors.title && <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Description</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Context paragraph for your track record metrics..."
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${fieldErrors.description ? 'border-red-500' : 'border-slate-300'}`}
            />
            {fieldErrors.description && <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Achievement Stats</h3>
              <p className="text-xs text-slate-500 mt-0.5">Numbers and metrics to display as achievement cards</p>
            </div>
            <button
              type="button"
              onClick={handleAddStat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Stat
            </button>
          </div>

          {stats.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-2">No statistics yet. Click "Add Stat" to get started.</p>
          ) : (
            <div className="space-y-3">
              {stats.map((stat, idx) => {
                const isExisting = !!stat.id && section?.stats.some((s) => s.id === stat.id)
                return (
                  <div key={stat.id || `new-stat-${idx}`} className="flex flex-col sm:flex-row sm:items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Icon</label>
                        <IconSelect
                          id={`stat-icon-${idx}`}
                          value={stat.icon}
                          onChange={(val) => handleStatChange(idx, 'icon', val)}
                          error={fieldErrors[`stat_icon_${idx}`]}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Title</label>
                        <input
                          type="text"
                          placeholder="Title (e.g. Projects)"
                          value={stat.title}
                          onChange={(e) => handleStatChange(idx, 'title', e.target.value)}
                          className={`w-full h-8 px-3 py-1.5 text-xs bg-white border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${fieldErrors[`stat_title_${idx}`] ? 'border-red-500' : 'border-slate-300'}`}
                        />
                        {fieldErrors[`stat_title_${idx}`] && <p className="text-[11px] text-red-500 mt-1">{fieldErrors[`stat_title_${idx}`]}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Value</label>
                        <input
                          type="text"
                          placeholder="Value (e.g. 500+)"
                          value={stat.value}
                          onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                          className={`w-full h-8 px-3 py-1.5 text-xs bg-white border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${fieldErrors[`stat_value_${idx}`] ? 'border-red-500' : 'border-slate-300'}`}
                        />
                        {fieldErrors[`stat_value_${idx}`] && <p className="text-[11px] text-red-500 mt-1">{fieldErrors[`stat_value_${idx}`]}</p>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id={`stat-active-${idx}`}
                          checked={stat.isActive ?? true}
                          onChange={(e) => handleStatChange(idx, 'isActive', e.target.checked)}
                          className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                        />
                        <label htmlFor={`stat-active-${idx}`} className="text-[11px] text-slate-500 cursor-pointer">Active</label>
                      </div>
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
            <span>{isCreating || isUpdating ? 'Saving...' : 'Save Track Record'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default RecordDashboard
