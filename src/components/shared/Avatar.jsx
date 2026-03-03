"use client";

import OptimizedImage from "@/components/shared/OptimizedImage";

const getInitials = (name) => {
  if (!name || typeof name !== "string") return "NA";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  const letters = (first + last).toUpperCase();
  return letters || (name[0] || "N").toUpperCase();
};

const Avatar = ({ src, name, size = 36, className = "" }) => {
  const initials = getInitials(name);
  const dim = typeof size === "number" ? `${size}px` : size;
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full overflow-hidden bg-gray-100 border border-gray-200 ${className}`}
      style={{ width: dim, height: dim }}
      title={name || ""}
    >
      {src ? (
        <OptimizedImage src={src} alt={name || "avatar"} width={size} height={size} className="object-cover" />
      ) : (
        <span className="text-xs font-semibold text-gray-600">{initials}</span>
      )}
    </div>
  );
};

export default Avatar;

