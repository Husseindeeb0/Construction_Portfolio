import { ArrowRight, Home as HomeIcon } from "lucide-react";
import { useGetServiceSectionQuery } from "../../../client/serviceAPI";
import DynamicIcon from "../common/DynamicIcon";

const DEFAULT_SERVICES = [
  {
    id: 1,
    icon: "home",
    title: "Residential Building",
    description:
      "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit.",
    displayOrder: 1,
  },
  {
    id: 2,
    icon: "building",
    title: "Commercial Projects",
    description:
      "Ut enim ad minima veniam quis nostrum exercitationem ullam corporis suscipit laboriosam.",
    displayOrder: 2,
  },
  {
    id: 3,
    icon: "hammer",
    title: "Renovation & Remodeling",
    description:
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae.",
    displayOrder: 3,
  },
  {
    id: 4,
    icon: "road",
    title: "Road & Infrastructure",
    description:
      "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.",
    displayOrder: 4,
  },
];

export default function ServicesSection() {
  const { data } = useGetServiceSectionQuery();
  const section = data?.serviceSection;
  const rawServices =
    section?.services && section.services.length > 0
      ? section.services.filter((s) => s.isActive)
      : DEFAULT_SERVICES;

  const services = [...rawServices].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <section
      id="services"
      className="bg-[#fcfcfd] py-20 lg:py-28 border-t border-gray-100"
    >
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block relative pb-3">
            <h2 className="text-3xl sm:text-4xl font-black text-[#1b2b4b] tracking-tight">
              {section?.title || "Our Services"}
            </h2>
            {/* Orange underline bar */}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-orange rounded-full" />
          </div>
          <p className="text-base text-gray-500 mt-4 leading-relaxed">
            {section?.description ||
              "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"}
          </p>
        </div>

        {/* Services Layout: 1/3 dark promo card + 2/3 cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Dark Featured Card */}
          <div className="lg:col-span-4 relative rounded-2xl overflow-hidden min-h-[380px] flex flex-col justify-end p-8 bg-[#15233d] shadow-lg group">
            {/* Background excavator/crane image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url(${
                  section?.imageUrl ||
                  "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80"
                })`,
              }}
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e192f] via-[#0e192f]/80 to-[#0e192f]/40" />

            {/* Content inside dark card */}
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">
                We Deliver Excellence in Every Project
              </h3>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-sm font-bold text-orange hover:text-white transition-colors"
              >
                <span>Get a Free Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right 2x2 Services Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-gray-100 rounded-2xl p-7 shadow-xs hover:shadow-xl hover:border-orange/30 transition-all duration-300 flex flex-col justify-start group"
              >
                {/* Icon box */}
                <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <DynamicIcon
                    name={service.icon}
                    className="w-5 h-5 text-orange"
                    fallback={<HomeIcon className="w-5 h-5 text-orange" />}
                  />
                </div>
                <h4 className="text-lg font-bold text-[#1b2b4b] mb-2 group-hover:text-orange transition-colors">
                  {service.title}
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
