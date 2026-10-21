import type { ReactNode } from "react";
import { InstallContext } from "@/lib/pwa/installContext";
import { useInstallPrompt } from "@/lib/pwa/useInstallPrompt";
import { PwaInstallSheet } from "./PwaInstallSheet";

export function PwaInstallProvider({
  children,
  autoPrompt,
}: {
  children: ReactNode;
  autoPrompt: boolean;
}) {
  const prompt = useInstallPrompt(autoPrompt);
  return (
    <InstallContext
      value={{ installed: prompt.installed, showInstall: prompt.showInstall }}
    >
      {children}
      <PwaInstallSheet {...prompt} />
    </InstallContext>
  );
}
