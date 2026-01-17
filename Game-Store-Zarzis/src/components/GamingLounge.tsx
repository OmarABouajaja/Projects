import { Gamepad2, Users, Music, Coffee, Tv, Cookie, Monitor } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTunisianTime } from "@/hooks/useTunisianTime";
import { useData } from "@/contexts/DataContext";
import { useMemo, memo } from "react";
import { usePricing } from "@/hooks/usePricing";

const GamingLounge = () => {
  const { t, language } = useLanguage();
  const { isOpen, hoursUntilOpen, minutesUntilOpen, currentTime } = useTunisianTime();
  const { settings, consoles } = useData();
  const { data: pricingData } = usePricing();

  const availableConsoles = consoles.filter(c => c.status === 'available');
  const ps4Count = consoles.filter(c => c.console_type?.toLowerCase() === 'ps4').length;
  const ps5Count = consoles.filter(c => c.console_type?.toLowerCase() === 'ps5').length;
  const ps4Available = consoles.filter(c => c.console_type?.toLowerCase() === 'ps4' && c.status === 'available').length;
  const ps5Available = consoles.filter(c => c.console_type?.toLowerCase() === 'ps5' && c.status === 'available').length;

  const pricing = useMemo(() => {
    if (pricingData && pricingData.length > 0) {
      return pricingData.map(p => ({
        label: language === 'ar' ? p.name_ar : (language === 'fr' ? p.name_fr : p.name),
        price: `${p.price.toFixed(3)} DT`
      }));
    }

    // Fallback if no pricing data in DB
    const ps4Prices = settings?.timeSessionPrices?.PS4 || settings?.pricing_config?.PS4 || { 30: 2, 60: 3, 120: 5 };
    const ps5Prices = settings?.timeSessionPrices?.PS5 || settings?.pricing_config?.PS5 || { 30: 3, 60: 5, 120: 8 };
    const gamePrices = settings?.gameSessionPrices || settings?.pricing_config?.games || { FIFA: 1, 'Pro Evolution Soccer': 1 };

    const items = [
      { label: t("pricing.ps4_30min"), price: `${ps4Prices[30] || '2'} DT` },
      { label: t("pricing.ps4_1h"), price: `${ps4Prices[60] || '3'} DT` },
      { label: t("pricing.ps4_2h"), price: `${ps4Prices[120] || '5'} DT` },
      { label: t("pricing.ps5_30min"), price: `${ps5Prices[30] || '3'} DT` },
      { label: t("pricing.ps5_1h"), price: `${ps5Prices[60] || '5'} DT` },
      { label: t("pricing.ps5_2h"), price: `${ps5Prices[120] || '8'} DT` },
      { label: "FIFA", price: `${gamePrices.FIFA || '1'} DT` },
    ];

    return items;
  }, [pricingData, settings, language, t]);

  const features = useMemo(() => [
    { icon: Tv, labelKey: "gaming.feature1" },
    { icon: Gamepad2, labelKey: "gaming.feature2" },
    { icon: Users, labelKey: "gaming.feature3" },
    { icon: Coffee, labelKey: "gaming.feature4" },
    { icon: Cookie, labelKey: "gaming.feature5" },
    { icon: Music, labelKey: "gaming.feature6" },
  ], []);

  return (
    <section id="lounge" className="py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-transparent to-primary/10" />
      <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-secondary/20 rounded-full blur-[120px] md:blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/20 rounded-full blur-[120px] md:blur-[150px]" />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-10 items-center">
          <div>
            <span className="text-secondary font-display text-[10px] sm:text-xs md:text-sm tracking-widest uppercase mb-2 sm:mb-3 block">
              {t("gaming.badge")}
            </span>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4">
              {t("gaming.title1")}
              <span
                className="text-gradient"
                style={{
                  animation: 'rgb-shift 8s ease-in-out infinite'
                }}
              >
                {t("gaming.title2")}
              </span>
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base mb-4 sm:mb-5 md:mb-6 leading-relaxed">
              {t("gaming.subtitle")}
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 mb-4 sm:mb-5 md:mb-6">
              {features.map((feature, index) => (
                <div
                  key={feature.labelKey}
                  className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_20px_hsl(var(--primary)/0.15)] hover:-translate-y-0.5"
                >
                  <feature.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-[9px] sm:text-[10px] md:text-xs font-medium truncate">{t(feature.labelKey)}</span>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 mb-4 sm:mb-5 md:mb-6 border-secondary/30 hover:border-secondary/60 transition-all duration-300 hover:shadow-[0_6px_18px_hsl(var(--secondary)/0.18)]">
              {t("gaming.offer", { count: settings?.free_game_threshold?.games_required || 5, next: (settings?.free_game_threshold?.games_required || 5) + 1 })}
            </div>

            <a
              href="https://wa.me/21629290065?text=Bonjour%2C%20je%20souhaite%20r%C3%A9server%20une%20session%20gaming%20sur%20PS4%20ou%20PS5."
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm sm:text-base font-semibold h-10 sm:h-11 px-6 sm:px-7 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-[0_0_16px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)] transition-all duration-300 w-full sm:w-auto hover:scale-105 active:scale-100 touch-manipulation min-h-[40px]"
            >
              <Gamepad2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover:rotate-12" />
              {t("gaming.reserve")}
            </a>
          </div>

          <div className="relative">
            <div className="glass-card rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 neon-border hover:shadow-[0_22px_55px_hsl(var(--primary)/0.2)] transition-all duration-300">
              <h3
                className="font-display text-xl md:text-2xl font-bold mb-6 text-center text-gradient"
                style={{
                  animation: 'rgb-shift 8s ease-in-out infinite'
                }}
              >
                {t("gaming.pricing.title")}
              </h3>

              <div className="space-y-3 md:space-y-4">
                {(!settings?.tariff_display_mode || settings.tariff_display_mode === 'cards') && (
                  pricing.map((item, index) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_12px_28px_hsl(var(--primary)/0.16)] hover:-translate-x-1"
                    >
                      <span className="text-sm md:text-base font-medium">{item.label}</span>
                      <span className="font-display text-lg md:text-xl font-bold text-primary" style={{ height: '25px', display: 'inline-flex', alignItems: 'center' }}>{item.price}</span>
                    </div>
                  ))
                )}

                {settings?.tariff_display_mode === 'table' && (
                  <div className="overflow-hidden rounded-lg border border-border/50 bg-muted/20">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 bg-muted/50">
                          <th className="p-3 text-left font-medium">{t("gaming.table.session_type")}</th>
                          <th className="p-3 text-right font-medium">{t("gaming.table.price")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricing.map((item, index) => (
                          <tr key={item.label} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="p-3 font-medium">{item.label}</td>
                            <td className="p-3 text-right font-bold text-primary">{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {settings?.tariff_display_mode === 'comparison' && (
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {/* PS4 Column */}
                    <div className="space-y-2">
                      <div className="text-center font-bold text-blue-400 mb-2 border-b border-blue-500/30 pb-1">PS4</div>
                      {pricing.filter(p => p.label.includes('PS4')).map(item => (
                        <div key={item.label} className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-center">
                          <div className="text-xs text-muted-foreground">{item.label.replace('PS4 - ', '')}</div>
                          <div className="font-bold text-blue-400">{item.price}</div>
                        </div>
                      ))}
                    </div>
                    {/* PS5 Column */}
                    <div className="space-y-2">
                      <div className="text-center font-bold text-primary mb-2 border-b border-primary/30 pb-1">PS5</div>
                      {pricing.filter(p => p.label.includes('PS5')).map(item => (
                        <div key={item.label} className="p-2 rounded bg-primary/10 border border-primary/20 text-center">
                          <div className="text-xs text-muted-foreground">{item.label.replace('PS5 - ', '')}</div>
                          <div className="font-bold text-primary">{item.price}</div>
                        </div>
                      ))}
                    </div>
                    {/* Games Row */}
                    <div className="col-span-2 mt-2 pt-2 border-t border-border/30">
                      <div className="flex gap-2 justify-center flex-wrap">
                        {pricing.filter(p => !p.label.includes('PS4') && !p.label.includes('PS5')).map(item => (
                          <div key={item.label} className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs">
                            <span className="font-bold text-secondary">{item.label}:</span> {item.price}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-6 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm md:text-base">{t("dashboard.available_consoles")}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {ps5Available}/{ps5Count} PS5 • {ps4Available}/{ps4Count} PS4
                    </p>
                  </div>
                </div>
                <div
                  className={`px-4 py-2.5 rounded-full border transition-all duration-500 ${isOpen
                    ? "bg-green-500/20 border-green-500/50 neon-green-glow"
                    : "bg-red-500/20 border-red-500/50 neon-red-glow"
                    }`}
                  role="status"
                  aria-live="polite"
                  aria-label={isOpen ? t("gaming.open") : t("gaming.closed")}
                >
                  {isOpen ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_hsl(142_71%_45%)]" />
                        <span className="font-display text-sm md:text-base font-bold text-green-400 drop-shadow-[0_0_8px_hsl(142_71%_45%)]">{t("gaming.open")}</span>
                      </div>
                      <span className="text-[10px] md:text-xs text-muted-foreground font-medium">
                        {currentTime}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_hsl(0_84%_60%)]" />
                        <span className="font-display text-sm md:text-base font-bold text-red-400 drop-shadow-[0_0_8px_hsl(0_84%_60%)]">{t("gaming.closed")}</span>
                      </div>
                      {(hoursUntilOpen > 0 || minutesUntilOpen > 0) && (
                        <span className="text-[10px] md:text-xs text-muted-foreground font-medium text-center">
                          {t("gaming.opens.after")}{" "}
                          {hoursUntilOpen > 0 && (
                            <>
                              {hoursUntilOpen} {hoursUntilOpen === 1 ? t("gaming.opens.hour") : t("gaming.opens.hours")}
                              {minutesUntilOpen > 0 && " "}
                            </>
                          )}
                          {minutesUntilOpen > 0 && `${minutesUntilOpen} ${t("gaming.opens.minutes")}`}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(GamingLounge);
