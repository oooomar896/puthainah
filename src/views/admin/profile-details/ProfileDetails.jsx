import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import LoadingPage from "../../LoadingPage";
import {
  useGetAdminByUserIdQuery,
  useGetProviderByUserIdQuery,
  useGetRequesterByUserIdQuery,
} from "../../../redux/api/usersDetails";

import UserData from "../../../components/shared/profile-details/UserData";
import HeadTitle from "../../../components/shared/head-title/HeadTitle";
import edit from "@/assets/icons/edit.svg";
import ProfileModal from "../../../components/shared/profile-modal/ProfileModal";
import SuspendModal from "../../../components/shared/suspend-modal/SuspendModal";
import AttachmentsTable from "../../../components/admin-components/projects/AttachmentsTable";

const ProfileDetails = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [open, setOpen] = useState(false);
  const [openSuspend, setOpenSuspend] = useState(false);

  const role = useSelector((state) => state.auth.role);
  const userId = useSelector((state) => state.auth.userId);

  const {
    data: providerDataResult,
    refetch: refetchProvider,
    isLoading: loadingProvider,
  } = useGetProviderByUserIdQuery(userId, { skip: role !== "Provider" });

  const {
    data: requesterDataResult,
    refetch: refetchRequester,
    isLoading: loadingRequester,
  } = useGetRequesterByUserIdQuery(userId, { skip: role !== "Requester" });

  const {
    data: adminDataResult,
    refetch: refetchAdmin,
    isLoading: loadingAdmin,
  } = useGetAdminByUserIdQuery(userId, { skip: role !== "Admin" });

  const providerData = Array.isArray(providerDataResult) ? providerDataResult[0] : providerDataResult;
  const requesterData = Array.isArray(requesterDataResult) ? requesterDataResult[0] : requesterDataResult;
  const adminData = Array.isArray(adminDataResult) ? adminDataResult[0] : adminDataResult;

  const isProvider = role === "Provider";
  const isRequester = role === "Requester";

  const data = isProvider
    ? providerData
    : isRequester
      ? requesterData
      : adminData;

  const refetch = isProvider
    ? refetchProvider
    : isRequester
      ? refetchRequester
      : refetchAdmin;

  const isLoading = loadingProvider || loadingRequester || loadingAdmin;

  if (isLoading || !data) {
    return <LoadingPage />;
  }

  return (
    <div className="py-10">
      <title>
        {isProvider
          ? t("profile.providerDetails")
          : isRequester
            ? t("profile.requesterDetails")
            : t("profile.adminDetails")}
      </title>
      <div className="container">
        {role !== "Admin" && (
          <button
            onClick={() => setOpen(true)}
            className="bg-primary py-2 px-4 rounded-lg text-white font-medium flex items-center gap-2 mr-auto"
          >
            <img src={typeof edit === "string" ? edit : (edit?.src || "")} alt="edit" className="w-6" loading="lazy" decoding="async" />{" "}
            {t("profile.editData")}
          </button>
        )}

        <ProfileModal
          open={open}
          setOpen={setOpen}
          data={data}
          refetch={refetch}
        />

        <HeadTitle
          title={
            isProvider
              ? t("profile.providerDetails")
              : isRequester
                ? t("profile.requesterDetails")
                : t("profile.adminDetails")
          }
          nav1={
            isProvider
              ? t("profile.providerNav")
              : isRequester
                ? t("profile.requesterNav")
                : t("profile.adminNav")
          }
          nav2={
            isProvider
              ? t("profile.providerDetails")
              : isRequester
                ? t("profile.requesterDetails")
                : t("profile.adminDetails")
          }
        />

        <UserData data={data} refetch={refetch} />
        {Array.isArray(data?.attachments) && data.attachments.length > 0 && (
          <AttachmentsTable attachments={data.attachments} />
        )}
        {role !== "Admin" && (
          <button
            onClick={() => setOpenSuspend(true)}
            className="w-fit bg-red-600 py-2 px-4 rounded-lg text-white font-medium flex items-center gap-2 mr-auto"
          >
            {t("profile.suspendAccount")}
          </button>
        )}

        <SuspendModal open={openSuspend} setOpen={setOpenSuspend} />
      </div>
    </div>
  );
};

export default ProfileDetails;
