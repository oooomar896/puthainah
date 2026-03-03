import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css"; // الأساسي - إجباري
import "swiper/css/free-mode";
import "swiper/css/autoplay"; // أحيانًا مفيد لو autoplay مش شغال كويس
import NumberBg from "../../../shared/numberBg/NumberBg";
import { useGetCustomersQuery } from "../../../../redux/api/customersApi";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import OptimizedImage from "@/components/shared/OptimizedImage";
import { normalizeImageSrc } from "@/utils/image";

import { DEFAULT_CUSTOMERS } from "@/constants/landingData";

const Customers = () => {
  const { t } = useTranslation();
  const { data: customersData } = useGetCustomersQuery();

  // Use data from API if available, otherwise use default customers
  const customers = customersData && customersData.length > 0 ? customersData : DEFAULT_CUSTOMERS;

  // لو عدد العملاء أقل من عدد الشرائح المعروضة، نلغي الـ loop لتفادي تحذير Swiper
  const canLoop = customers.length >= 6;
  return (
    <section id="customers" className="relative py-24 sm:py-32 bg-white overflow-hidden">
      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <div className="space-y-4">
            <span className="text-secondary font-bold tracking-[0.3em] uppercase text-sm">عملاؤنا المتميزون</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-luxuryBlack leading-tight">
              {t("customers.titleHero")}
            </h2>
          </div>
          <p className="text-gray-500 text-lg md:text-xl max-w-3xl leading-relaxed">
            نعتز بثقة كبرى الشركات والجهات التي اخترناها لنكون جزءاً من قصص نجاحهم المعمارية والإنشائية.
          </p>
        </div>

        <div className="relative">
          <Swiper
            draggable={true}
            autoplay={{
              delay: 3000,
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
            }}
            className="customers-swiper"
            dir="ltr"
          >
            {customers?.map((logo, i) =>
              logo ? (
                <SwiperSlide key={i} className="py-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="group relative"
                  >
                    <div className="relative w-full aspect-square rounded-[40px] overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center p-10 transition-all duration-500 group-hover:bg-white group-hover:shadow-2xl">
                      <OptimizedImage
                        src={normalizeImageSrc(logo?.logo_url || logo?.imageBase64 || logo?.imageUrl || logo?.image_url)}
                        alt={logo?.name || `customer-${i}`}
                        fill
                        sizes="200px"
                        className="object-contain p-6 grayscale transition-all duration-500 group-hover:grayscale-0"
                      />
                    </div>
                    {logo?.name && (
                      <div className="mt-4 text-center">
                        <h3 className="text-sm font-black text-luxuryBlack group-hover:text-secondary transition-colors uppercase tracking-widest">
                          {logo.name}
                        </h3>
                      </div>
                    )}
                  </motion.div>
                </SwiperSlide>
              ) : null
            )}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Customers;
