import Link from "next/link";
import React from "react";
import OptimizedImage from "@/components/shared/OptimizedImage";
import { ServiceIcon } from "@/constants/servicesData";
import { motion } from "framer-motion";

const ServiceCard = ({ icon, title, description, index, isActive, color, lang }) => {
  return (
    <motion.div
      whileHover={{ y: -12, transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] } }}
      className="relative h-full rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl transition-all duration-500 hover:bg-white/10 hover:border-secondary/30 hover:shadow-[0_40px_80px_rgba(226,177,60,0.15)] group p-10 flex flex-col gap-8 overflow-hidden"
    >
      {/* Dynamic Background Glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] transition-all duration-1000 group-hover:bg-secondary/20 group-hover:scale-150"></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex flex-col">
          <span className="text-4xl font-black text-white/5 group-hover:text-secondary/20 transition-colors duration-500 uppercase tracking-tighter">
            {index.toString().padStart(2, '0')}
          </span>
        </div>

        {isActive === false ? (
          <span className="px-4 py-1.5 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/20">Coming Soon</span>
        ) : (
          <div className="flex items-center gap-2.5 px-4 py-1.5 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full border border-secondary/20">
            <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></div>
            Online
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col flex-grow">
        <div className="mb-10 w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-700 group-hover:bg-secondary group-hover:border-secondary group-hover:shadow-[0_20px_40px_rgba(226,177,60,0.4)] group-hover:-translate-y-2">
          <ServiceIcon icon={icon} color={color} size={40} framed={false} />
        </div>

        <div className="flex flex-col gap-5">
          <h3 className="font-black text-2xl md:text-3xl text-white group-hover:text-secondary transition-colors duration-300 leading-tight">
            {title}
          </h3>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed font-medium line-clamp-4 transition-colors group-hover:text-gray-300">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-10 pt-8 relative z-10 border-t border-white/10 flex justify-between items-center group/btn">
        <Link href="/request-service" className="flex items-center gap-4 text-white font-black text-lg transition-all duration-300 hover:gap-6">
          <span className="group-hover/btn:text-secondary transition-colors">
            {lang === "ar" ? "ابدأ مشروعك الآن" : "Start Project"}
          </span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-all duration-300 group-hover/btn:translate-x-2 ${lang === 'ar' ? 'rotate-180' : ''}`}>
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-secondary" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
