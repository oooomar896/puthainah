"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import NumberBg from "../../../shared/numberBg/NumberBg";
// import joinNow from "../../../../assets/images/joinNow.jpg";
const joinNow = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop";

import { useSelector } from "react-redux";
import { AppLink } from "../../../../utils/routing";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const Join = () => {
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);

  return (
    <div className="relative py-24 bg-luxuryBlack overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full -ml-[250px] -mt-[250px] blur-[120px]"></div>

      <div className="relative z-20 container">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
          {/* Join Image Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative z-10 w-full aspect-video rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src={joinNow}
                alt="Join Bothina Suliman"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxuryBlack/40 to-transparent"></div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 space-y-8 text-right"
          >
            <div className="space-y-4">
              <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm">فرصتك للتميز</span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                {t("join.title")}
              </h2>
            </div>

            <p className="text-gray-400 text-lg leading-relaxed max-w-xl ml-auto">
              {t("join.description")}
            </p>

            <div className="pt-4">
              <AppLink
                href={role === "Requester" ? "/request-service" : "/signup"}
                className="group inline-flex items-center gap-6 bg-secondary hover:bg-white text-luxuryBlack font-black px-10 py-5 rounded-full transition-all duration-300 shadow-xl hover:shadow-secondary/20"
              >
                <ArrowLeft
                  className="w-6 h-6 rotate-180 transition-transform group-hover:-translate-x-2"
                />
                <span className="text-xl">
                  {role === "Requester" ? t("join.request") : t("join.signup")}
                </span>
              </AppLink>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Join;
