import { useState } from "react";
import { ArrowRight, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetProjectsQuery } from "../../../client/projectAPI";
import { useGetProjectCategoriesQuery } from "../../../client/categoryAPI";
import type { Project } from "../../../types/projectTypes";
import ProjectLightbox from "./ProjectLightbox";

const PAGE_SIZE = 6;

const DEFAULT_PROJECTS: Partial<Project>[] = [
  {
    id: 101,
    title: "Sunset Ridge Villa",
    description: "Premium residential complex with contemporary architecture",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    category: { id: 1, name: "Residential", displayOrder: 1 },
    projectCategoryId: 1,
    isActive: true,
  },
  {
    id: 102,
    title: "Central Shopping Plaza",
    description: "Multi-level retail destination with modern amenities",
    imageUrl:
      "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80",
    category: { id: 2, name: "Commercial", displayOrder: 2 },
    projectCategoryId: 2,
    isActive: true,
  },
  {
    id: 103,
    title: "Northern Rail Terminal",
    description: "Multi-modal transportation hub for the metro area",
    imageUrl:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    category: { id: 3, name: "Infrastructure", displayOrder: 3 },
    projectCategoryId: 3,
    isActive: true,
  },
];

export default function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch only the requested page of 6 items from the server!
  const { data: projectsData, isLoading: projectsLoading } =
    useGetProjectsQuery({
      page: currentPage,
      limit: PAGE_SIZE,
      categoryId: activeCategory,
    });
  const { data: categoriesData } = useGetProjectCategoriesQuery();

  const apiProjects = projectsData?.projects ?? [];
  const rawProjects =
    apiProjects.length > 0 ? apiProjects : (DEFAULT_PROJECTS as Project[]);

  const visibleProjects = [...rawProjects].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const rawCategories = categoriesData?.categories ?? [
    { id: 1, name: "Residential", displayOrder: 1, createdAt: "", updatedAt: "" },
    { id: 2, name: "Commercial", displayOrder: 2, createdAt: "", updatedAt: "" },
    { id: 3, name: "Infrastructure", displayOrder: 3, createdAt: "", updatedAt: "" },
  ];

  const categories = [...rawCategories].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const totalItems = projectsData?.totalItems ?? visibleProjects.length;
  const totalPages =
    projectsData?.totalPages ?? Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const handleCategoryChange = (catId: number | null) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const section = document.getElementById("projects");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
  };

  const handlePrev = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const handleNext = () => {
    if (lightboxIndex !== null && lightboxIndex < visibleProjects.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  return (
    <section
      id="projects"
      className="bg-white py-20 lg:py-28 border-t border-gray-100"
    >
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-block relative pb-3">
            <h2 className="text-3xl sm:text-4xl font-black text-[#1b2b4b] tracking-tight">
              Our Projects
            </h2>
            {/* Orange underline bar */}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-orange rounded-full" />
          </div>
          <p className="text-base text-gray-500 mt-4 leading-relaxed">
            Excepteur sint occaecat cupidatat non proident sunt in culpa qui
            officia deserunt mollit anim id est laborum
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeCategory === null
                ? "bg-orange text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-700 hover:border-orange hover:text-orange"
            }`}
          >
            All Projects
          </button>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-orange text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-orange hover:text-orange"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Projects 3-Column Grid */}
        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-base font-medium">
              No projects found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProjects.map((project, idx) => (
              <div
                key={project.id}
                onClick={() => handleOpenLightbox(idx)}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer shadow-md bg-gray-900"
              >
                {/* Project Image */}
                <img
                  src={
                    project.imageUrl ||
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Default bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity duration-300" />

                {/* Hover gradient intensification */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category Badge Top Left (Orange pill as in hover state) */}
                {project.category?.name && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-block bg-orange text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-xs">
                      {project.category.name}
                    </span>
                  </div>
                )}

                {/* Hover Action Buttons: top-right expand + bottom-right orange circle arrow */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="w-10 h-10 rounded-full bg-orange flex items-center justify-center text-white shadow-md hover:bg-orange-dark">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange flex items-center justify-center text-white shadow-md hover:bg-orange-dark">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Content: Title + Description on hover */}
                <div className="absolute bottom-0 left-0 right-16 p-5 z-10 flex flex-col justify-end">
                  <h3 className="text-xl font-bold text-white leading-snug drop-shadow-sm">
                    {project.title}
                  </h3>

                  {/* Description reveals on hover */}
                  {project.description && (
                    <p className="text-xs sm:text-sm text-white/80 mt-1.5 line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Public Website Styled Pagination */}
        {totalPages > 1 && (
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500 font-medium order-2 sm:order-1">
              Showing{" "}
              <span className="font-bold text-[#1b2b4b]">
                {(safePage - 1) * PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-[#1b2b4b]">
                {Math.min(safePage * PAGE_SIZE, totalItems)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-[#1b2b4b]">
                {totalItems}
              </span>{" "}
              projects
            </p>

            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={() => handlePageChange(safePage - 1)}
                disabled={safePage <= 1}
                aria-label="Previous page"
                className="w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center transition-all duration-200 hover:border-orange hover:text-orange disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === safePage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-orange text-white shadow-md shadow-orange/20 scale-105"
                          : "bg-white border border-gray-200 text-gray-700 hover:border-orange hover:text-orange"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(safePage + 1)}
                disabled={safePage >= totalPages}
                aria-label="Next page"
                className="w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center transition-all duration-200 hover:border-orange hover:text-orange disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && visibleProjects[lightboxIndex] && (
        <ProjectLightbox
          project={visibleProjects[lightboxIndex]}
          onClose={handleCloseLightbox}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={lightboxIndex > 0}
          hasNext={lightboxIndex < visibleProjects.length - 1}
        />
      )}
    </section>
  );
}
