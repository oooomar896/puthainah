export const mcpLog = (label, payload) => {
  try {
    const enable = String(process.env.NEXT_PUBLIC_SUPABASE_MCP_LOG_ENABLE || "").toLowerCase();
    if (enable === "1" || enable === "true") {
      console.log(`[MCP] ${label}`, payload);
    }
  } catch {
    // Ignore logging errors
  }
};
