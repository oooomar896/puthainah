const fs = require('fs');
const path = require('path');

try {
  const root = process.cwd();
  const mwPath = path.join(root, 'middleware.js');
  if (fs.existsSync(mwPath)) {
    const disabledPath = path.join(root, 'middleware.disabled.js');
    fs.renameSync(mwPath, disabledPath);
    console.log('[prebuild] Renamed middleware.js -> middleware.disabled.js to avoid Next proxy conflict');
  }
  process.exit(0);
} catch (e) {
  console.warn('[prebuild] Failed to adjust middleware:', e?.message || e);
  process.exit(0);
}
