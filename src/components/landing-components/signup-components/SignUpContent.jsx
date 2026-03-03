import React from "react";
import OptimizedImage from "@/components/shared/OptimizedImage";
import signupImg from "../../../assets/images/signup.png";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";

const SignUpContent = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isProvider = pathname === "/signup-provider";

  return (
    <div className="flex flex-col gap-9 basis-1/2">
      <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold lg:w-1/2">
        {isProvider ? (t("signup.titleProvider") || "انضم كشريك نجاح (مزود خدمة)") : t("signup.title")}
      </h1>
      <div className="hidden md:block">
        <OptimizedImage
          src={isProvider ? (process.env.NEXT_PUBLIC_PROVIDER_SIGNUP_IMAGE || (typeof signupImg === "string" ? signupImg : (signupImg?.src || ""))) : (process.env.NEXT_PUBLIC_SIGNUP_PROMO_IMAGE || (typeof signupImg === "string" ? signupImg : (signupImg?.src || "")))}
          alt={t("signup.promoAlt") || "صورة توعوية للأمان والخصوصية"}
          width={500}
          height={500}
          quality={85}
          className="max-w-[500px] max-h-[500px] object-contain"
          fallbackSrc={typeof signupImg === "string" ? signupImg : (signupImg?.src || "")}
        />
      </div>
      <div className="md:text-primary md:flex flex-col gap-8 text-white hidden">
        <p className="lg:text-xl text-sm font-normal lg:w-1/2">
          {isProvider ? (t("signup.descriptionProvider") || "ساهم معنا في تنفيذ مشاريع نوعية ووسع آفاق أعمالك.") : t("signup.description1")}
        </p>
        <p className="text-black">
          {isProvider ? (t("signup.descriptionSecondaryProvider") || "نوفر لك منصة متكاملة لإدارة عروضك ومشاريعك بكل سلاسة.") : t("signup.description2")}
        </p>
      </div>
    </div>
  );
};

export default SignUpContent;
