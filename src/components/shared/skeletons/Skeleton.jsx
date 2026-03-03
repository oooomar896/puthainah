import React from "react";

/**
 * Base Skeleton component for loading states
 */
const Skeleton = ({ 
  className = "", 
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
  ...props 
}) => {
  const baseClasses = "bg-gray-200 dark:bg-gray-700";
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-[shimmer_2s_infinite]",
    none: "",
  };

  const variantClasses = {
    rectangular: "rounded",
    circular: "rounded-full",
    text: "rounded h-4",
    rounded: "rounded-lg",
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      {...props}
    />
  );
};

/**
 * Skeleton for text lines
 */
export const SkeletonText = ({ lines = 3, className = "" }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? "75%" : "100%"}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton for card components
 */
export const SkeletonCard = ({ className = "" }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <Skeleton variant="rectangular" height={200} className="mb-4 rounded-lg" />
      <Skeleton variant="text" width="60%" className="mb-2" />
      <Skeleton variant="text" width="40%" />
    </div>
  );
};

/**
 * Skeleton for table rows
 */
export const SkeletonTableRow = ({ columns = 5 }) => {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <Skeleton variant="text" width={index === 0 ? "80%" : "60%"} />
        </td>
      ))}
    </tr>
  );
};

/**
 * Skeleton for table
 */
export const SkeletonTable = ({ rows = 5, columns = 5, className = "" }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-4 py-3 text-left">
                <Skeleton variant="text" width="70%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, index) => (
            <SkeletonTableRow key={index} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Skeleton for profile card
 */
export const SkeletonProfile = ({ className = "" }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center space-x-4 space-x-reverse mb-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1">
          <Skeleton variant="text" width="40%" className="mb-2" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
};

/**
 * Skeleton for statistics cards
 */
export const SkeletonStatsCard = ({ className = "" }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="circular" width={48} height={48} />
      </div>
      <Skeleton variant="text" width="30%" className="mb-2" />
      <Skeleton variant="text" width="60%" />
    </div>
  );
};

/**
 * Skeleton for form fields
 */
export const SkeletonFormField = ({ className = "" }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Skeleton variant="text" width="30%" />
      <Skeleton variant="rectangular" height={44} className="rounded-lg" />
    </div>
  );
};

export default Skeleton;

