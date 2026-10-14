export type RecordDeletion = {
  id: string;
  recordId: string;
  actor: { id: string; name: string };
  createdAt: number;
  itemIds: readonly string[];
};
