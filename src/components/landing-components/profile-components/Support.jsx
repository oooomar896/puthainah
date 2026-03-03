import React, { useState } from "react";
import TicketModal from "./TicketModal";
import { useTranslation } from "react-i18next";

const Support = ({ refetch }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div>
      <div className="header flex flex-col">
        <h3 className="font-bold text-xl mb-3">{t("support.title")}</h3>
        <p>{t("support.description")}</p>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <a
          href="https://wa.me/+966547000015"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary/10 rounded-xl text-sm font-bold py-2 px-4 w-fit"
        >
          {t("support.whatsapp")}
        </a>

        <button
          onClick={() => setOpen(true)}
          className="bg-primary/10 rounded-xl text-sm font-bold py-2 px-4 w-fit"
        >
          {t("support.submitComplaint")}
        </button>
      </div>

      <TicketModal open={open} setOpen={setOpen} refetch={refetch} />

      <p className="text-sm text-[#6B7582] mt-2">
        {t("support.email")} support@Bacura.sa
      </p>
    </div>
  );
};

export default Support;
