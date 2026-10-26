import { ArrowRight } from "lucide-react";
import { useGetHeroQuery } from "../../../client/heroAPI";

const STATS = [
  { value: "25+", label: "Years Experience" },
  { value: "850+", label: "Projects Completed" },
  { value: "120+", label: "Team Experts" },
  { value: "35+", label: "Industry Awards" },
];

export default function HeroSection() {
  const { data } = useGetHeroQuery();
  const hero = data?.hero;

  return (
    <section
      id="home"
      className="relative bg-[#0b1329] flex flex-col justify-between overflow-hidden"
    >
      {/* Dynamic Background Image Layer */}
      {hero?.backgroundImageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${hero.backgroundImageUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b3e] via-[#10234a] to-[#0a152e]" />
      )}

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b142bc0] via-[#0e1a38a0] to-[#080e1ec0]" />

      {/* Hero Main Content */}
      <div className="relative z-10 max-w-[1240px] w-full mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <span className="text-sm">🏗</span>
            <span className="text-xs sm:text-sm font-medium text-white/90 tracking-wide">
              {hero?.badge || "Trusted Construction Partner Since 1998"}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.15] tracking-tight mb-6">
            {hero?.title ? (
              hero.title.split(" ").map((word, i, arr) => {
                const isLast = i === arr.length - 1;
                return isLast ? (
                  <span key={i} className="text-orange">
                    {word}
                  </span>
                ) : (
                  <span key={i}>{word} </span>
                );
              })
            ) : (
              <>
                Building Tomorrow's Infrastructure{" "}
                <span className="text-orange">Today</span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-xl mb-10 font-normal">
            {hero?.description ||
              "Voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae."}
          </p>

          {/* Two Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="bg-orange hover:bg-orange-dark text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center justify-center"
            >
              Explore Our Projects
            </a>
            <a
              href="#contact"
              className="border-2 border-white/80 hover:border-white text-white hover:bg-white/10 font-bold text-sm sm:text-base px-8 py-3.5 rounded-full transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              <span>Request a Quote</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Orange Stats Bar Strip */}
      <div className="relative z-10 w-full flex justify-center px-4 pb-8 -mt-6 sm:-mt-8">
        <div className="w-full max-w-[75%] bg-orange rounded-2xl shadow-xl px-6 py-7 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-white/20 text-center">
          {((hero?.stats && hero.stats.length > 0)
            ? [...hero.stats].sort((a, b) => a.displayOrder - b.displayOrder)
            : STATS
          ).map((stat, idx) => (
            <div
              key={'id' in stat && typeof stat.id === 'number' ? stat.id : idx}
              className="flex flex-col items-center justify-center px-4"
            >
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm font-medium text-white/90 mt-1 uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
