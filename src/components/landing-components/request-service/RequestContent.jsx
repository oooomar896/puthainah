import React from "react";
import { useTranslation } from "react-i18next";

const RequestContent = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2 basis-1/2">
      <h3 className="font-medium">{t("formRequest.requestTitle")}</h3>
      <p className="text-xl font-normal lg:w-2/3">
        {t("formRequest.requestDescription")}
      </p>
    </div>
  );
};

export default RequestContent;
