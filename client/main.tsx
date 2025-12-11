import "./global.css";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

// Create a root.
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);

// Initial render wrapped in ErrorBoundary to avoid white screens on runtime errors
root.render(
	<ErrorBoundary>
		<App />
	</ErrorBoundary>,
);
