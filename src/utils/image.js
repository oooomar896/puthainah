"use client";

export function normalizeImageSrc(input) {
  const placeholder =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999">No Image</text></svg>';

  if (!input || (typeof input === "string" && !input.trim())) {
    return placeholder;
  }

  if (typeof input !== "string") {
    return placeholder;
  }

  const value = input.trim();

  if (value.startsWith("data:image/")) {
    return value;
  }

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return value;
  }

  // Pure base64 without data URI
  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
  if (base64Regex.test(value)) {
    const mime = "image/png";
    return `data:${mime};base64,${value}`;
  }

  return placeholder;
}
