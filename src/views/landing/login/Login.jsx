import React, { useEffect } from "react";
import LoginContent from "../../../components/landing-components/login-components/LoginContent";
import LoginForm from "../../../components/landing-components/login-components/LoginForm";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="relative min-h-screen mb-6 md:mb-12 lg:mb-20">
      <title>{t("loginContent.subtitle")}</title>
      <meta name="description" content={t("loginContent.description")} />
      <div className="absolute top-0 left-0 w-full z-10 h-screen lg:h-[60vh] bg-primary py-20"></div>
      <div className="container">
        <div className=" relative z-20 flex lg:flex-row flex-col gap-3 text-white pt-6 sm:pt-8 md:pt-10 lg:pt-16 xl:pt-20">
          <LoginContent />
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
