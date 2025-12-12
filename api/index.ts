import serverless from "serverless-http";
import app from "./express";

// Validate critical env vars on startup
const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error(
    `⚠️  Missing critical environment variables: ${missingEnvVars.join(", ")}`
  );
  console.error(
    "Please set these in Vercel Project Settings > Environment Variables"
  );
}

// Initialize serverless handler with defensive fallback so initialization
// errors are logged to Vercel function logs rather than causing opaque failures.
let handler: any = null;
let initError: any = null;
try {
  handler = serverless(app as any);
} catch (err) {
  initError = err;
  console.error("Failed to initialize serverless handler:", err);
}

// Export a function compatible with Vercel. If initialization failed,
// return a clear 500 response and ensure the error appears in logs.
export default async function vercelHandler(req: any, res: any) {
  if (initError) {
    console.error("API initialization error on request:", initError);
    res.status(500).send("API initialization failed. Check function logs.");
    return;
  }

  // Delegate to serverless handler
  return handler(req, res);
}
