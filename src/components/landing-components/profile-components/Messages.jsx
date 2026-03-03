import React from "react";
import userTest from "../../../assets/images/userTest.png";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const Messages = ({ tickets }) => {
  const { t } = useTranslation();

  const latestTickets = [...(tickets || [])]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  return (
    <div>
      <h3 className="font-bold text-xl mb-3">{t("messages.title")}</h3>

      <div className="flex flex-col gap-4">
        {tickets && tickets.length > 0 ? (
          latestTickets.map((item) => (
            <div key={item?.id} className="flex items-center gap-4">
              <div className="image rounded-full w-14 h-14 overflow-hidden">
                <img
                  src={userTest}
                  alt="user"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="Info flex flex-col">
                <h5 className="font-medium text-base">{item?.title}</h5>
                <p className="text-sm font-normal text-[#6B7582] truncate max-w-xs">
                  {item?.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">{t("messages.noMessages")}</p>
        )}

        <Link
          href="/tickets"
          className="bg-primary/10 rounded-xl text-sm font-bold py-2 px-4 w-fit self-end"
        >
          {t("messages.goToMessages")}
        </Link>
      </div>
    </div>
  );
};

export default Messages;
