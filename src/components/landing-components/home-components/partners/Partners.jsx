import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";
import { useGetPartnersQuery } from "../../../../redux/api/partnersApi";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import OptimizedImage from "@/components/shared/OptimizedImage";
import { normalizeImageSrc } from "@/utils/image";

import { DEFAULT_PARTNERS } from "@/constants/landingData";

const Partners = () => {
  const { t } = useTranslation();
  const { data: partnersData } = useGetPartnersQuery();

  // Use data from API if available, otherwise use default partners
  const partners = partnersData && partnersData.length > 0 ? partnersData : DEFAULT_PARTNERS;
  const hasPartners = partners.length > 0;
  // لو عدد الشركاء أقل من عدد الشرائح المعروضة، نلغي الـ loop لتفادي تحذير Swiper
  const canLoop = partners.length >= 6;
  return (
    <section id="partners" className="relative py-24 sm:py-32 bg-luxuryBlack overflow-hidden grain-bg">
      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <div className="space-y-4">
            <span className="text-secondary font-black tracking-[0.4em] uppercase text-xs md:text-sm">شركاء النجاح</span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
              {t("partners.titleHero")}
            </h2>
          </div>
          <p className="text-gray-400 text-lg md:text-2xl max-w-4xl leading-relaxed font-medium">
            {t("partners.landingDescription")}
          </p>
        </div>

        <div className="relative">
          {hasPartners ? (
            <div className="py-4">
              <Swiper
                draggable={true}
                autoplay={{
                  delay: 2000,
                  disableOnInteraction: false,
                }}
                speed={1500}
                loop={canLoop}
                modules={[Autoplay, FreeMode]}
                breakpoints={{
                  320: { slidesPerView: 2, spaceBetween: 20 },
                  480: { slidesPerView: 3, spaceBetween: 30 },
                  768: { slidesPerView: 4, spaceBetween: 40 },
                  1024: { slidesPerView: 5, spaceBetween: 50 },
                  1280: { slidesPerView: 6, spaceBetween: 60 },
                }}
                className="partners-swiper"
                dir="ltr"
              >
                {partners?.map((logo, i) =>
                  logo ? (
                    <SwiperSlide key={i} className="py-8">
                      <motion.div
                        whileHover={{ y: -10 }}
                        className="group flex flex-col items-center gap-6"
                      >
                        <div className="relative w-full aspect-square max-w-[180px] rounded-[40px] bg-white/[0.03] border border-white/10 shadow-xl group-hover:bg-white/[0.07] group-hover:border-secondary/30 transition-all duration-500 flex items-center justify-center p-10 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100">
                          <OptimizedImage
                            src={normalizeImageSrc(logo?.logo_url || logo?.imageBase64 || logo?.imageUrl || logo?.image_url)}
                            alt={logo?.name || `brand-${i}`}
                            width={120}
                            height={120}
                            sizes="180px"
                            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        {logo?.name && (
                          <span className="text-sm font-black text-gray-500 group-hover:text-secondary uppercase tracking-[0.3em] transition-colors duration-300">
                            {logo.name}
                          </span>
                        )}
                      </motion.div>
                    </SwiperSlide>
                  ) : null
                )}
              </Swiper>
            </div>
          ) : (
            <div className="text-center py-24 bg-white/[0.02] rounded-[40px] border border-dashed border-white/10">
              <span className="text-gray-500 font-black text-xl tracking-widest uppercase">نعتز بشركائنا المنضمين حديثاً.. ترقبوهم قريباً</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Partners;
