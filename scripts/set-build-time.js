#!/usr/bin/env node
/**
 * Script to set build time environment variable and run Next.js build
 * Used by Netlify and local builds
 */

const { spawn } = require('child_process');
const buildTime = new Date().toISOString();

// Set environment variables
process.env.NEXT_PUBLIC_BUILD_TIME = buildTime;
process.env.BUILD_TIME = buildTime;

console.log(`Build time set to: ${buildTime}`);

// Spawn Next.js build with environment variables
const buildProcess = spawn('next', ['build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_BUILD_TIME: buildTime,
    BUILD_TIME: buildTime,
  },
  shell: true,
});

buildProcess.on('close', (code) => {
  process.exit(code);
});

buildProcess.on('error', (error) => {
  console.error('Build process error:', error);
  process.exit(1);
});

