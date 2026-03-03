/**
 * @fileoverview Redux state type definitions
 */

/**
 * Root Redux state shape
 * @typedef {Object} RootState
 * @property {AuthState} auth - Authentication state
 * @property {Object} authApi - Auth API RTK Query state
 * @property {Object} lookupApi - Lookup API RTK Query state
 * @property {Object} citiesApi - Cities API RTK Query state
 * @property {Object} requestersApi - Requesters API RTK Query state
 * @property {Object} providersApi - Providers API RTK Query state
 * @property {Object} detailsApi - User details API RTK Query state
 * @property {Object} servicesApi - Services API RTK Query state
 * @property {Object} updateApi - Update API RTK Query state
 * @property {Object} adminStatisticsApi - Admin statistics API RTK Query state
 * @property {Object} ordersApi - Orders API RTK Query state
 * @property {Object} projectsApi - Projects API RTK Query state
 * @property {Object} ratingsApi - Ratings API RTK Query state
 * @property {Object} ticketApi - Ticket API RTK Query state
 * @property {Object} notificationsApi - Notifications API RTK Query state
 * @property {Object} faqsApi - FAQs API RTK Query state
 * @property {Object} partnersApi - Partners API RTK Query state
 * @property {Object} customersApi - Customers API RTK Query state
 * @property {Object} paymentApi - Payment API RTK Query state
 * @property {Object} profileInfoApi - Profile info API RTK Query state
 */

/**
 * RTK Query hook result for queries
 * @typedef {Object} QueryHookResult
 * @property {T|undefined} data - Query data
 * @property {Error|undefined} error - Query error
 * @property {boolean} isLoading - Whether query is loading
 * @property {boolean} isFetching - Whether query is fetching
 * @property {boolean} isSuccess - Whether query succeeded
 * @property {boolean} isError - Whether query failed
 * @property {Function} refetch - Function to refetch data
 * @template T
 */

/**
 * RTK Query hook result for mutations
 * @typedef {Object} MutationHookResult
 * @property {Function} mutate - Function to trigger mutation
 * @property {Function} mutateAsync - Async function to trigger mutation
 * @property {T|undefined} data - Mutation response data
 * @property {Error|undefined} error - Mutation error
 * @property {boolean} isLoading - Whether mutation is loading
 * @property {boolean} isSuccess - Whether mutation succeeded
 * @property {boolean} isError - Whether mutation failed
 * @property {Function} reset - Function to reset mutation state
 * @template T
 */

export {};

