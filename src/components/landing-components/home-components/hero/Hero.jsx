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

const Hero = () => {
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(textRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
      gsap.from(btnRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative w-full h-screen overflow-hidden bg-luxuryBlack">
      <div className="w-full h-full relative">
        {/* Background Image with Ken Burns effect */}
        <div className="w-full h-full relative overflow-hidden">
          <Image
            src={heroImg}
            alt="Luxury Interior Design"
            fill
            priority
            className="object-cover object-center animate-ken-burns"
          />
          {/* Multi-layered Gradients for depth and readability */}
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-luxuryBlack via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-luxuryBlack/60 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-4xl text-right">
              <div
                ref={textRef}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-secondary/10 border border-secondary/30 rounded-full mb-6">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span className="text-secondary text-sm md:text-base font-bold tracking-[0.2em] uppercase">
                    فخامة التصميم، دقة التنفيذ
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-8xl font-black leading-[1.1] text-white">
                  <span className="block mb-2">{t("hero.title")}</span>
                  <span className="shimmer-text">منصة بثينة سليمان</span>
                </h1>

                <p className="text-gray-300 text-lg md:text-2xl max-w-2xl leading-relaxed font-medium">
                  نحن لا نصمم مجرد مساحات، بل نصنع تجارب حياتية استثنائية تعكس ذوقكم الرفيع وتحول الأحلام إلى واقع ملموس.
                </p>
              </div>

              <div
                ref={btnRef}
                className="mt-12 flex flex-wrap gap-6 justify-end"
              >
                <Link
                  href={role === "Requester" ? "/request-service" : "/signup"}
                  className="group relative overflow-hidden py-5 px-12 bg-secondary text-luxuryBlack font-black text-xl rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(226,177,60,0.5)] active:scale-95"
                >
                  <span className="relative z-10 font-black">{role === "Requester" ? t("hero.requestService") : t("hero.registerNow")}</span>
                  <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </Link>

                <Link
                  href="/about-us"
                  className="group py-5 px-12 border-2 border-white/20 text-white font-bold text-xl rounded-2xl hover:bg-white hover:text-luxuryBlack hover:border-white transition-all duration-500 active:scale-95"
                >
                  {t("hero.seeMore")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 hidden md:block">
        <a href="#services" className="flex flex-col items-center gap-4 group text-white/40 hover:text-secondary transition-all duration-300">
          <span className="text-[10px] uppercase font-bold tracking-[0.5em] [writing-mode:vertical-rl] opacity-60 group-hover:opacity-100 transition-opacity">اكتشف العالم</span>
          <div className="w-[1.5px] h-16 bg-white/10 relative overflow-hidden rounded-full">
            <div className="absolute top-0 left-0 w-full h-[30%] bg-secondary animate-parallax-scroll rounded-full"></div>
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
