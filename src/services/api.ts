import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']
type TableName = keyof Tables

export class BaseService {
  protected tableName: TableName

  constructor(tableName: TableName) {
    this.tableName = tableName
  }

  protected async handleSupabaseOperation<T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      if (!supabase) {
        return { data: null, error: 'Supabase client not initialized' }
      }
      const { data, error } = await operation()

      if (error) {
        if (error.message?.includes("schema cache") || error.code === "PGRST116") {
          console.warn(`Supabase: Table ${this.tableName} not ready or missing. Using fallback data.`);
        } else {
          console.error(`Error in ${this.tableName}:`, error.message || error)
        }
        return { data: null, error: error.message || 'An error occurred' }
      }

      return { data, error: null }
    } catch (error: any) {
      console.error(`Unexpected error in ${this.tableName}:`, error?.message || error)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  async getAll<T = any>() {
    return this.handleSupabaseOperation<T[]>(async () => {
      const { data, error } = await supabase!
        .from(this.tableName as any)
        .select('*')
      return { data, error }
    })
  }

  async getById<T = any>(id: string) {
    return this.handleSupabaseOperation<T>(async () => {
      const { data, error } = await supabase!
        .from(this.tableName as any)
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    })
  }

  async create<T = any>(data: any) {
    return this.handleSupabaseOperation<T>(async () => {
      const { data: createdData, error } = await (supabase as any)
        .from(this.tableName as any)
        .insert(data)
        .select()
        .single()
      return { data: createdData, error }
    })
  }

  async update<T = any>(id: string, data: Record<string, any>) {
    return this.handleSupabaseOperation<T>(async () => {
      const { data: updatedData, error } = await (supabase as any)
        .from(this.tableName as any)
        .update(data)
        .eq('id', id)
        .select()
        .single()
      return { data: updatedData, error }
    })
  }

  async delete(id: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase!
        .from(this.tableName)
        .delete()
        .eq('id', id)
      return { data, error }
    })
  }
}

export class ProfileService extends BaseService {
  constructor() {
    super('profiles')
  }

  async getByEmail(email: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase!
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()
      return { data, error }
    })
  }

  async getByRole(role: 'Admin' | 'Provider' | 'Requester') {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase!
        .from('profiles')
        .select('*')
        .eq('role', role)
      return { data, error }
    })
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.update(userId, { avatar_url: avatarUrl })
  }

  async toggleBlock(userId: string, isBlocked: boolean) {
    return this.update(userId, { is_blocked: isBlocked })
  }

  async toggleSuspend(userId: string, isSuspended: boolean) {
    return this.update(userId, { is_suspended: isSuspended })
  }
}

export class RequestService extends BaseService {
  constructor() {
    super('requests')
  }

