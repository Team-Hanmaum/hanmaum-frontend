import { createContext, useContext } from "react";

export const InstallContext = createContext({
  installed: false,
  showInstalledBanner: false,
  dismissInstalledBanner: () => {},
  showInstall: () => {},
});

export function usePwaInstall() {
  return useContext(InstallContext);
}
