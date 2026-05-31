import React from "react";
import { createRoot } from "react-dom/client";
import "antd/dist/reset.css";

import { App } from "./app/App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root is required.");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
