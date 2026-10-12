import { PagePlaceholder } from "@/components/feedback/PagePlaceholder";
import { Button } from "@/components/ui";
import { useNavigate, useParams } from "react-router";
import { spaceInvitePath } from "@/routes/paths";

export function FamilyPage() {
  const { careSpaceId } = useParams();
  const navigate = useNavigate();
  return (
    <>
      <PagePlaceholder title="가족" />
      <Button
        variant="secondary"
        disabled={!careSpaceId}
        onClick={() => {
          if (careSpaceId) void navigate(spaceInvitePath(careSpaceId));
        }}
      >
        가족 초대하기
      </Button>
    </>
  );
}
