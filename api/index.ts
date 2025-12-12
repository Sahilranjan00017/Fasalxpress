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

// Export a serverless handler that Vercel will call for /api/*
const handler = serverless(app as any);

export default handler as any;
