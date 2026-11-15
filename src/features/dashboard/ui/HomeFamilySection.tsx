import { SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui";
import { FamilyAvatar, FamilyMember } from "@/features/carespace/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { homePreviewLimits } from "../model/homePreviewLimits";

export function HomeFamilySection({
  members,
  onFamily,
  onInvite,
}: {
  members: CareSpaceView["members"];
  onFamily: () => void;
  onInvite: () => void;
}) {
  const hasMore = members.length > homePreviewLimits.family;

  return (
    <section className="flex flex-col gap-hm-12">
      <SectionHeader
        title={`함께 돌보는 가족 ${members.length}명`}
        action={{ label: "가족 보기", onClick: onFamily }}
      />
      {members.length === 1 ? (
        <div className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
          <FamilyMember {...members[0]} />
          <Button
            variant="secondary"
            className="w-full"
            onClick={onInvite}
          >
            가족 초대하기
          </Button>
        </div>
      ) : (
        <div className="rounded-hm-16 bg-hm-bg-surface p-hm-16">
          <ul
            aria-label={hasMore ? "가족 목록, 가로로 스크롤" : "가족 목록"}
            tabIndex={hasMore ? 0 : undefined}
            className={`grid grid-flow-col gap-hm-12 ${hasMore ? "snap-x snap-proximity [scrollbar-width:none] auto-cols-[calc((100%_-_3_*_var(--hm-spacing-12))_/_3.5)] overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hm-border-focus [&::-webkit-scrollbar]:hidden" : "auto-cols-fr"}`}
          >
            {members.map((member) => (
              <li
                key={member.id}
                className="flex min-w-0 snap-start justify-center"
              >
                <FamilyAvatar
                  name={member.name}
                  profileImageUrl={member.profileImageUrl}
                  self={member.self}
                  roleLabel={`${member.self ? "나 · " : ""}${member.role === "owner" ? "소유자" : "구성원"}`}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
