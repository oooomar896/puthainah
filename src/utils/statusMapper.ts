export const mapOrderStatus = (status: any) => {
  if (!status) return { id: null, code: null, nameAr: "-", nameEn: "-", color: "text-gray-500" };
  const id = status.id ?? null;
  const code = status.code ?? null;
  const nameAr = status.name_ar ?? status.nameAr ?? "-";
  const nameEn = status.name_en ?? status.nameEn ?? "-";
  const color = getStatusColorById(id, code);
  return { id, code, nameAr, nameEn, color };
};

export const getStatusColorById = (id?: number | null, code?: string | null) => {
  const idColorMap: Record<number, string> = {
    600: "text-yellow-500",
    601: "text-blue-500",
    602: "text-cyan-600",
    603: "text-green-600",
    604: "text-red-500",
    605: "text-gray-500",
    606: "text-gray-600",
  };
  if (id && idColorMap[id]) return idColorMap[id];
  const codeColorMap: Record<string, string> = {
    "waiting-approval": "text-yellow-500",
    accepted: "text-cyan-600",
    completed: "text-green-600",
    rejected: "text-red-500",
    processing: "text-blue-500",
  };
  if (code && codeColorMap[code]) return codeColorMap[code];
  return "text-black";
};
