import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css"; // الأساسي - إجباري
import "swiper/css/free-mode";
import "swiper/css/autoplay"; // أحيانًا مفيد لو autoplay مش شغال كويس
import NumberBg from "../../../shared/numberBg/NumberBg";
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
    <section id="partners" className="relative py-24 sm:py-32 bg-gray-50 overflow-hidden">
      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <div className="space-y-4">
            <span className="text-secondary font-bold tracking-[0.3em] uppercase text-sm">شركاء النجاح</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-luxuryBlack leading-tight">
              {t("partners.titleHero")}
            </h2>
          </div>
          <p className="text-gray-500 text-lg md:text-xl max-w-3xl leading-relaxed">
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
                        className="group flex flex-col items-center"
                      >
                        <div className="relative w-full aspect-square max-w-[160px] rounded-3xl bg-white border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all duration-500 flex items-center justify-center p-8 grayscale hover:grayscale-0">
                          <OptimizedImage
                            src={normalizeImageSrc(logo?.logo_url || logo?.imageBase64 || logo?.imageUrl || logo?.image_url)}
                            alt={logo?.name || `brand-${i}`}
                            fill
                            sizes="160px"
                            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        {logo?.name && (
                          <span className="mt-4 text-sm font-bold text-gray-400 group-hover:text-secondary uppercase tracking-widest transition-colors duration-300">
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
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <span className="text-gray-400 font-medium">نعتز بشركائنا المنضمين حديثاً.. ترقبوهم قريباً</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Partners;
