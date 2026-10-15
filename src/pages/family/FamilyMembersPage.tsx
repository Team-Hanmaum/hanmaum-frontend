import { useNavigate, useOutletContext } from "react-router";
import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui";
import {
  careSpaceName,
  type CareSpaceView,
} from "@/features/carespace/model/careSpaceViewTypes";
import { FamilyMember } from "@/features/carespace/ui/FamilyMember";
import {
  memberTaskLabel,
  unfinishedMemberTasks,
} from "@/features/carespace/model/familySelectors";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { FamilyPageLayout } from "@/routes/layouts/FamilyPageLayout";
import { familyRemovePath, spacePath } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function FamilyMembersPage() {
  const space = useOutletContext<CareSpaceView>();
  const { items } = useMockProposals(space);
  const navigate = useNavigate();
  const onBack = useBackNavigation(spacePath(space.id, "family"));
  return (
    <FamilyPageLayout
      title="구성원 관리"
      spaceId={space.id}
      onBack={onBack}
      tabs
    >
      {space.role !== "owner" ? (
        <ErrorState
          reason="no-permission"
          title="소유자만 참여를 관리할 수 있어요"
          onAction={() => void navigate(spacePath(space.id, "family"))}
          actionLabel="가족 화면으로"
        />
      ) : (
        <>
          <h1 className="text-hm-title-page">
            함께하는 가족의
            <br />
            참여를 관리해요
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {careSpaceName(space)} · {space.members.length}명
          </p>
          {space.members.map((member) => (
            <section
              key={member.id}
              className="overflow-hidden rounded-hm-14 bg-hm-bg-surface"
            >
              <FamilyMember
                {...member}
                name={`${member.name}${member.self ? " · 나" : ""}`}
                initial={member.name[0]}
                detail={memberTaskLabel(
                  unfinishedMemberTasks(items, member.id).length,
                  true,
                )}
              />
              {!member.self && member.role === "member" && (
                <div className="px-hm-16 pb-hm-16">
                  <Button
                    variant="outline"
                    className="w-full"
                    aria-label={`${member.name} 참여 관리`}
                    onClick={() =>
                      void navigate(familyRemovePath(space.id, member.id))
                    }
                  >
                    참여 관리
                  </Button>
                </div>
              )}
            </section>
          ))}
        </>
      )}
    </FamilyPageLayout>
  );
}
