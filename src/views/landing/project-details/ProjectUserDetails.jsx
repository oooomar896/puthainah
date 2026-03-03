import React, { useContext, useEffect, useState } from "react";
import HeadTitle from "@/components/admin-components/users-details/HeadTitle";
import ProjectListInfo from "@/components/admin-components/projects/ProjectListInfo";
import { useParams } from "@/utils/useParams";
import { useGetProjectDetailsQuery } from "@/redux/api/projectsApi";
import LoadingPage from "../../LoadingPage";
import NotFound from "../../not-found/NotFound";
import ProjectDescription from "@/components/admin-components/projects/ProjectDescription";
import AttachmentsTable from "@/components/admin-components/projects/AttachmentsTable";
import UploadAdminAttachments from "../../../components/shared/forms-end-project/UploadAdminAttachments";
import { useSelector } from "react-redux";
import AddReviewModal from "../../../components/landing-components/add-rate/AddRateModal";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";

import ProjectChat from "@/components/shared/ProjectChat";

const ProjectUserDetails = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const { role, userId } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { id } = useParams();
  const {
    data,
    isLoading: loadingProject,
    refetch,
  } = useGetProjectDetailsQuery({ id });

  if (loadingProject) {
    return <LoadingPage />;
  }

  if (!data) {
    return <NotFound />;
  }
  return (
    <div className="py-6">
      <title>{`${t("projectDetails.title")} #${data?.id?.slice(0, 8)
        }`}</title>
      <meta name="description" content={data?.description} />
      <div className="container">
        <HeadTitle
          title={`${t("projectDetails.title")} #${data?.id?.slice(0, 8)}`}
          nav1={t("projectDetails.nav1")}
          nav2={t("projectDetails.nav2")}
          typeProject={
            lang === "ar"
              ? (data?.status?.name_ar || data?.orderStatus?.nameAr)
              : (data?.status?.name_en || data?.orderStatus?.nameEn)
          }
          statusProject={data?.status?.id || data?.orderStatus?.id}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6 xl:gap-8 mt-5">
          <div className="lg:basis-1/2 w-full bg-white shadow-lg overflow-hidden rounded-xl">
            <ProjectListInfo data={data} />
          </div>
          <div className="lg:basis-1/2 w-full bg-white shadow-lg overflow-hidden rounded-xl p-5">
            <ProjectDescription des={data?.description} />
          </div>
        </div>
        {/* <AttachmentsTable
          title={"المرفقات الخاصة بالمشروع"}
          attachments={data?.orderAttachments}
        /> */}
        <AttachmentsTable
          title={t("projectDetails.projectAttachments")}
          attachments={data?.orderAttachments?.filter(
            (att) => att.attachmentUploaderLookupId !== 700
          )}
        />
        <AttachmentsTable
          title={t("projectDetails.requesterAttachments")}
          attachments={data?.requestAttachments}
        />
        <UploadAdminAttachments projectData={data} refetch={refetch} />

        <div className="mt-8">
          <ProjectChat orderId={data?.id} userId={userId} title={t("projectDetails.chat", "محادثة المشروع")} />
        </div>

        {role === "Requester" &&
          !data?.isRated &&
          data?.orderStatus?.id === 15 && (
            <button
              onClick={() => {
                setOrderId(data.id);
                setOpen(true);
              }}
              className="bg-green-600 text-white px-10 py-4 rounded-lg hover:bg-green-700 transition text-base font-bold mx-auto block"
            >
              {t("projectDetails.addReview")}
            </button>
          )}
        <AddReviewModal
          open={open}
          setOpen={setOpen}
          orderId={orderId}
          refetch={refetch}
        />
      </div>
    </div>
  );
};

export default ProjectUserDetails;
