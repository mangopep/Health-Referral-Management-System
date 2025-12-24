/**
 * @file client/src/app/main.tsx
 * @description Application entry point - mounts React app to DOM
 */

import { createRoot } from "react-dom/client";
import App from "./App";
import "@/core/theme/index.css";

createRoot(document.getElementById("root")!).render(<App />);
