export type EditLease = {
  itemId: string;
  leaseToken: string | null;
  holderMembershipId: string;
  expiresAt: string;
  renewAfterSeconds: number;
};
export type AcquiredLease = EditLease & { leaseToken: string };
