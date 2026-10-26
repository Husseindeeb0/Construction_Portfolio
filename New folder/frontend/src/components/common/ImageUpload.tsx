import React, { useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { fileToBase64 } from '../../lib/utils'

interface ImageUploadProps {
  label: string
  currentImageUrl?: string
  error?: string
  onChange: (imagePayload: { file: string; fileName: string } | null) => void
  helperText?: string
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  currentImageUrl,
  error,
  onChange,
  helperText = 'Supports JPG, PNG, WEBP, SVG',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const base64 = await fileToBase64(file)
      setPreview(base64)
      setSelectedFileName(file.name)
      onChange({ file: base64, fileName: file.name })
    } catch (err) {
      console.error('File conversion error:', err)
    }
  }

  const handleClear = () => {
    setPreview(null)
    setSelectedFileName(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onChange(null)
  }

  const activeImage = preview || currentImageUrl

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-800">{label}</label>

      <div className="flex items-start gap-4">
        {activeImage ? (
          <div className="relative group w-32 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-xs">
            <img
              src={activeImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {preview && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-700 text-white rounded-full transition-colors cursor-pointer"
                title="Remove new selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-32 h-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50 shrink-0">
            <ImageIcon className="w-7 h-7" />
            <span className="text-[11px] mt-1 font-medium">No image</span>
          </div>
        )}

        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label
            htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-xs hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            {activeImage ? 'Replace Image' : 'Select Image'}
          </label>

          {selectedFileName && (
            <p className="text-xs text-emerald-600 font-medium">
              New file: {selectedFileName}
            </p>
          )}

          <p className="text-xs text-slate-500">{helperText}</p>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
    </div>
  )
}
