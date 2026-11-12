import { apiClient } from "@/lib/api";
import { readApiData } from "@/lib/api/responseData";
import type { AcquiredLease, EditLease } from "./editLockTypes";
import { isEditLease } from "./editLockValidators";
const base = (space: string, item: string) =>
  `/api/spaces/${encodeURIComponent(space)}/items/${encodeURIComponent(item)}/edit-lock` as const;
export function acquireEditLease(space: string, item: string, version: string) {
  return readApiData(
    base(space, item),
    (v): v is AcquiredLease =>
      isEditLease(v) &&
      v.itemId === item &&
      typeof v.leaseToken === "string" &&
      !!v.leaseToken,
    {
      method: "POST",
      expectedStatus: 201,
      body: { expectedItemVersion: version, purpose: "EDIT" },
    },
  );
}
export function renewEditLease(
  space: string,
  item: string,
  leaseToken: string,
) {
  return readApiData(
    `${base(space, item)}/renewals`,
    (v): v is EditLease => isEditLease(v) && v.itemId === item,
    { method: "POST", body: { leaseToken, purpose: "EDIT" } },
  );
}
export const releaseEditLease = (
  space: string,
  item: string,
  leaseToken: string,
) =>
  apiClient.requestEmpty(`${base(space, item)}/releases`, {
    method: "POST",
    body: { leaseToken },
  });
