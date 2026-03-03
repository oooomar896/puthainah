import React from "react";
import { SkeletonCard, SkeletonTable, SkeletonStatsCard, SkeletonText } from "./Skeleton";

/**
 * Skeleton for dashboard/home pages
 */
export const DashboardSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard />
        </div>
        <div>
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for table pages
 */
export const TablePageSkeleton = ({ showFilters = true }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex gap-4 flex-wrap">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      )}

      {/* Table */}
      <SkeletonTable rows={8} columns={6} />
    </div>
  );
};

/**
 * Skeleton for profile pages
 */
export const ProfileSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 space-x-reverse mb-6">
          <div className="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <SkeletonText lines={4} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <SkeletonText lines={6} />
      </div>
    </div>
  );
};

/**
 * Skeleton for form pages
 */
export const FormPageSkeleton = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Form Fields */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        ))}

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for detail pages
 */
export const DetailPageSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <SkeletonText lines={8} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
            <SkeletonText lines={4} />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <SkeletonText lines={5} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <SkeletonText lines={3} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;

