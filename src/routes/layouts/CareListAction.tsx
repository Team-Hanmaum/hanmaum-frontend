import { useAppNavigate } from "@/routes/useAppNavigate";

import { Button } from "@/components/ui";
import { careKindLabels } from "@/features/careitem/model/careItemViewTypes";
import { careListStates } from "@/features/careitem/model/careScreenStates";
import { useCareListFilter } from "../useCareListFilter";
import { useMockScreenState } from "../useMockScreenState";
import { newsCreatePath, careCreatePath } from "../paths";

export function CareListAction({ spaceId }: { spaceId: string }) {
  const { filter } = useCareListFilter();
  const [state] = useMockScreenState(careListStates, "default");
  const navigate = useAppNavigate();
  if (state === "loading" || state === "error") return null;
  const news = filter.type === "observation" || filter.type === "guidance";
  return (
    <div className="flex flex-col gap-hm-8 bg-hm-bg-surface px-hm-20 pt-hm-16 pb-hm-24">
      <Button
        className="w-full"
        onClick={() =>
          void navigate(
            news
              ? newsCreatePath(spaceId)
              : careCreatePath(spaceId, filter.type),
          )
        }
      >
        {news ? "소식 남기기" : `${careKindLabels[filter.type]} 추가`}
      </Button>
    </div>
  );
}
