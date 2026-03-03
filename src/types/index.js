/**
 * @fileoverview Type definitions for Bakora Amal platform
 * This file contains JSDoc type definitions for better IDE support and documentation
 */

/**
 * User roles in the system
 * @typedef {('Admin' | 'Provider' | 'Requester')} UserRole
 */

/**
 * Authentication credentials
 * @typedef {Object} AuthCredentials
 * @property {string} token - JWT access token
 * @property {string} refreshToken - JWT refresh token
 * @property {UserRole} role - User role
 * @property {string} userId - User ID
 */

/**
 * Login request payload
 * @typedef {Object} LoginRequest
 * @property {string} email - User email
 * @property {string} password - User password
 */

/**
 * Register Provider request payload
 * @typedef {Object} RegisterProviderRequest
 * @property {string} email - Provider email
 * @property {string} password - Provider password
 * @property {string} fullName - Provider full name
 * @property {string} phoneNumber - Provider phone number
 * @property {string} entityType - Provider entity type
 * @property {string} [cityId] - City ID (optional)
 * @property {string} [commercialRegister] - Commercial register (optional)
 * @property {File[]} [attachments] - Attachments (optional)
 */

/**
 * Register Requester request payload
 * @typedef {Object} RegisterRequesterRequest
 * @property {string} email - Requester email
 * @property {string} password - Requester password
 * @property {string} fullName - Requester full name
 * @property {string} phoneNumber - Requester phone number
 * @property {string} entityType - Requester entity type
 * @property {string} [cityId] - City ID (optional)
 */

/**
 * User profile information
 * @typedef {Object} UserProfile
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} fullName - User full name
 * @property {string} phoneNumber - User phone number
 * @property {UserRole} role - User role
 * @property {string} [cityId] - City ID
 * @property {string} [cityName] - City name
 * @property {string} [avatar] - User avatar URL
 * @property {string} [entityType] - Entity type
 * @property {boolean} [isBlocked] - Whether user is blocked
 * @property {Date} [createdAt] - Account creation date
 */

/**
 * Request/Order status
 * @typedef {('Pending' | 'Approved' | 'Rejected' | 'InProgress' | 'Completed' | 'Cancelled')} RequestStatus
 */

/**
 * Order/Request entity
 * @typedef {Object} Order
 * @property {string} id - Order ID
 * @property {string} title - Order title
 * @property {string} description - Order description
 * @property {RequestStatus} status - Order status
 * @property {string} requesterId - Requester user ID
 * @property {string} [providerId] - Provider user ID (optional)
 * @property {string} [serviceId] - Service ID (optional)
 * @property {number} [price] - Order price (optional)
 * @property {Date} createdAt - Order creation date
 * @property {Date} [updatedAt] - Order last update date
 * @property {OrderAttachment[]} [attachments] - Order attachments
 */

/**
 * Order attachment
 * @typedef {Object} OrderAttachment
 * @property {string} id - Attachment ID
 * @property {string} fileName - File name
 * @property {string} fileUrl - File URL
 * @property {string} fileType - File MIME type
 * @property {number} fileSize - File size in bytes
 */

/**
 * Project entity (Order that has been approved and assigned)
 * @typedef {Object} Project
 * @property {string} id - Project ID
 * @property {string} orderId - Related order ID
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {RequestStatus} status - Project status
 * @property {string} requesterId - Requester user ID
 * @property {string} providerId - Provider user ID
 * @property {number} price - Project price
 * @property {Date} createdAt - Project creation date
 * @property {Date} [completedAt] - Project completion date
 * @property {OrderAttachment[]} [attachments] - Project attachments
 */

/**
 * Pagination parameters
 * @typedef {Object} PaginationParams
 * @property {number} [PageNumber=1] - Page number (1-indexed)
 * @property {number} [PageSize=10] - Number of items per page
 */

/**
 * Paginated API response
 * @typedef {Object} PaginatedResponse
 * @property {T[]} data - Array of items
 * @property {number} totalCount - Total number of items
 * @property {number} pageNumber - Current page number
 * @property {number} pageSize - Items per page
 * @property {number} totalPages - Total number of pages
 * @template T
 */

