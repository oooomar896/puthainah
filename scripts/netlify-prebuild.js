try {
  // No-op: keep middleware.js for Next.js runtime to generate NFT manifest
  console.log('[netlify-prebuild] No changes applied');
  process.exit(0);
} catch (e) {
  console.warn('[netlify-prebuild] No-op error:', e?.message || e);
  process.exit(0);
}
