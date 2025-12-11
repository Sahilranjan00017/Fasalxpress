import { createServer } from "../server";

// Reuse the existing createServer factory to build the Express app
const app = createServer();

export default app;
