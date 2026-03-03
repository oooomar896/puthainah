"use client";

import Image from "next/image";
import { useState, useMemo } from "react";

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  quality = 75,
  className = "",
  fallbackSrc = "",
  placeholder = "blur",
  blurDataURL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxmaWx0ZXIgaWQ9J2EnPjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249JzAuOCcvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbHRlcj0ndXJsKCNhKScgZmlsbD0nI2VhZWFlYScvPjwvc3ZnPg==",
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const defaultBucket = process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET || "images";
  const [failed, setFailed] = useState(false);
  const resolvedSrc = useMemo(() => {
    // If src is a static import object (with src property), return it directly
    if (typeof src === 'object' && src !== null && 'src' in src) {
      return src;
    }

    let val = src;

    // If it's a data URI, already http(s), or from placehold.co, just return it
    if (!val || typeof val !== 'string' || val.startsWith("data:") || /^https?:\/\//i.test(val)) {
      return val;
    }

    // Handle Supabase relative paths
    if (supabaseUrl) {
      if (/^(public\/)?attachments\//i.test(val)) {
        const cleaned = val.replace(/^public\//, "");
        return `${supabaseUrl}/storage/v1/object/public/${cleaned}`;
      }
      if (/^(partners|customers|services)\//i.test(val)) {
        // e.g. "partners/123.jpg" -> full URL
        return `${supabaseUrl}/storage/v1/object/public/${defaultBucket}/${val}`;
      }
      // If none of the above specific folders, but still looks like a path
      // Maybe it already has bucket in it?
      // Assuming 'attachments' is the default bucket if not specified in path? 
      // Actually, my upload logic uses 'images' bucket often (which defaults to 'attachments' env var fallback).
      // Let's rely on the fact that if it's relative, it needs a base.

      // Safety: if it looks like a full storage path "storage/v1/...", prepend valid host
      if (/^storage\/v1\/object\//i.test(val)) {
        return `${supabaseUrl}/${val}`;
      }

      // Fallback: assume it's in the default bucket
      return `${supabaseUrl}/storage/v1/object/public/${defaultBucket}/${val}`;
    }

    return val;
  }, [src, supabaseUrl, defaultBucket]);
  const finalSrc = failed ? (typeof fallbackSrc === "string" ? fallbackSrc : (fallbackSrc?.src || "")) : resolvedSrc;
  const isSvg = typeof finalSrc === "string" ? finalSrc.toLowerCase().endsWith(".svg") : false;
  if (!finalSrc) {
    const fb = typeof fallbackSrc === "string" ? fallbackSrc : (fallbackSrc?.src || "");
    if (fb) {
      return <img src={fb} alt={alt} className={className} loading="lazy" decoding="async" />;
    }
    return null;
  }
  if (isSvg) {
    return <img src={finalSrc} alt={alt} className={className} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
  }
  const isUnoptimized = typeof finalSrc === "string" && (finalSrc.includes("placehold.co") || finalSrc.includes(".svg"));

  if (fill) {
    return (
      <Image
        src={finalSrc}
        alt={alt}
        fill
        sizes={sizes || "100vw"}
        priority={priority}
        quality={quality}
        className={className}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        unoptimized={isUnoptimized}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={className}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      unoptimized={isUnoptimized}
      onError={() => setFailed(true)}
    />
  );
}
