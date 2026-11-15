import { useAppNavigate } from "@/routes/useAppNavigate";

import { careKindLabels } from "@/features/careitem/model/careItemViewTypes";
import { useCareListFilter } from "../useCareListFilter";
import { newsCreatePath, careCreatePath } from "../paths";
import { TabQuickAction } from "./TabQuickAction";

export function CareListAction({ spaceId }: { spaceId: string }) {
  const { filter } = useCareListFilter();
  const navigate = useAppNavigate();
  const news = filter.type === "observation" || filter.type === "guidance";
  const label = news ? "소식" : careKindLabels[filter.type];
  return (
    <TabQuickAction
      label={label}
      accessibleLabel={news ? "소식 남기기" : `${label} 추가`}
      onClick={() =>
        void navigate(
          news ? newsCreatePath(spaceId) : careCreatePath(spaceId, filter.type),
        )
      }
    />
  );
}
