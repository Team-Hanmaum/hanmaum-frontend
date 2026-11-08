import { createContext, useContext } from "react";

export const ExampleContext = createContext<{ onReset: () => void } | null>(
  null,
);
export function useExampleContext() {
  return useContext(ExampleContext);
}
