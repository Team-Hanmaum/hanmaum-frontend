import { MenuRow } from "@/components/ui";
import { Notice } from "@/components/feedback";
import { careSpaceName } from "@/features/carespace/model/careSpaceViewTypes";
import type { CareSpaceSummary } from "@/features/carespace/api/careSpaceTypes";
import { AccountInfoCard } from "./AccountInfoCard";
export function WithdrawalSpaceList({
  spaces,
  onTransfer,
  onDelete,
  onInvite,
}: {
  spaces: readonly CareSpaceSummary[];
  onTransfer: (id: string) => void;
  onDelete: (id: string) => void;
  onInvite: (id: string) => void;
}) {
  return (
    <>
      {spaces.map((space) => (
        <section
          key={space.spaceId}
          className="flex flex-col gap-hm-16"
        >
          <AccountInfoCard title={careSpaceName(space)}>
            <p className="text-hm-body-default">
              나 · 소유자 /{" "}
              {space.memberCount > 1
                ? `함께하는 가족 ${space.memberCount}명`
                : "참여자 나 혼자"}
            </p>
          </AccountInfoCard>
          {space.memberCount > 1 ? (
            <MenuRow
              title={`${careSpaceName(space)} · 소유권 이전`}
              onClick={() => onTransfer(space.spaceId)}
            />
          ) : (
            <>
              <Notice
                tone="neutral"
                title="소유권을 넘길 가족이 아직 없어요"
                body="가족이 참여한 뒤 이전할 수 있어요."
              />
              <MenuRow
                icon="plus"
                title={`${careSpaceName(space)} · 가족 초대하기`}
                onClick={() => onInvite(space.spaceId)}
              />
            </>
          )}
          <MenuRow
            tone="danger"
            icon="chevron-right-error"
            title={`${careSpaceName(space)} · 공간 삭제`}
            onClick={() => onDelete(space.spaceId)}
          />
        </section>
      ))}
    </>
  );
}
