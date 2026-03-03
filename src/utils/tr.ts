export const tr = (t: (k: string) => any, key: string, fallback: string) => {
  try {
    const raw = t(key) as unknown;
    const s = typeof raw === "string" ? raw : "";
    return s && s !== key ? s : fallback;
  } catch {
    return fallback;
  }
};
