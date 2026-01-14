import { useMemo, memo } from "react";
import { Gamepad2, Wrench, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const Hero = () => {
  const { t } = useLanguage();

  // Memoize stats array to prevent recreation on each render
  const stats = useMemo(() => [
    { value: t("hero.stat1.value"), label: t("hero.stat1.label"), color: "primary" },
    { value: t("hero.stat2.value"), label: t("hero.stat2.label"), color: "foreground" },
    { value: t("hero.stat3.value"), label: t("hero.stat3.label"), color: "accent" },
  ], [t]);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12" itemScope itemType="https://schema.org/WebPage">
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center" style={{ contain: 'layout style' }}>
          {/* Main Heading - LCP element */}
          <h1
            className="font-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 sm:mb-3 md:mb-4"
            style={{
              contain: 'layout style',
              animation: 'slide-up 0.6s ease-out forwards'
            }}
          >
            <span className="text-foreground">{t("hero.title1")}</span>
            <span
              className="text-gradient"
              style={{
                animation: 'rgb-shift 8s ease-in-out infinite, soft-glow 6s ease-in-out infinite'
              }}
            >
              {t("hero.title2")}
            </span>
            <span className="text-foreground">{t("hero.title3")}</span>
          </h1>

          {/* Subheading */}
          <p
            className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 px-4"
            style={{
              animation: 'fade-in 0.8s ease-out 0.2s forwards'
            }}
          >
            {t("hero.subtitle")}
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 md:mb-12 px-4"
            style={{
              animation: 'fade-in 0.8s ease-out 0.4s forwards'
            }}
          >
            <a
              href="https://wa.me/21629290065?text=Bonjour%2C%20je%20souhaite%20r%C3%A9server%20une%20session%20gaming."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm sm:text-base font-semibold h-10 sm:h-11 px-5 sm:px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_16px_hsl(var(--primary)/0.4)] transition-all duration-300 w-full sm:w-auto min-w-[160px] sm:min-w-[170px] hover:scale-[1.02] touch-manipulation min-h-[40px] active:scale-[0.98]"
            >
              <Gamepad2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {t("hero.cta1")}
            </a>
            <a
              href="https://wa.me/21629290065?text=Bonjour%2C%20je%20souhaite%20demander%20un%20devis%20pour%20une%20r%C3%A9paration."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm sm:text-base font-semibold h-10 sm:h-11 px-5 sm:px-6 bg-muted/40 border-2 border-primary/40 text-foreground hover:bg-muted/60 hover:border-primary transition-all duration-300 w-full sm:w-auto min-w-[160px] sm:min-w-[170px] hover:scale-[1.02] touch-manipulation min-h-[40px] active:scale-[0.98]"
            >
              <Wrench className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {t("hero.cta2")}
            </a>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 max-w-3xl mx-auto"
            style={{
              animation: 'fade-in 0.8s ease-out 0.6s forwards'
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center rounded-lg sm:rounded-xl bg-muted/30 border border-border/50 p-2 sm:p-2.5 md:p-3 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_hsl(var(--primary)/0.15)]"
              >
                <div className={`font-display text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-${stat.color} mb-1 sm:mb-1.5 drop-shadow-[0_6px_16px_hsl(var(--primary)/0.3)]`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-[9px] sm:text-[10px] md:text-xs lg:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(Hero);
