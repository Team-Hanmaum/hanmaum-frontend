import type { ItemWriteIdentity } from "./careWriteTypes";
export type ReconfirmCareItemBody = ItemWriteIdentity & {
  values: {
    title: string;
    description: string | null;
    fields: Record<string, string | null>;
  };
  basis: string | null;
  evidenceIds: string[];
};
export type ReconfirmedCareItem = {
  itemId: string;
  version: string;
  needsReconfirmation: false;
  updatedAt: string;
};
