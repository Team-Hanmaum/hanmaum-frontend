import { MenuRow } from "@/components/ui";
import { Notice } from "@/components/feedback";
import {
  careSpaceName,
  type CareSpaceView,
} from "@/features/carespace/model/careSpaceViewTypes";
import { AccountInfoCard } from "./AccountInfoCard";
export function WithdrawalSpaceList({
  spaces,
  onTransfer,
  onDelete,
  onInvite,
}: {
  spaces: readonly CareSpaceView[];
  onTransfer: (id: string) => void;
  onDelete: (id: string) => void;
  onInvite: (id: string) => void;
}) {
  return (
    <>
      {spaces.map((space) => (
        <section
          key={space.id}
          className="flex flex-col gap-hm-16"
        >
          <AccountInfoCard title={careSpaceName(space)}>
            <p className="text-hm-body-default">
              나 · 소유자 /{" "}
              {space.members.length > 1
                ? `함께하는 가족 ${space.members.length}명`
                : "참여자 나 혼자"}
            </p>
          </AccountInfoCard>
          {space.members.length > 1 ? (
            <MenuRow
              title={`${careSpaceName(space)} · 소유권 이전`}
              onClick={() => onTransfer(space.id)}
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
                onClick={() => onInvite(space.id)}
              />
            </>
          )}
          <MenuRow
            tone="danger"
            icon="chevron-right-error"
            title={`${careSpaceName(space)} · 공간 삭제`}
            onClick={() => onDelete(space.id)}
          />
        </section>
      ))}
    </>
  );
}
