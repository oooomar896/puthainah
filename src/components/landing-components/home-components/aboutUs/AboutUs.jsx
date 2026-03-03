import React, { useEffect, useRef } from "react";
import NumberBg from "../../../shared/numberBg/NumberBg";
import more from "../../../../assets/icons/moreabout.svg";
// import bgabout from "../../../../assets/images/bgabout.png";
const bgabout = "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&q=80&w=1600";
import Link from "next/link";
import Image from "next/image";
import { useLocation } from "@/utils/useLocation";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const AboutUs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animate Title
      gsap.from(titleRef.current, {
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // Animate Description
      gsap.from(descRef.current, {
        scrollTrigger: {
          trigger: descRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });

      // Animate Button (only if present)
      if (btnRef.current) {
        gsap.from(btnRef.current, {
          scrollTrigger: {
            trigger: btnRef.current,
            start: "top 85%",
          },
          y: 30,
          opacity: 0,
          duration: 0.8,
          delay: 0.4,
          ease: "power3.out",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div
      ref={containerRef}
      className="relative py-20 md:py-48 bg-luxuryBlack overflow-hidden grain-bg"
      id="about-us"
    >
      {/* Dynamic Background with high-end texture */}
      <div className="absolute inset-0 z-0">
        <Image src={bgabout} alt="" fill className="object-cover opacity-10 scale-110" />
        <div className="absolute inset-0 bg-gradient-to-l from-luxuryBlack via-luxuryBlack/95 to-transparent"></div>
      </div>

      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 md:gap-32">

          {/* Content Side - Precise & Luxurious */}
          <div className="flex-1 space-y-8 md:space-y-12 text-right">
            <div ref={titleRef} className="space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-4">
                <span className="text-secondary font-black tracking-[0.4em] uppercase text-[10px] md:text-sm">
                  قصة نجاح وشغف
                </span>
                <div className="w-10 md:w-16 h-[1.5px] bg-secondary/30"></div>
              </div>
              <h2 className="text-4xl xs:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight">
                تميزنا هو <span className="shimmer-text">سر نجاحنا</span>
              </h2>
            </div>

            <div ref={descRef} className="space-y-8 md:space-y-10">
              <p className="text-gray-400 text-lg md:text-3xl leading-relaxed max-w-4xl font-medium border-r-2 md:border-r-4 border-secondary/20 pr-4 md:pr-8">
                بثينة أعمال ليست مجرد منصة، بل هي كيان إبداعي يهدف إلى تغيير مفهوم التصميم الداخلي وتصنيع الأثاث الفاخر في المملكة.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 text-right pt-2 md:pt-6">
                <div className="group p-6 md:p-8 bg-white/[0.03] border border-white/10 rounded-[24px] md:rounded-[32px] transition-all hover:bg-white/[0.07] duration-500">
                  <h4 className="text-secondary font-black text-3xl md:text-5xl mb-1 md:mb-3 tracking-tighter">+100</h4>
                  <p className="text-gray-400 text-base md:text-lg font-bold">مشروع فريد</p>
                </div>
                <div className="group p-6 md:p-8 bg-secondary/[0.03] border border-secondary/10 rounded-[24px] md:rounded-[32px] transition-all hover:bg-secondary/[0.07] duration-500">
                  <h4 className="text-white font-black text-3xl md:text-5xl mb-1 md:mb-3 tracking-tighter">+15</h4>
                  <p className="text-secondary font-bold text-base md:text-lg">عام من الإبداع</p>
                </div>
              </div>
            </div>

            {/* Button */}
            {location.pathname === "/" && (
              <div ref={btnRef} className="pt-6 md:pt-10">
                <Link
                  href={"/about-us"}
                  className="group relative inline-flex items-center gap-6 md:gap-8 bg-white text-luxuryBlack px-8 md:px-12 py-4 md:py-6 rounded-2xl transition-all duration-500 hover:shadow-[0_20px_60px_rgba(255,255,255,0.15)] active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10 font-black text-lg md:text-2xl">
                    {t("about.more")}
                  </span>
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-luxuryBlack/5 flex items-center justify-center group-hover:bg-secondary transition-all duration-500">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-luxuryBlack rotate-180 transition-transform duration-500 group-hover:-translate-x-1 md:w-7 md:h-7 text-xs">
                      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Decorative Side - High-end Visuals */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
            <div className="relative group">
              <div className="relative z-10 w-full aspect-[4/5] rounded-[40px] md:rounded-[60px] overflow-hidden border border-white/5 shadow-3xl">
                <Image src={bgabout} alt="About Buthaina Business" fill className="object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-luxuryBlack via-transparent to-transparent opacity-80"></div>

                {/* Floating Info Overlays - Optimized for mobile */}
                <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-6 rounded-[24px] md:rounded-[30px] translate-y-4 opacity-100 lg:translate-y-10 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-700">
                    <p className="text-white font-bold text-sm md:text-lg">"نصمم لمستقبل يجمع بين الفخامة والعملية"</p>
                  </div>
                </div>
              </div>

              {/* Artistic Elements - Scaled for mobile */}
              <div className="absolute -top-6 -right-6 md:-top-12 md:-right-12 w-24 h-24 md:w-48 md:h-48 border-t-[4px] md:border-t-[6px] border-r-[4px] md:border-r-[6px] border-secondary/20 rounded-tr-[40px] md:rounded-tr-[80px] -z-10 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 md:-bottom-12 md:-left-12 w-24 h-24 md:w-48 md:h-48 border-b-[4px] md:border-b-[6px] border-l-[4px] md:border-l-[6px] border-secondary/20 rounded-bl-[40px] md:rounded-bl-[80px] -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

              {/* Floating Award Badge - Scaled for mobile */}
              <div className="absolute -bottom-4 right-4 md:-bottom-6 md:right-10 bg-secondary px-6 py-8 md:px-10 md:py-12 rounded-[30px] md:rounded-[40px] flex flex-col items-center gap-1 md:gap-2 shadow-[0_15px_30px_#E2B13C44] animate-float z-20">
                <span className="text-luxuryBlack font-black text-4xl md:text-6xl tracking-tighter">15</span>
                <span className="text-luxuryBlack font-black text-[10px] md:text-base text-center leading-[1.1] uppercase tracking-wider">سنة من<br />الإبداع</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
