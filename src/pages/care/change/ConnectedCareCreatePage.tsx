import { useParams } from "react-router";
import { EmptyState } from "@/components/feedback";
import { CareCreateForm } from "@/features/careitem/ui/CareCreateForm";
import { createItemTypes } from "@/features/careitem/model/careWriteDraft";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
export function ConnectedCareCreatePage() {
  const { space } = useConnectedSpace();
  const { kind = "" } = useParams();
  const type = createItemTypes[kind];
  return type ? (
    <CareCreateForm
      key={`${space.spaceId}:${type}`}
      space={space}
      type={type}
    />
  ) : (
    <EmptyState
      title="직접 추가할 수 없는 유형이에요"
      body="관찰과 안내는 소식을 통해 남겨 주세요."
    />
  );
}
