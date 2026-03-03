import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";

const HeadTitle = ({
  title,
  nav1,
  nav2,
  type,
  status,
  typeProject,
  statusProject,
  hideBreadcrumbs = false,
}) => {
  const role = (useSelector((s) => s.auth.role) || "").toLowerCase();

  const requestStatusStyles = {
    207: { // Under Processing
      bg: "#FFF2EE",
      border: "#FFCDBD",
      text: "#B82E00",
    },
    8: { // Priced
      bg: "#EEFBF4",
      border: "#B2EECC",
      text: "#17663AB2",
    },
    21: { // Waiting Payment
      bg: "#F7F7F8",
      border: "#D1D1DB",
      text: "#066F1D",
    },
    10: { // Rejected
      bg: "#FEF0F4",
      border: "#FBB1C4",
      text: "#D50B3E",
    },
    11: { // Completed
      bg: "#FFF9EB",
      border: "#FFDA85",
      text: "#C78F0B",
    },
    204: { // Paid
      bg: "#FFF9EB",
      border: "#FFDA85",
      text: "#C78F0B",
    },
    7: { // New
      bg: "#EEFBF4",
      border: "#B2EECC",
      text: "#17663AB2",
    },
  };
  const requestCurrentStyle = requestStatusStyles[status];

  const projectStatusStyles = {
    600: {
      bg: "#FFF9EB",
      border: "#FFDA85",
      text: "#8A6100",
    },
    601: {
      bg: "#F7F7F8",
      border: "#D1D1DB",
      text: "#3F3F50",
    },
    602: {
      bg: "#FFF2EE",
      border: "#FFCDBD",
      text: "#B82E00",
    },
    603: {
      bg: "#EEFBF4",
      border: "#B2EECC",
      text: "#17663AB2",
    },
    604: {
      bg: "#FEF0F4",
      border: "#FBB1C4",
      text: "#D50B3E",
    },
    605: { bg: "#FFF9EB", border: "#FFDA85", text: "#C78F0B" },
    606: {
      bg: "#EEFBF4",
      border: "#B2EECC",
      text: "#17663AB2",
    },
    // Added project statuses
    15: { // Completed
      bg: "#EEFBF4",
      border: "#B2EECC",
      text: "#17663AB2",
    },
    13: { // Ongoing
      bg: "#F7F7F8",
      border: "#D1D1DB",
      text: "#066F1D",
    },
    17: { // Pending
      bg: "#FFF9EB",
      border: "#FFDA85",
      text: "#C78F0B",
    },
    18: { // Approved
      bg: "#EEFBF4",
      border: "#B2EECC",
      text: "#17663AB2",
    },
    19: { // Rejected
      bg: "#FEF0F4",
      border: "#FBB1C4",
      text: "#D50B3E",
    },
  };
  const projectCurrentStyle = projectStatusStyles[statusProject];

  return (
    <div className="flex items-center justify-between lg:w-1/2">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-2xl">{title}</h1>
        {!hideBreadcrumbs && (
          <div className="flex items-center gap-2">
            <Link
              href={
                (() => {
                  if (role === "admin") return "/admin";
                  if (role === "provider") return "/provider";
                  if (role === "requester") return "/home";
                  return "/";
                })()
              }
              className="group flex items-center gap-2 text-primary"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-all bg-primary/20 ring-2 ring-primary/30 shadow-sm group-hover:shadow-md group-active:scale-[0.98]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
              </span>
              <span className="text-xs font-bold">الصفحه الرئيسية</span>
            </Link>
            <span className="text-[#898A8D] text-xs">&gt;</span>
            <span className="text-[#898A8D] text-xs">{nav1}</span>
            <span className="text-[#898A8D] text-xs">&gt;</span>
            <span className="text-primary text-xs">{nav2}</span>
          </div>
        )}
      </div>
      {requestCurrentStyle && (
        <div
          className="rounded-lg text-sm py-1 px-2"
          style={{
            backgroundColor: requestCurrentStyle.bg,
            border: `1px solid ${requestCurrentStyle.border}`,
            color: requestCurrentStyle.text,
          }}
        >
          {type}
        </div>
      )}
      {projectCurrentStyle && (
        <div
          className="rounded-lg text-sm py-1 px-2"
          style={{
            backgroundColor: projectCurrentStyle.bg,
            border: `1px solid ${projectCurrentStyle.border}`,
            color: projectCurrentStyle.text,
          }}
        >
          {typeProject}
        </div>
      )}
    </div>
  );
};

export default HeadTitle;
