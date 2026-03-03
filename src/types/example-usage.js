/**
 * @fileoverview Example usage of type definitions
 * This file demonstrates how to use JSDoc types in your code
 */

// Example 1: Import and use types in function parameters
/**
 * @param {import('./index').UserProfile} user
 * @returns {import('./index').AuthCredentials}
 */
export function createCredentials(user) {
  return {
    token: 'example-token',
    refreshToken: 'example-refresh',
    role: user.role,
    userId: user.id,
  };
}

// Example 2: Use types with React components
/**
 * @param {Object} props
 * @param {import('./index').Order} props.order
 */
export function OrderCard({ order }) {
  return (
    <div>
      <h3>{order.title}</h3>
      <p>Status: {order.status}</p>
    </div>
  );
}

// Example 3: Use types with API hooks
/**
 * Example using RTK Query hooks with types
 */
export function useOrdersList() {
  // The hook will have typed return value
  // @type {import('./redux').QueryHookResult<import('./index').PaginatedResponse<import('./index').Order>>}
  // const { data, isLoading, error } = useGetOrdersQuery(params);
  // return { data, isLoading, error };
}

// Example 4: Define local types using imported types
/**
 * @typedef {import('./index').Order & { providerName: string }} OrderWithProvider
 */

/**
 * @param {OrderWithProvider} order
 */
export function displayOrder(order) {
  console.log(order.providerName);
}

// Example 5: Using generic types
/**
 * @param {import('./index').PaginatedResponse<import('./index').Order>} response
 */
export function processPaginatedOrders(response) {
  return {
    items: response.data,
    hasMore: response.pageNumber < response.totalPages,
  };
}

// Example 6: Type assertions for API responses
/**
 * @param {any} response
 * @returns {import('./index').UserProfile}
 */
export function parseUserProfile(response) {
  // Type assertion
  /** @type {import('./index').UserProfile} */
  const profile = {
    id: response.id,
    email: response.email,
    fullName: response.fullName,
    phoneNumber: response.phoneNumber,
    role: response.role,
  };
  return profile;
}

