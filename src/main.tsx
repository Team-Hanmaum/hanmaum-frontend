import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { Router } from "@/routes/Router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <Router />
    </QueryProvider>
  </StrictMode>,
);
