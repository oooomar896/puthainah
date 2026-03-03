import { supabase } from "@/lib/supabaseClient";
import { mcpLog } from "@/utils/logger";

/**
 * Custom base query for RTK Query using Supabase
 * Supports pagination, filtering, and CRUD operations
 */
export const supabaseBaseQuery = async (args) => {
  const {
    table,
    method = "GET",
    id,
    body,
    filters = {},
    pagination = {},
    orderBy = { column: "created_at", ascending: false },
    select = "*",
    joins = [],
  } = args;

  try {
    mcpLog("start", { table, method, id, filters: Object.keys(filters || {}), joins: (joins || []).length });

    if (!supabase) {
      throw new Error("Supabase client is not initialized");
    }

    let result;
    const baseSelect = typeof select === "string" && select.trim() ? select.trim() : "*";
    const safeJoins = Array.isArray(joins)
      ? joins.filter((j) => typeof j === "string" && j.trim().length > 0).map((j) => j.trim())
      : [];

    let selectString = baseSelect;
    if (safeJoins.length > 0) {
      selectString = `${baseSelect},${safeJoins.join(",")}`;
    }

    switch (method) {
      case "GET": {
        let query = supabase.from(table);

        if (safeJoins.length > 0) {
          query = query.select(selectString, { count: "exact" });
        } else {
          query = query.select(baseSelect, { count: "exact" });
        }

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === "object" && value.operator) {
              switch (value.operator) {
                case "gt": query = query.gt(key, value.value); break;
                case "lt": query = query.lt(key, value.value); break;
                case "gte": query = query.gte(key, value.value); break;
                case "lte": query = query.lte(key, value.value); break;
                case "like": query = query.like(key, value.value); break;
                case "ilike": query = query.ilike(key, value.value); break;
                default: query = query.eq(key, value.value);
              }
            } else {
              query = query.eq(key, value);
            }
          }
        });

        // Apply ordering
        if (orderBy.column) {
          query = query.order(orderBy.column, {
            ascending: orderBy.ascending !== false,
          });
        }

        // Apply pagination
        if (pagination.page && pagination.pageSize) {
          const from = (pagination.page - 1) * pagination.pageSize;
          const to = from + pagination.pageSize - 1;
          query = query.range(from, to);
        }

        if (id) {
          result = await query.eq("id", id).maybeSingle();
        } else {
          result = await query;
        }
        break;
      }
      case "POST":
        result = await supabase
          .from(table)
          .insert(body)
          .select(selectString)
          .single();
        break;
      case "PUT":
      case "PATCH": {
        let updateQuery = supabase.from(table).update(body);
        if (filters && Object.keys(filters).length > 0) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                updateQuery = updateQuery.in(key, value);
              } else {
                updateQuery = updateQuery.eq(key, value);
              }
            }
          });
        } else if (id) {
          updateQuery = updateQuery.eq("id", id);
        } else {
          throw new Error("Missing id or filters for update operation");
        }

        if (id || (filters && !Object.values(filters).some(Array.isArray))) {
          result = await updateQuery.select(selectString).single();
        } else {
          result = await updateQuery.select(selectString);
        }
        break;
      }
      case "DELETE": {
        let deleteQuery = supabase.from(table).delete();
        if (filters && Object.keys(filters).length > 0) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                deleteQuery = deleteQuery.in(key, value);
              } else {
                deleteQuery = deleteQuery.eq(key, value);
              }
            }
          });
        } else if (id) {
          deleteQuery = deleteQuery.eq("id", id);
        } else {
          throw new Error("Missing id or filters for delete operation");
        }
        result = await deleteQuery;
        break;
      }
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    if (result.error) {
      mcpLog("end", { ok: false, table, method, code: result.error.code, status: result.error.status });
      const errorMessage = result.error.message || "حدث خطأ أثناء تنفيذ العملية";

      if (result.error.code === "PGRST116" || result.error.status === 406 || result.error.code === "PGRST301") {
        return {
          error: {
            status: "NOT_ACCEPTABLE",
            data: result.error,
            message: "خطأ في تنسيق الطلب (406). قد تكون هناك مشكلة في الصلاحيات (RLS) أو في تنسيق الاستعلام.",
          },
        };
      }

      return {
        error: {
          status: "CUSTOM_ERROR",
          data: result.error,
          message: errorMessage,
        },
      };
    }

    mcpLog("end", { ok: true, table, method });
    const hasPagination = !!(pagination && pagination.page && pagination.pageSize);
    if (hasPagination) {
      return {
        data: {
          data: result.data,
          count: result.count ?? (Array.isArray(result.data) ? result.data.length : 0),
        },
      };
    }
    return { data: result.data };
  } catch (error) {
    const errorMessage = error?.message || error?.toString() || "حدث خطأ غير متوقع";
    mcpLog("end", { ok: false, table, method, error: String(errorMessage) });
    return {
      error: {
        status: "CUSTOM_ERROR",
        data: error,
        message: errorMessage,
      },
    };
  }
};
