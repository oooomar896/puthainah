"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import HeadTitle from "../../../components/admin-components/users-details/HeadTitle";
import ProjectListInfo from "../../../components/admin-components/projects/ProjectListInfo";
import { useParams } from "next/navigation";
import { useGetProjectDetailsQuery } from "../../../redux/api/projectsApi";
import LoadingPage from "../../LoadingPage";
import NotFound from "../../not-found/NotFound";
import ProjectDescription from "../../../components/admin-components/projects/ProjectDescription";
import AttachmentsTable from "../../../components/admin-components/projects/AttachmentsTable";
import UploadAdminAttachments from "../../../components/shared/forms-end-project/UploadAdminAttachments";
import ReassignRequest from "../../../components/admin-components/projects/ReassignRequest";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import ProjectDeliverables from "../../../components/landing-components/request-service/ProjectDeliverables";
import ProjectChat from "@/components/shared/ProjectChat";
import { useSelector } from "react-redux";

const ProjectsAdminDetails = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const { userId } = useSelector((state) => state.auth);
  const [orderAttachments, setOrderAttachments] = useState([]);
  const [requestAttachments, setRequestAttachments] = useState([]);
  const [attachmentGroupKey, setAttachmentGroupKey] = useState("");
  const [phaseLookup, setPhaseLookup] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams();
  const {
    data: projectData,
    isLoading: loadingProject,
    refetch,
  } = useGetProjectDetailsQuery({ id });

  useEffect(() => {
    const fetchAttachmentsByGroupKey = async (groupKey, setter) => {
      try {
        if (!groupKey || !supabase) {
          setter([]);
          return;
        }
        const { data: group } = await supabase
          .from("attachment_groups")
          .select("id,group_key")
          .eq("group_key", groupKey)
          .maybeSingle();
        if (!group?.id) {
          setter([]);
          return;
        }
        const { data: files } = await supabase
          .from("attachments")
          .select("id,file_path,file_name,content_type,size_bytes,request_phase_lookup_id,attachment_uploader_lookup_id,created_at")
          .eq("group_id", group.id);
        const mapped = (files || []).map((f) => ({
          id: f.id,
          path: f.file_path,
          filePathUrl: f.file_path,
          fileName: f.file_name,
          contentType: f.content_type,
          sizeBytes: f.size_bytes,
          requestPhaseLookupId: f.request_phase_lookup_id,
          attachmentUploaderLookupId: f.attachment_uploader_lookup_id,
          created_at: f.created_at,
        }));
        setter(mapped);
      } catch {
        setter([]);
      }
    };
    const orderGroupKey = projectData?.order_attachments_group_key || projectData?.orderAttachmentsGroupKey || "";
    const requestGroupKey = projectData?.request?.attachments_group_key || "";
    setAttachmentGroupKey(orderGroupKey || "");
    fetchAttachmentsByGroupKey(orderGroupKey, setOrderAttachments);
    fetchAttachmentsByGroupKey(requestGroupKey, setRequestAttachments);
  }, [projectData]);

  useEffect(() => {
    const loadPhaseLookup = async () => {
      try {
        const { data: type } = await supabase.from("lookup_types").select("id").eq("code", "request-phase").maybeSingle();
        if (!type?.id) {
          setPhaseLookup({});
          return;
        }
        const { data: values } = await supabase
          .from("lookup_values")
          .select("id,name_ar,name_en,code")
          .eq("lookup_type_id", type.id);
        const map = {};
        (values || []).forEach((v) => {
          map[v.id] = { name_ar: v.name_ar, name_en: v.name_en, code: v.code };
        });
        setPhaseLookup(map);
      } catch {
        setPhaseLookup({});
      }
    };
    loadPhaseLookup();
  }, []);

  const phasesTimeline = useMemo(() => {
    const all = [...orderAttachments, ...requestAttachments];
    const byPhase = {};
    all.forEach((att) => {
      const pid = att.requestPhaseLookupId || null;
      if (!pid) return;
      if (!byPhase[pid]) byPhase[pid] = [];
      byPhase[pid].push(att);
    });
    const entries = Object.entries(byPhase).map(([pid, list]) => {
      const sorted = list.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const meta = phaseLookup[Number(pid)] || {};
      return {
        id: Number(pid),
        name_ar: meta.name_ar || "مرحلة",
        name_en: meta.name_en || "Phase",
        code: meta.code || String(pid),
        count: list.length,
        first_at: sorted[0]?.created_at || null,
        last_at: sorted[sorted.length - 1]?.created_at || null,
      };
    });
    return entries.sort((a, b) => Number(a.code) - Number(b.code));
  }, [orderAttachments, requestAttachments, phaseLookup]);

  if (loadingProject) return <LoadingPage />;
  if (!projectData) return <NotFound />;

  // Map the data to expected format
  const mappedData = {
    ...projectData,
    orderNumber: projectData?.id?.substring(0, 8) || 'N/A',
    orderStatus: projectData?.status
      ? { id: projectData.status.id, nameAr: projectData.status.name_ar, nameEn: projectData.status.name_en }
      : null,
    description: projectData?.request?.description || projectData?.order_title,
    startDate: projectData?.start_date || projectData?.request?.created_at || projectData?.created_at || null,
    endDate: projectData?.end_date || projectData?.completed_at || projectData?.updated_at || null,
    servicePricing: typeof projectData?.request?.service?.base_price === "number" ? projectData.request.service.base_price : null,
    services: projectData?.request?.service
      ? [{ titleAr: projectData.request.service.name_ar, titleEn: projectData.request.service.name_en }]
      : [],
    requester: { fullName: projectData?.request?.requester?.name || null },
    providers: projectData?.provider?.name ? [{ fullName: projectData.provider.name }] : [],
    orderAttachments,
    requestAttachments,
    attachmentGroupKey,
  };

  return (
    <div className="py-10">
      <title>
        {`${t("projects.projectDetailsTitle")} #${mappedData.orderNumber}`}
      </title>
      <meta name="description" content={mappedData.description} />
      <div className="container">
        <HeadTitle
          title={`${t("projects.projectDetailsTitle")} #${mappedData.orderNumber}`}
          nav1={t("projects.projectManagement")}
          nav2={t("projects.projectDetails")}
          typeProject={
            lang === "ar"
              ? mappedData.orderStatus?.name_ar
              : mappedData.orderStatus?.name_en
          }
          statusProject={mappedData.orderStatus?.id}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6 xl:gap-8 mt-5">
          <div className="lg:basis-1/2 w-full bg-white shadow-lg overflow-hidden rounded-xl">
            <ProjectListInfo data={mappedData} />
          </div>
          <div className="lg:basis-1/2 w-full bg-white shadow-lg overflow-hidden rounded-xl p-5">
            <ProjectDescription des={mappedData.description} />
          </div>
        </div>

        <AttachmentsTable
          title={t("projects.projectAttachments")}
          attachments={mappedData.orderAttachments}
        />
        <AttachmentsTable
          title={t("projects.requesterAttachments")}
          attachments={mappedData.requestAttachments}
        />
        <UploadAdminAttachments projectData={mappedData} refetch={refetch} />
        {phasesTimeline.length > 0 && (
          <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 mt-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">{t("projects.phases") || "مراحل المشروع"}</h3>
            <div className="space-y-3">
              {phasesTimeline.map((ph) => (
                <div key={ph.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="font-bold text-gray-800">{lang === "ar" ? ph.name_ar : ph.name_en}</div>
                  <div className="text-[11px] text-gray-600">#{ph.code}</div>
                  <div className="text-[12px] text-gray-700 font-medium">عدد المرفقات: {ph.count}</div>
                  <div className="text-[11px] text-gray-500">{ph.first_at ? new Date(ph.first_at).toLocaleString("ar-EG") : "-"}</div>
                  <div className="text-[11px] text-gray-500">{ph.last_at ? new Date(ph.last_at).toLocaleString("ar-EG") : "-"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 mt-6">
          <ProjectChat orderId={projectData?.id} userId={userId} title={t("projects.chat", "محادثة المشروع")} />
        </div>

        {projectData?.id && (
          <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 mt-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">{t("projects.deliverables") || "مستندات التسليم"}</h3>
            <ProjectDeliverables orderId={projectData.id} />
          </div>
        )}
        {(mappedData.orderStatus?.id === 19 ||
          mappedData.orderStatus?.id === 20) && (
            <ReassignRequest refetch={refetch} />
          )}
      </div>
    </div>
  );
};

export default ProjectsAdminDetails;
