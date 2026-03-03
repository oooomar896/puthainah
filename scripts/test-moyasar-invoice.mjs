import fs from "node:fs";
import path from "node:path";

function loadEnvFromFiles() {
  const files = [
    ".env.local",
    ".env.development.local",
    ".env",
    ".env.example",
  ];
  const env = {};
  for (const file of files) {
    const p = path.join(process.cwd(), file);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf-8");
      for (const line of content.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
        if (m) {
          const key = m[1];
          let val = m[2].trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'")) ||
            (val.startsWith("`") && val.endsWith("`"))
          ) {
            val = val.slice(1, -1);
          }
          env[key] = val;
        }
      }
    }
  }
  return env;
}

async function main() {
  const env = loadEnvFromFiles();
  const secretKey =
    process.env.MOYASAR_SECRET_KEY ||
    env.MOYASAR_SECRET_KEY ||
    process.env.NEXT_PUBLIC_MOYASAR_SECRET_KEY ||
    env.NEXT_PUBLIC_MOYASAR_SECRET_KEY;

  if (!secretKey || secretKey.includes("*****")) {
    console.error(
      "Missing or masked MOYASAR_SECRET_KEY. Set it in .env.local (without asterisks)."
    );
    process.exit(1);
  }

  const callbackUrl =
    process.env.NEXT_PUBLIC_MOYASAR_CALLBACK_URL ||
    env.NEXT_PUBLIC_MOYASAR_CALLBACK_URL ||
    "http://localhost:3000";

  const payload = {
    amount: 100 * 100, // 100 SAR
    currency: "SAR",
    description: "Test Invoice",
    callback_url: callbackUrl,
    supported_sources: ["creditcard", "mada", "applepay"],
  };

  const auth = Buffer.from(`${secretKey}:`).toString("base64");

  console.log("Creating test invoice on Moyasar...");
  const res = await fetch("https://api.moyasar.com/v1/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Failed:", res.status, data);
    process.exit(2);
  }

  console.log("Success:");
  console.log("invoiceId:", data?.id);
  console.log("invoiceUrl:", data?.url || data?.invoice_url);
  console.log("status:", data?.status);
}

main().catch((e) => {
  console.error(e);
  process.exit(99);
});
