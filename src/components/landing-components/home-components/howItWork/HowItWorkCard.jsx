"use client";

import React from "react";
import { AppLink } from "../../../../utils/routing";
import Image from "next/image";
import { motion } from "framer-motion";

const HowItWorkCard = ({ item }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-8 bg-white border border-gray-100 rounded-[32px] flex flex-col sm:flex-row gap-6 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] group"
    >
      <div className="shrink-0 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center font-black text-2xl text-secondary group-hover:bg-secondary group-hover:text-luxuryBlack transition-colors duration-500">
          {item?.id.toString().padStart(2, '0')}
        </div>
        {item?.id !== 3 && <div className="hidden sm:block w-[2px] h-full bg-gradient-to-b from-secondary/20 to-transparent mt-4 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
      </div>

      <div className="flex flex-col gap-4 text-right">
        <h3 className="font-bold text-xl md:text-2xl text-luxuryBlack group-hover:text-secondary transition-colors duration-300">
          {item?.title}
        </h3>
        <p className="text-gray-500 text-sm md:text-base leading-relaxed">
          {item?.description || "نلتزم بأعلى معايير الدقة والاحترافية لضمان تنفيذ مشروعك بأفضل صورة ممكنة."}
        </p>

        {item?.link && (
          <div className="pt-2">
            <AppLink href={item?.link?.href} className="inline-flex">
              <motion.div
                whileHover={{ gap: '1.5rem' }}
                className="flex items-center gap-4 text-luxuryBlack font-bold group/link"
              >
                <div className="w-10 h-10 rounded-full border border-secondary flex items-center justify-center group-hover/link:bg-secondary transition-all">
                  <Image
                    src={item?.link?.icon}
                    alt={item?.link?.name}
                    className="w-4 h-4 ltr:rotate-180"
                  />
                </div>
                <span className="text-sm border-b-2 border-secondary/30 group-hover/link:border-secondary transition-all">
                  {item?.link?.name}
                </span>
              </motion.div>
            </AppLink>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HowItWorkCard;
