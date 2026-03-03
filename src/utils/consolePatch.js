"use client";
try {
  if (typeof window !== "undefined") {
    const enable = typeof localStorage !== "undefined" && localStorage.getItem("DEBUG_LOGS") === "1";
    if (!enable) {
      const origError = console.error.bind(console);
      console.log = function () {};
      console.warn = function () {};
      console.error = function (...args) { origError(...args); };
    }
  }
} catch (e) { void e; }
