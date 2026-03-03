export const safeReplace = (router, url) => {
  try {
    const w = typeof window !== "undefined" ? window : null;
    if (!w || !router) return;
    const targetPath = (url || "").split("?")[0] || "/";
    if (w.location && w.location.pathname === targetPath) return;
    const lockKey = "__NAV_LOCK__";
    if (w[lockKey]) return;
    w[lockKey] = true;
    router.replace(url);
    setTimeout(() => {
      try {
        delete w[lockKey];
      } catch (e) {
        void e;
      }
    }, 800);
  } catch (e) {
    void e;
  }
};

export const safePush = (router, url) => {
  try {
    const w = typeof window !== "undefined" ? window : null;
    if (!w || !router) return;
    const targetPath = (url || "").split("?")[0] || "/";
    if (w.location && w.location.pathname === targetPath) return;
    const lockKey = "__NAV_LOCK__";
    if (w[lockKey]) return;
    w[lockKey] = true;
    router.push(url);
    setTimeout(() => {
      try {
        delete w[lockKey];
      } catch (e) {
        void e;
      }
    }, 800);
  } catch (e) {
    void e;
  }
};
