import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import type { Project } from "../../../types/projectTypes";

interface ProjectLightboxProps {
  project: Project;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export default function ProjectLightbox({
  project,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: ProjectLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xs select-none">
      {/* Close button top right */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors z-50 rounded-full hover:bg-white/10"
        aria-label="Close modal"
      >
        <X className="w-7 h-7" />
      </button>

      {/* Prev Arrow */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-all z-50 rounded-full hover:bg-white/10"
          aria-label="Previous project"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Next Arrow */}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-all z-50 rounded-full hover:bg-white/10"
          aria-label="Next project"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Main Image Viewport Area */}
      <div
        className="relative max-w-5xl max-h-[75vh] w-full mx-6 flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-lg overflow-hidden shadow-2xl max-h-[70vh] flex items-center justify-center">
          <img
            src={
              project.imageUrl ||
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
            }
            alt={project.title}
            className="max-h-[70vh] max-w-full w-auto object-contain rounded-lg"
          />
        </div>
      </div>

      {/* Bottom Information White Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white py-4 px-8 border-t border-gray-200 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs uppercase font-bold tracking-wider text-orange">
            {project.category?.name || "Project"}
          </span>
          <h3 className="text-lg font-bold text-gray-900 mt-0.5">
            {project.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <Maximize2 className="w-4 h-4 text-gray-400" />
          <span>Fullscreen</span>
        </div>
      </div>
    </div>
  );
}
