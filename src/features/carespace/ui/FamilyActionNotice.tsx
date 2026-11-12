import { Notice } from "@/components/feedback";
import { familyActionFailure } from "../model/familyActionFailure";

export function FamilyActionNotice({
  error,
  uncertain,
}: {
  error: unknown;
  uncertain: boolean;
}) {
  if (!error) return null;
  return (
    <Notice
      role="alert"
      tone="error"
      title={uncertain ? "처리 결과를 다시 확인해 주세요" : "처리하지 못했어요"}
      body={familyActionFailure(error)}
    />
  );
}
