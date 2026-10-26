import { ArrowRight, BarChart2 } from "lucide-react";
import { useGetTrackRecordSectionQuery } from "../../../client/trackRecordAPI";
import DynamicIcon from "../common/DynamicIcon";

const DEFAULT_STATS = [
  { id: 1, icon: "chart", title: "Projects Delivered", value: "850+", displayOrder: 1 },
  { id: 2, icon: "smile", title: "Satisfied Clients", value: "620+", displayOrder: 2 },
  { id: 3, icon: "users", title: "Skilled Workers", value: "120+", displayOrder: 3 },
  { id: 4, icon: "award", title: "Industry Awards", value: "35+", displayOrder: 4 },
];

export default function TrackRecordSection() {
  const { data } = useGetTrackRecordSectionQuery();
  const section = data?.trackRecordSection;
  const rawStats =
    section?.stats && section.stats.length > 0
      ? section.stats.filter((s) => s.isActive)
      : DEFAULT_STATS;

  const stats = [...rawStats].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <section
      id="records"
      className="bg-white py-20 lg:py-28 border-t border-gray-100"
    >
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Headings & description */}
          <div className="lg:col-span-5 flex flex-col">
            <span className="text-orange text-xs sm:text-sm font-bold uppercase tracking-widest mb-3">
              {section?.badge || "OUR TRACK RECORD"}
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#1b2b4b] leading-[1.2] tracking-tight mb-5">
              {section?.title || "Numbers That Speak for Our Commitment"}
            </h2>

            <p className="text-base text-gray-500 leading-relaxed mb-8">
              {section?.description ||
                "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore."}
            </p>

            <div>
              <a
                href="#projects"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-orange hover:text-orange-dark transition-colors"
              >
                <span>View Our Projects</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: 2x2 Stat Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-lg hover:border-orange/30 transition-all duration-300 flex items-center gap-5 group"
              >
                {/* Icon square */}
                <div className="w-14 h-14 rounded-xl bg-orange/10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                  <DynamicIcon
                    name={stat.icon}
                    className="w-6 h-6 text-orange"
                    fallback={<BarChart2 className="w-6 h-6 text-orange" />}
                  />
                </div>

                {/* Number & label */}
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-black text-[#1b2b4b] tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">
                    {stat.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
