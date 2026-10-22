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
        <div className="grid grid-cols-3 gap-hm-12 rounded-hm-16 bg-hm-bg-surface p-hm-16">
          {members.slice(0, homePreviewLimits.family).map((member) => (
            <FamilyAvatar
              key={member.id}
              name={member.name}
              self={member.self}
              roleLabel={`${member.self ? "나 · " : ""}${member.role === "owner" ? "소유자" : "구성원"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
