import { useParams } from "react-router";
import { EmptyState } from "@/components/feedback";
import { CareCreateForm } from "@/features/careitem/ui/CareCreateForm";
import { createItemTypes } from "@/features/careitem/model/careWriteDraft";
import { useSpaceContext } from "@/routes/useSpaceContext";
export function CareCreatePage() {
  const { space } = useSpaceContext();
  const { kind = "" } = useParams();
  const type = Object.hasOwn(createItemTypes, kind)
    ? createItemTypes[kind]
    : undefined;
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
