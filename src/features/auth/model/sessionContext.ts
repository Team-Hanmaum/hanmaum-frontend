import { createContext } from "react";
import type { SessionController } from "./sessionController";

export const SessionContext = createContext<SessionController | null>(null);
