"use client";

// import heroImg from "../../../../assets/images/hero.jpg";
const heroImg = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600";
import seeMore from "../../../../assets/icons/seeMore.svg";
import arrowSeeMore from "../../../../assets/icons/arrowSeeMore.svg";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import gsap from "gsap";

import { Palette, Hammer, Sofa } from "lucide-react";

const Hero = () => {
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const subTextRef = useRef(null);
  const btnRef = useRef(null);
  const pillarsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(textRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
      })
        .from(subTextRef.current, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        }, "-=0.6")
        .from(pillarsRef.current.children, {
          y: 30,
          opacity: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
        }, "-=0.4")
        .from(btnRef.current, {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        }, "-=0.6");
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const servicePillars = [
    { icon: <Palette className="w-5 h-5 md:w-8 md:h-8" />, label: "تصميم" },
    { icon: <Hammer className="w-5 h-5 md:w-8 md:h-8" />, label: "تنفيذ" },
    { icon: <Sofa className="w-5 h-5 md:w-8 md:h-8" />, label: "أثاث" },
  ];

  return (
    <section ref={heroRef} className="relative w-full h-[100vh] min-h-[800px] overflow-hidden bg-luxuryBlack grain-bg">
      <div className="w-full h-full relative">
        {/* Background Image with Ken Burns effect */}
        <div className="w-full h-full relative overflow-hidden">
          <Image
            src={heroImg}
            alt="Luxury Interior Design"
            fill
            priority
            className="object-cover object-center animate-ken-burns opacity-60"
          />
          {/* Multi-layered Gradients for depth and readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-luxuryBlack via-luxuryBlack/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-luxuryBlack via-transparent to-transparent"></div>

          {/* Animated Glow Elements */}
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[120px] animate-float"></div>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container">
            <div className="max-w-5xl text-right ml-auto">
              <div className="space-y-10">
                <div className="reveal-on-scroll active inline-flex items-center gap-4 px-5 py-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-full mb-2">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_#E2B13C]"></span>
                  <span className="text-secondary text-[10px] md:text-base font-black tracking-[0.2em] uppercase">
                    فخامة التصميم • دقة التنفيذ
                  </span>
                </div>

                <div ref={textRef}>
                  <h1 className="text-3xl xs:text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.2] md:leading-[1] mb-6 drop-shadow-2xl">
                    <span className="shimmer-text inline-block">{t("hero.title")}</span>
                  </h1>
                </div>

                <div ref={subTextRef} className="max-w-2xl ml-auto">
                  <p className="text-gray-400 text-lg md:text-3xl leading-relaxed font-medium border-r-2 md:border-r-4 border-secondary/50 pr-4 md:pr-8">
                    نعمل بمهنية ومعايير عالمية في التصميم الداخلي وصناعة الأثاث ؛ ليرى شركائنا جودة الحياة على طبيعتها .
                  </p>
                </div>

                {/* Service Pillars Grid - Responsive & Visually Bold */}
                <div
                  ref={pillarsRef}
                  className="flex flex-wrap justify-center md:justify-end gap-3 md:gap-6 pt-8 z-30"
                >
                  {servicePillars.map((pillar, idx) => (
                    <div
                      key={idx}
                      className="group flex flex-col items-center justify-center gap-2 md:gap-3 w-28 h-28 md:w-40 md:h-40 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] transition-all duration-700 hover:bg-secondary/20 hover:border-secondary/50 hover:-translate-y-3 cursor-default shadow-2xl"
                    >
                      <div className="text-secondary group-hover:scale-125 transition-transform duration-500">
                        {pillar.icon}
                      </div>
                      <span className="text-white font-black text-sm md:text-xl tracking-widest">{pillar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                ref={btnRef}
                className="mt-12 md:mt-16 flex flex-col xs:flex-row flex-wrap gap-4 md:gap-8 justify-end"
              >
                <Link
                  href={role === "Requester" ? "/request-service" : "/signup"}
                  className="group relative overflow-hidden py-4 md:py-6 px-8 md:px-14 bg-secondary text-luxuryBlack font-black text-lg md:text-2xl rounded-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(226,177,60,0.4)] active:scale-95 text-center"
                >
                  <span className="relative z-10">{role === "Requester" ? t("hero.requestService") : t("hero.registerNow")}</span>
                  <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </Link>

                <Link
                  href="/about-us"
                  className="group py-4 md:py-6 px-8 md:px-14 border-2 border-white/10 text-white font-bold text-lg md:text-2xl rounded-2xl backdrop-blur-sm hover:bg-white hover:text-luxuryBlack hover:border-white transition-all duration-500 active:scale-95 text-center"
                >
                  {t("hero.seeMore")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Glow for Mobile */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-secondary/10 to-transparent pointer-events-none lg:hidden"></div>

      {/* Elegant Scroll Indicator */}
      <div className="absolute bottom-16 left-12 z-30 hidden md:block">
        <a href="#services" className="flex flex-col items-center gap-6 group">
          <span className="text-[10px] uppercase font-black tracking-[0.6em] [writing-mode:vertical-rl] text-white/40 group-hover:text-secondary transition-colors transition-opacity duration-300">
            اكتشف التجربة
          </span>
          <div className="w-[1.5px] h-24 bg-white/10 relative overflow-hidden rounded-full">
            <div className="absolute top-0 left-0 w-full h-[30%] bg-secondary animate-parallax-scroll rounded-full"></div>
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
