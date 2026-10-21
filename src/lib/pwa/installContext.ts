import { createContext, useContext } from "react";

export const InstallContext = createContext({
  installed: false,
  showInstall: () => {},
});

export function usePwaInstall() {
  return useContext(InstallContext);
}
