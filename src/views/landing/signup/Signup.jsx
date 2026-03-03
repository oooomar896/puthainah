import React, { useEffect } from "react";
import SignUpContent from "../../../components/landing-components/signup-components/SignUpContent";
import SignupForm from "../../../components/landing-components/signup-components/SignupForm";
import { useTranslation } from "react-i18next";

const Signup = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="relative min-h-screen mb-20">
      <title> {t("signup.title")}</title>
      <meta name="description" content={t("signup.description1")} />
      <div className="absolute top-0 left-0 w-full z-10 lg:h-[60vh] bg-primary py-20"></div>
      <div className="container">
        <div className=" relative z-20 flex lg:flex-row flex-col gap-3 text-white pt-6 sm:pt-8 md:pt-10 lg:pt-16 xl:pt-20">
          <SignUpContent />
          <SignupForm />
        </div>
      </div>
    </div>
  );
};

export default Signup;
