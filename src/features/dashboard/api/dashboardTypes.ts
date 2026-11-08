export interface DashboardItem {
  itemId: string;
  itemType: string;
  version: string;
  title: string | null;
  status: string | null;
  needsReconfirmation: boolean;
  needsConflictReview: boolean;
  fields: Record<string, unknown>;
  assigneeDisplayName: string | null;
}
export interface DashboardItemSection {
  items: DashboardItem[];
  totalCount: number;
}
export interface DashboardChange {
  itemId: string;
  itemType: string;
  version: string;
  changeKind: string;
  changedAt: string;
  changedByMembershipId: string;
  changedByDisplayName: string | null;
  title: string | null;
}
export interface DashboardResponse {
  spaceId: string;
  asOf: string;
  upcomingSchedules: DashboardItemSection;
  pastScheduleCount: number;
  remainingTasks: DashboardItemSection;
  unconfirmedQuestions: DashboardItemSection;
  recentChanges: { items: DashboardChange[]; totalCount: number };
}
