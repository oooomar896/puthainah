import React, { useEffect, useRef } from "react";
import NumberBg from "../../../shared/numberBg/NumberBg";
import ServiceList from "./ServiceList";
import { useLocation } from "@/utils/useLocation";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Services = ({ data, isLoading }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animate Header
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        }
      });

      tl.from(titleRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
      })
        .from(descRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out"
        }, "-=0.3")
        .from(listRef.current, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out"
        }, "-=0.3");

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative w-full py-24 sm:py-32 bg-luxuryBlack overflow-hidden"
    >
      {/* Background Decorative Element - High-end glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[160px]"></div>
      </div>

      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 mb-24">
          <div ref={titleRef} className="space-y-6">
            <span className="text-secondary font-black tracking-[0.5em] uppercase text-xs sm:text-sm">خدماتنا الفاخرة</span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
              نصنع لك <span className="shimmer-text">التميز</span>
            </h2>
          </div>

          <p ref={descRef} className="text-gray-400 text-lg md:text-2xl max-w-4xl leading-relaxed font-medium">
            نقدم مجموعة متكاملة من الخدمات التقنية والجمالية التي تهدف إلى تحويل مساحاتكم إلى أيقونات من الفخامة والذكاء التكنولوجي.
          </p>
        </div>

        {/* Services Grid Overlay */}
        <div ref={listRef}>
          <ServiceList data={data} isLoading={isLoading} />
        </div>
      </div>
    </section>
  );
};

export default Services;
