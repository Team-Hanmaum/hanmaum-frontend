import { createContext, useContext } from "react";

export const QaModeContext = createContext({
  enabled: false,
  exit: () => {},
});

export function useQaMode() {
  return useContext(QaModeContext);
}
