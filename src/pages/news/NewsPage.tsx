import { useState } from "react";
import { useOutletContext } from "react-router";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { newsListStates } from "@/features/record/model/newsScreenStates";
import { NewsList } from "@/features/record/ui/NewsList";
import {
  RecordPendingSheet,
  type RecordPendingAction,
} from "@/features/record/ui/RecordPendingSheet";
import { useMockScreenState } from "@/routes/useMockScreenState";

export function NewsPage() {
  const space = useOutletContext<CareSpaceView>();
  const records = useMockRecords(space);
  const [state, setState] = useMockScreenState(newsListStates, "default");
  const [action, setAction] = useState<RecordPendingAction>(null);
  return (
    <>
      <NewsList
        records={records}
        state={state}
        onCreate={() => setAction("create")}
        onOpen={() => setAction("detail")}
        onReview={() => setAction("review")}
        onRetry={() => setState("default")}
      />
      <RecordPendingSheet
        action={action}
        onClose={() => setAction(null)}
      />
    </>
  );
}
