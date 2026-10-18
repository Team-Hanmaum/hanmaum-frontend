import { useSearchParams } from "react-router";
import {
  careStatusTabs,
  careTypeTabs,
  readCareListFilter,
} from "@/features/careitem/model/careItemSelectors";

export function useCareListFilter() {
  const [params, setParams] = useSearchParams();
  const filter = readCareListFilter(params);
  function setType(value: string) {
    if (!careTypeTabs.some((tab) => tab.value === value)) return;
    void setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set("type", value);
        next.delete("status");
        if (next.get("mockState") === "no-results") next.delete("mockState");
        if (next.get("qaState") === "no-results") next.delete("qaState");
        return next;
      },
      { preventScrollReset: true },
    );
  }
  function setStatus(value: string) {
    if (!careStatusTabs[filter.type].some((tab) => tab.value === value)) return;
    void setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set("status", value);
        if (next.get("mockState") === "no-results") next.delete("mockState");
        if (next.get("qaState") === "no-results") next.delete("qaState");
        return next;
      },
      { preventScrollReset: true },
    );
  }
  return { filter, setType, setStatus };
}
