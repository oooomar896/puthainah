/**
 * @fileoverview API response type definitions
 */

/**
 * Standard API response wrapper
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {T} data - Response data
 * @property {string} [message] - Response message
 * @property {ApiError} [error] - Error object if request failed
 * @template T
 */

/**
 * Login API response
 * @typedef {Object} LoginResponse
 * @property {string} accessToken - JWT access token
 * @property {string} refreshToken - JWT refresh token
 * @property {UserRole} role - User role
 * @property {string} userId - User ID
 */

/**
 * Refresh token API response
 * @typedef {Object} RefreshTokenResponse
 * @property {string} accessToken - New JWT access token
 * @property {string} refreshToken - New JWT refresh token
 */

/**
 * Get orders query parameters
 * @typedef {Object} GetOrdersParams
 * @property {number} [PageNumber=1] - Page number
 * @property {number} [PageSize=10] - Page size
 * @property {RequestStatus} [RequestStatus] - Filter by status
 */

/**
 * Get projects query parameters
 * @typedef {Object} GetProjectsParams
 * @property {number} [PageNumber=1] - Page number
 * @property {number} [PageSize=10] - Page size
 * @property {string} [OrderTitle] - Filter by title
 * @property {string} [OrderStatusLookupId] - Filter by status ID
 */

/**
 * Create order request payload
 * @typedef {Object} CreateOrderRequest
 * @property {string} title - Order title
 * @property {string} description - Order description
 * @property {string} serviceId - Service ID
 * @property {File[]} [attachments] - Order attachments
 * @property {string} [cityId] - City ID
 */

/**
 * Create priced order request payload
 * @typedef {Object} CreatePricedOrderRequest
 * @property {string} title - Order title
 * @property {string} description - Order description
 * @property {string} serviceId - Service ID
 * @property {number} price - Order price
 * @property {File[]} [attachments] - Order attachments
 * @property {string} [cityId] - City ID
 */

/**
 * Update provider project status request
 * @typedef {Object} ProviderProjectStatusRequest
 * @property {string} orderId - Order ID
 * @property {RequestStatus} status - New status
 */

/**
 * Complete order request
 * @typedef {Object} CompleteOrderRequest
 * @property {string} projectId - Project ID
 * @property {File[]} [attachments] - Completion attachments
 * @property {string} [notes] - Completion notes
 */

/**
 * Admin request pricing action request
 * @typedef {Object} AdminRequestPricingRequest
 * @property {string} requestId - Request ID
 * @property {number} price - Approved price
 * @property {string} providerId - Provider ID to assign
 * @property {boolean} isApproved - Whether request is approved
 */

/**
 * Requester action request
 * @typedef {Object} RequesterActionRequest
 * @property {string} requestId - Request ID
 * @property {('Accept' | 'Reject')} action - Action to take
 */

/**
 * Reassign request request
 * @typedef {Object} ReassignRequestRequest
 * @property {string} orderId - Order ID
 * @property {string} providerId - New provider ID
 */

export {};

