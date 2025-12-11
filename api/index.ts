import serverless from "serverless-http";
import app from "./express";

// Export a serverless handler that Vercel will call for /api/*
const handler = serverless(app as any);

export default handler as any;
