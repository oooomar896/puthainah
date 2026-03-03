import React from "react";
import { useTranslation } from "react-i18next";

const LoginContent = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-9 basis-1/2">
      <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold lg:w-1/2">
        {t("loginContent.welcome")}
      </h1>
      <p className="text-xl font-normal lg:w-1/2">
        {t("loginContent.subtitle")}
      </p>
      <p>{t("loginContent.description")}</p>
    </div>
  );
};

export default LoginContent;
