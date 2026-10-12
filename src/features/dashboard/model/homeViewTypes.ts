import type { NewsStatus } from "@/features/record/ui/NewsCard";

type HomeSummaryItem = {
  id: string;
  title: string;
  description: string;
};

// 홈 표시용 데이터. BE DTO와 분리하며 스타일과 클릭 동작은 UI에서 결정한다.
export type HomeView = {
  pendingCount: number;
  recentNews: {
    id: string;
    title: string;
    author: string;
    body: string;
    status: NewsStatus;
    statusMessage: string;
  }[];
  upcomingSchedules: {
    id: string;
    title: string;
    statusLabel: string;
    meta: string;
    body: string;
  }[];
  pastScheduleCount: number;
  tasks: HomeSummaryItem[];
  questions: HomeSummaryItem[];
  recentChanges: HomeSummaryItem[];
};