/**
 * API error response
 * @typedef {Object} ApiError
 * @property {string} Message - Error message
 * @property {number} [statusCode] - HTTP status code
 * @property {string} [error] - Error type
 */

/**
 * Service entity
 * @typedef {Object} Service
 * @property {string} id - Service ID
 * @property {string} name - Service name (Arabic)
 * @property {string} nameEn - Service name (English)
 * @property {string} description - Service description
 * @property {string} descriptionEn - Service description (English)
 * @property {boolean} isActive - Whether service is active
 * @property {Date} createdAt - Service creation date
 */

/**
 * Rating entity
 * @typedef {Object} Rating
 * @property {string} id - Rating ID
 * @property {string} projectId - Related project ID
 * @property {string} raterId - User ID who gave the rating
 * @property {string} ratedUserId - User ID who received the rating
 * @property {number} score - Rating score (1-5)
 * @property {string} [comment] - Rating comment
 * @property {Date} createdAt - Rating creation date
 */

/**
 * Ticket entity
 * @typedef {Object} Ticket
 * @property {string} id - Ticket ID
 * @property {string} title - Ticket title
 * @property {string} description - Ticket description
 * @property {string} userId - User ID who created the ticket
 * @property {('Open' | 'InProgress' | 'Resolved' | 'Closed')} status - Ticket status
 * @property {string} [adminId] - Admin ID handling the ticket
 * @property {Date} createdAt - Ticket creation date
 * @property {Date} [updatedAt] - Ticket last update date
 */

/**
 * FAQ entity
 * @typedef {Object} FAQ
 * @property {string} id - FAQ ID
 * @property {string} question - Question (Arabic)
 * @property {string} questionEn - Question (English)
 * @property {string} answer - Answer (Arabic)
 * @property {string} answerEn - Answer (English)
 * @property {boolean} isActive - Whether FAQ is active
 * @property {Date} createdAt - FAQ creation date
 */

/**
 * Partner entity
 * @typedef {Object} Partner
 * @property {string} id - Partner ID
 * @property {string} name - Partner name
 * @property {string} [logo] - Partner logo URL
 * @property {string} [website] - Partner website URL
 * @property {boolean} isActive - Whether partner is active
 * @property {Date} createdAt - Partner creation date
 */

/**
 * Customer entity
 * @typedef {Object} Customer
 * @property {string} id - Customer ID
 * @property {string} name - Customer name
 * @property {string} [logo] - Customer logo URL
 * @property {string} [website] - Customer website URL
 * @property {boolean} isActive - Whether customer is active
 * @property {Date} createdAt - Customer creation date
 */

/**
 * City entity
 * @typedef {Object} City
 * @property {string} id - City ID
 * @property {string} name - City name (Arabic)
 * @property {string} nameEn - City name (English)
 */

/**
 * Notification entity
 * @typedef {Object} Notification
 * @property {string} id - Notification ID
 * @property {string} userId - User ID who receives the notification
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {boolean} isRead - Whether notification is read
 * @property {string} [type] - Notification type
 * @property {string} [relatedId] - Related entity ID
 * @property {Date} createdAt - Notification creation date
 */

/**
 * Statistics data
 * @typedef {Object} Statistics
 * @property {number} totalUsers - Total number of users
 * @property {number} totalProviders - Total number of providers
 * @property {number} totalRequesters - Total number of requesters
 * @property {number} totalOrders - Total number of orders
 * @property {number} totalProjects - Total number of projects
 * @property {number} pendingOrders - Number of pending orders
 * @property {number} completedProjects - Number of completed projects
 */

/**
 * Redux Auth State
 * @typedef {Object} AuthState
 * @property {string|null} token - JWT access token
 * @property {string|null} refreshToken - JWT refresh token
 * @property {UserRole|null} role - User role
 * @property {string|null} userId - User ID
 */

export {};

