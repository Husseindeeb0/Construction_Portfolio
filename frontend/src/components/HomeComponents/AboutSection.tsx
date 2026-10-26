import { ArrowRight, ShieldCheck } from "lucide-react";
import { useGetAboutQuery } from "../../../client/aboutAPI";
import { useGetHeroQuery } from "../../../client/heroAPI";
import DynamicIcon from "../common/DynamicIcon";

const DEFAULT_FEATURES = [
  {
    id: 1,
    icon: "shield",
    title: "Licensed & Insured",
    description:
      "Fully certified with comprehensive coverage for every project we undertake.",
    displayOrder: 1,
  },
  {
    id: 2,
    icon: "clock",
    title: "On-Time Delivery",
    description:
      "Proven track record of completing projects within schedule and budget.",
    displayOrder: 2,
  },
  {
    id: 3,
    icon: "people",
    title: "Expert Workforce",
    description:
      "Over 120 skilled professionals across all construction disciplines.",
    displayOrder: 3,
  },
  {
    id: 4,
    icon: "award",
    title: "Award Winning",
    description:
      "Recognized with 35+ industry awards for quality and innovation.",
    displayOrder: 4,
  },
];

export default function AboutSection() {
  const { data } = useGetAboutQuery();
  const { data: heroData } = useGetHeroQuery();
  const about = data?.about;

  // Extract years of experience from hero stats (e.g. "Years Experience")
  const experienceStat = heroData?.hero?.stats?.find((s) => {
    const lbl = s.label.toLowerCase();
    return lbl.includes("experience") || lbl.includes("year");
  });
  const experienceYears = experienceStat?.value || "25+";

  const rawFeatures =
    about?.features && about.features.length > 0
      ? about.features.filter((f) => f.isActive)
      : DEFAULT_FEATURES;

  const features = [...rawFeatures].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <section id="about" className="bg-white py-20 lg:py-28 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Stacked overlapping images + Orange circular badge */}
          <div className="relative pb-10 sm:pb-12 max-w-lg mx-auto lg:max-w-none w-full">
            {/* Primary Large Image */}
            <div className="w-[82%] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl relative bg-gray-100">
              <img
                src={
                  about?.primaryImageUrl ||
                  "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80"
                }
                alt="Construction craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlapping Badge: Years of Experience */}
            <div className="absolute top-[28%] right-[10%] sm:right-[12%] w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-orange flex flex-col items-center justify-center text-white text-center shadow-xl border-4 border-white z-20">
              <span className="text-2xl sm:text-3xl font-black leading-none">
                {experienceYears}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold leading-tight mt-1 opacity-90">
                Years of
                <br />
                Experience
              </span>
            </div>

            {/* Secondary Overlapping Image (bottom-right) */}
            <div className="absolute -bottom-4 right-0 w-[58%] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white z-10 bg-gray-200">
              <img
                src={
                  about?.secondaryImageUrl ||
                  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=700&q=80"
                }
                alt="Cranes and building structure"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="flex flex-col">
            {/* Badge displayed on top of the title */}
            {about?.badge && (
              <div className="inline-flex items-center gap-2 bg-orange/10 border border-orange/20 rounded-full px-4 py-1.5 mb-4 w-fit">
                <span className="text-xs sm:text-sm font-semibold text-orange tracking-wide">
                  {about.badge}
                </span>
              </div>
            )}

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1b2b4b] leading-[1.2] tracking-tight mb-6">
              {about?.title || "We Build With Precision, Passion & Purpose"}
            </h2>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-10">
              {about?.description ||
                "Since 1998, we have been delivering world-class construction services across residential, commercial, and infrastructure sectors. Our commitment to quality craftsmanship and client satisfaction drives everything we do."}
            </p>

            {/* 2x2 Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-10">
              {features.map((feature) => (
                <div key={feature.id} className="flex flex-col">
                  {/* Icon box with subtle orange background */}
                  <div className="w-11 h-11 rounded-xl bg-orange/10 flex items-center justify-center mb-3">
                    <DynamicIcon
                      name={feature.icon}
                      className="w-5 h-5 text-orange"
                      fallback={<ShieldCheck className="w-5 h-5 text-orange" />}
                    />
                  </div>
                  <h3 className="text-base font-bold text-[#1b2b4b] mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Buttons: "Start Your Project ->" and "View Our Work" */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="bg-orange hover:bg-orange-dark text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#projects"
                className="border border-gray-300 hover:border-orange hover:text-orange text-[#1b2b4b] font-bold text-sm sm:text-base px-8 py-3.5 rounded-full transition-all duration-200 inline-flex items-center justify-center bg-white shadow-xs"
              >
                View Our Work
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
