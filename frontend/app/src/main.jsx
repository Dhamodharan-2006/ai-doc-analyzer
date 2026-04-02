import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#0c1220",
          color: "#e2e8f0",
          border: "1px solid rgba(56,189,248,0.15)",
          fontFamily: "'Sora', sans-serif",
          fontSize: "0.85rem",
        },
      }}
    />
  </StrictMode>
);