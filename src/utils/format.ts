import dayjs from "dayjs";

export const formatDate = (value?: string | Date | null, fmt: string = "DD/MM/YYYY", locale?: string) => {
  if (!value) return "-";
  const d = dayjs(value);
  if (!d.isValid()) return "-";
  return d.format(fmt);
};

export const formatAmount = (amount?: number | string | null, currency: string = "SAR") => {
  const n = Number(amount || 0);
  return `${n.toLocaleString()} ${currency}`;
};
