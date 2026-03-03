const ICONS = {
  code: "/icons/services/code.svg",
  design: "/icons/services/design.svg",
  consulting: "/icons/services/consulting.svg",
  marketing: "/icons/services/marketing.svg",
  qa: "/icons/services/qa.svg",
  support: "/icons/services/support.svg",
  project: "/icons/services/project.svg",
};

export function getServiceIcon(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  const ar = `${title} ${description}`;
  const match = (t) => text.includes(t);
  const matchAr = (t) => ar.includes(t);
  if (match("program") || match("develop") || match("code") || matchAr("برمجة") || matchAr("تطوير")) return ICONS.code;
  if (match("design") || matchAr("تصميم") || matchAr("شعار")) return ICONS.design;
  if (match("consult") || match("analysis") || matchAr("استشار") || matchAr("تحليل")) return ICONS.consulting;
  if (match("market") || match("seo") || matchAr("تسويق")) return ICONS.marketing;
  if (match("test") || match("qa") || matchAr("اختبار") || matchAr("جودة")) return ICONS.qa;
  if (match("support") || match("help") || matchAr("دعم") || matchAr("مساعدة")) return ICONS.support;
  if (match("project") || matchAr("مشروع") || matchAr("مشاريع")) return ICONS.project;
  return ICONS.consulting;
}
