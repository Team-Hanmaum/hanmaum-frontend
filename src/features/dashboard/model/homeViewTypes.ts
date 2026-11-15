type HomeSummaryItem = {
  id: string;
  title: string;
  description: string;
};

// 홈 표시용 데이터. BE DTO와 분리하며 스타일과 클릭 동작은 UI에서 결정한다.
export type HomeView = {
  pendingCount?: number;
  // 미리보기로 자르기 전 전체 건수. 표시 배열의 length로 대체하지 않는다.
  totalCounts: {
    recentNews: number | undefined;
    upcomingSchedules: number;
    tasks: number;
    questions: number;
    recentChanges: number;
  };
  recentNews: {
    id: string;
    title?: string;
    author: {
      name: string;
      initial?: string;
      isMine: boolean;
      profileImageUrl: string | null;
    };
    recordedAtLabel: string;
    body: string;
  }[];
  upcomingSchedules: {
    id: string;
    title: string;
    statusLabel?: string;
    daysUntil?: number;
    meta: string;
    body: string;
  }[];
  tasks: HomeSummaryItem[];
  questions: HomeSummaryItem[];
  recentChanges: HomeSummaryItem[];
};
