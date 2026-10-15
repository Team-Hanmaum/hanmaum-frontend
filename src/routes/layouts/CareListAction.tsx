import { useNavigate } from "react-router";
import { Button } from "@/components/ui";
import { careKindLabels } from "@/features/careitem/model/careItemViewTypes";
import { careListStates } from "@/features/careitem/model/careScreenStates";
import { useCareListFilter } from "../useCareListFilter";
import { useMockScreenState } from "../useMockScreenState";
import { newsCreatePath } from "../paths";

export function CareListAction({ spaceId }: { spaceId: string }) {
  const { filter } = useCareListFilter();
  const [state] = useMockScreenState(careListStates, "default");
  const navigate = useNavigate();
  if (state === "loading" || state === "error") return null;
  const news = filter.type === "observation" || filter.type === "guidance";
  return (
    <div className="flex flex-col gap-hm-8 bg-hm-bg-surface px-hm-20 pt-hm-16 pb-hm-24">
      <Button
        className="w-full"
        disabled={!news}
        onClick={
          news ? () => void navigate(newsCreatePath(spaceId)) : undefined
        }
      >
        {news ? "소식 남기기" : `${careKindLabels[filter.type]} 추가 · 준비 중`}
      </Button>
    </div>
  );
}