  async getByRequester(requesterId: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase!
        .from('requests')
        .select(`
          *,
          service:services(*),
          requester:requesters!requests_requester_id_fkey(*),
          provider:providers!requests_provider_id_fkey(*),
          status:lookup_values!requests_status_id_fkey(*)
        `)
        .eq('requester_id', requesterId)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async getByProvider(providerId: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase!
        .from('requests')
        .select(`
          *,
          service:services(*),
          requester:requesters!requests_requester_id_fkey(*),
          provider:providers!requests_provider_id_fkey(*),
          status:lookup_values!requests_status_id_fkey(*)
        `)
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async getPending() {
    return this.handleSupabaseOperation(async () => {
      const { data: typeRow } = await (supabase as any)
        .from('lookup_types')
        .select('id')
        .eq('code', 'request-status')
        .single()
      const { data: statusRow } = await (supabase as any)
        .from('lookup_values')
        .select('id')
        .eq('lookup_type_id', typeRow?.id)
        .eq('code', 'pending')
        .single()
      const statusId = statusRow?.id
      const { data, error } = await (supabase as any)
        .from('requests')
        .select(`
          *,
          service:services(*),
          requester:requesters!requests_requester_id_fkey(*),
          status:lookup_values!requests_status_id_fkey(*)
        `)
        .eq('status_id', statusId)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async updateStatus(requestId: string, statusCode: string) {
    return this.handleSupabaseOperation(async () => {
      const { data: typeRow } = await (supabase as any)
        .from('lookup_types')
        .select('id')
        .eq('code', 'request-status')
        .single()
      const { data: statusData } = await (supabase as any)
        .from('lookup_values')
        .select('id')
        .eq('lookup_type_id', typeRow?.id)
        .eq('code', statusCode)
        .single()

      if (!statusData) {
        return { data: null, error: { message: 'Invalid status code' } }
      }

      const { data, error } = await (supabase as any)
        .from('requests')
        .update({ status_id: statusData.id })
        .eq('id', requestId)
        .select()
        .single()
      return { data, error }
    })
  }

  async getAllRequests({ pageNumber = 1, pageSize = 10, requestStatus = "" }) {
    return this.handleSupabaseOperation(async () => {
      let query = supabase!
        .from('requests')
        .select(`
          *,
          requester:requesters!requests_requester_id_fkey(id,name),
          service:services(id,name_ar,name_en),
          status:lookup_values!requests_status_id_fkey(id,name_ar,name_en,code),
          city:cities(id,name_ar,name_en)
        `, { count: 'exact' })

      if (requestStatus) {
        query = query.eq('status_id', requestStatus)
      }

      const from = (Number(pageNumber) - 1) * Number(pageSize)
      const to = from + Number(pageSize) - 1

      const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false })

      return { data, error, count }
    })
  }
}

export class ProjectService extends BaseService {
  constructor() {
    super('projects')
  }

  async getByRequester(requesterId: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase!
        .from('projects')
        .select(`
          *,
          request:requests(*),
          requester:profiles!projects_requester_id_fkey(*),
          provider:profiles!projects_provider_id_fkey(*),
          status:project_statuses(*)
        `)
        .eq('requester_id', requesterId)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async getByProvider(providerId: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase!
        .from('projects')
        .select(`
          *,
          request:requests(*),
          requester:profiles!projects_requester_id_fkey(*),
          provider:profiles!projects_provider_id_fkey(*),
          status:project_statuses(*)
        `)
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async getActive() {
    return this.handleSupabaseOperation(async () => {
      const waitingApproval = await (supabase as any)
        .from('project_statuses')
        .select('id')
        .eq('code', 'waiting_approval')
        .maybeSingle()
      const waitingStart = await (supabase as any)
        .from('project_statuses')
        .select('id')
        .eq('code', 'waiting_start')
        .maybeSingle()
      const processing = await (supabase as any)
        .from('project_statuses')
        .select('id')
        .eq('code', 'processing')
        .maybeSingle()
      const statusIds = [waitingApproval?.data?.id, waitingStart?.data?.id, processing?.data?.id].filter(Boolean)
      const { data, error } = await (supabase as any)
        .from('projects')
        .select(`
          *,
          request:requests(*),
          requester:profiles!projects_requester_id_fkey(*),
          provider:profiles!projects_provider_id_fkey(*),
          status:project_statuses(*)
        `)
        .in('status_id', statusIds)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async updateStatus(projectId: string, statusCode: string) {
    return this.handleSupabaseOperation(async () => {
      const { data: statusData } = await (supabase as any)
        .from('project_statuses')
        .select('id')
        .eq('code', statusCode)
        .maybeSingle()

      if (!statusData) {
        return { data: null, error: { message: 'Invalid status code' } }
      }

      const { data, error } = await (supabase as any)
        .from('projects')
        .update({ status_id: statusData.id })
        .eq('id', projectId)
        .select()
        .single()
      return { data, error }
    })
  }
}

export class NotificationService extends BaseService {
  constructor() {
    super('notifications')
  }

  async getByUser(userId: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase!
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async getUnread(userId: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase!
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async markAsRead(notificationId: string) {
    return this.update(notificationId, { is_read: true })
  }

  async markAllAsRead(userId: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await (supabase as any)
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
      return { data, error }
    })
  }
}

export const profileService = new ProfileService()
export const requestService = new RequestService()
export const projectService = new ProjectService()
export const notificationService = new NotificationService()
export const servicesService = new BaseService('services')

export class AdminStatisticsService extends BaseService {
  constructor() {
    super('users' as any) // Base table, though we'll query multiple
  }

  async getRequestersStatistics() {
    return this.handleSupabaseOperation(async () => {
      const [totalRequesters, activeRequesters] = await Promise.all([
        supabase!.from("requesters").select("id", { count: "exact", head: true }),
        supabase!
          .from("requesters")
          .select("id", { count: "exact", head: true })
          .eq("users!requesters_user_id_fkey.is_blocked", false),
      ]);

      return {
        data: {
          totalRequestersCount: totalRequesters.count || 0,
          activeRequestersCount: activeRequesters.count || 0,
          inactiveRequestersCount: (totalRequesters.count || 0) - (activeRequesters.count || 0),
        },
        error: null // Promise.all errors caught by handleSupabaseOperation
      };
    })
  }

  async getServiceProvidersStatistics() {
    return this.handleSupabaseOperation(async () => {
      const [
        total,
        pending,
        active,
        blocked,
        suspended
      ] = await Promise.all([
        supabase!.from("providers").select("id", { count: "exact", head: true }),
        supabase!.from("providers").select("id", { count: "exact", head: true }).eq("profile_status_id", 200),
        supabase!.from("providers").select("id", { count: "exact", head: true }).eq("profile_status_id", 201),
        supabase!.from("providers").select("id", { count: "exact", head: true }).eq("profile_status_id", 202),
        supabase!.from("providers").select("id", { count: "exact", head: true }).eq("profile_status_id", 203),
      ]);

      return {
        data: {
          totalAccountsCount: total.count || 0,
          pendingAccountsCount: pending.count || 0,
          activeAccountsCount: active.count || 0,
          blockedAccountsCount: blocked.count || 0,
          suspendedAccountsCount: suspended.count || 0,
        },
        error: null
      };
    })
  }

  async getRequestsStatistics() {
    return this.handleSupabaseOperation(async () => {
      const [
        total,
        processing,
        initialApproval,
        waitingPayment,
        rejected,
        completed,
        newRequests
      ] = await Promise.all([
        supabase!.from("requests").select("id", { count: "exact", head: true }),
        supabase!.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 8), // Priced (Initially Approved)
        supabase!.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 9), // Accepted (Waiting Payment/Start)
        supabase!.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 21), // Waiting Payment
        supabase!.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 10), // Rejected
        supabase!.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 11), // Completed
        supabase!.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 7), // Pending (New)
      ]);

      return {
        data: {
          totalRequestsCount: total.count || 0,
          underProcessingRequestsCount: processing.count || 0, // Using Priced as Under Processing/Negotiation
          initiallyApprovedRequestsCount: initialApproval.count || 0, // Using Accepted
          waitingForPaymentRequestsCount: waitingPayment.count || 0,
          rejectedRequestsCount: rejected.count || 0,
          approvedRequestsCount: completed.count || 0,
          newRequestsCount: newRequests.count || 0,
        },
        error: null
      };
    })
  }

  async getAdminStatistics() {
    return this.handleSupabaseOperation(async () => {
      const [
        usersCount,
        requestersCount,
        providersCount,
        requestsCount,
        ordersCount,
        paymentsCount,
        projectsCount,
        ticketsCount,
      ] = await Promise.all([
        supabase!.from("users").select("id", { count: "exact", head: true }),
        supabase!.from("requesters").select("id", { count: "exact", head: true }),
        supabase!.from("providers").select("id", { count: "exact", head: true }),
        supabase!.from("requests").select("id", { count: "exact", head: true }),
        supabase!.from("orders").select("id", { count: "exact", head: true }),
        supabase!
          .from("payments")
          .select("amount", { count: "exact", head: false }),
        supabase!.from("projects").select("id", { count: "exact", head: true }),
        supabase!.from("tickets").select("id", { count: "exact", head: true }),
      ]);

      const totalAmount =
        paymentsCount.data?.reduce(
          (sum, row) => sum + Number((row as any).amount || 0),
          0
        ) || 0;

      return {
        data: {
          totalUsers: usersCount.count || 0,
          totalRequesters: requestersCount.count || 0,
          totalProviders: providersCount.count || 0,
          totalRequests: requestsCount.count || 0,
          totalOrders: ordersCount.count || 0,
          totalProjects: projectsCount.count || 0,
          totalTickets: ticketsCount.count || 0,
          totalFinancialAmounts: totalAmount,
          consultationsFinancialAmounts: 0,
        },
        error: null
      };
    })
  }

  async getProviderOrderStatistics(providerId: string) {
    return this.handleSupabaseOperation(async () => {
      const providerOrders = await supabase!
        .from("orders")
        .select("order_status_id", { count: "exact" })
        .eq("provider_id", providerId);

      return {
        data: {
          totalOrders: providerOrders.count || 0,
        },
        error: providerOrders.error
      };
    })
  }
}

export const adminStatisticsService = new AdminStatisticsService()

export class ProviderService extends BaseService {
  constructor() {
    super('providers' as any)
  }

  async getAllProviders({ pageNumber = 1, pageSize = 10, name = "", accountStatus = "" }) {
    return this.handleSupabaseOperation(async () => {
      let query = supabase!
        .from('providers')
        .select(`
          *,
          user:users!providers_user_id_fkey(id,email,phone,role,is_blocked),
          entityType:lookup_values!providers_entity_type_id_fkey(id,name_ar,name_en,code),
          city:cities(id,name_ar,name_en),
          profileStatus:lookup_values!providers_profile_status_id_fkey(id,name_ar,name_en,code)
        `, { count: 'exact' })

      if (name) {
        query = query.ilike('name', `%${name}%`)
      }

      if (accountStatus) {
        query = query.eq('profile_status_id', accountStatus)
      }

      const from = (Number(pageNumber) - 1) * Number(pageSize)
      const to = from + Number(pageSize) - 1

      const { data, error, count } = await query
        .range(from, to)
      // .order('created_at', { ascending: false }) // providers might not have created_at, using id or default sort

      return { data, error, count }
    })
  }

  async updateStatus(userId: string, isBlocked: boolean) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await (supabase as any)
        .from('users')
        .update({
          is_blocked: isBlocked,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()
      return { data, error }
    })
  }
}

export const providerService = new ProviderService()
