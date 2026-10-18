import { useNavigate, useOutletContext, useSearchParams } from "react-router";
import { MenuRow, Tabs } from "@/components/ui";
import { EmptyState } from "@/components/feedback";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockSpaceInfoChanges } from "@/features/carespace/model/mockSpaceInfoChanges";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import { spaceInfoPath, spaceInfoRequestPath } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
const tabs = [
  { value: "requested", label: "승인 대기" },
  { value: "applied", label: "반영" },
  { value: "rejected", label: "미적용" },
] as const;
export function SpaceInfoRequestsPage() {
  const space = useOutletContext<CareSpaceView>();
  const changes = useMockSpaceInfoChanges(space.id);
  const navigate = useNavigate();
  const { withReturn } = useWithdrawalReturn();
  const [params, setParams] = useSearchParams();
  const status =
    tabs.find((tab) => tab.value === params.get("status"))?.value ??
    "requested";
  const onBack = useBackNavigation(withReturn(spaceInfoPath(space.id)));
  const selfId = space.members.find((member) => member.self)?.id;
  return (
    <AccountPageLayout
      title={
        space.role === "owner" ? "공간 정보 요청·변경" : "내 공간 정보 요청"
      }
      onBack={onBack}
      spaceId={space.id}
    >
      <h1 className="text-hm-title-page">공간 정보 요청·변경</h1>
      <Tabs
        label="처리 상태"
        value={status}
        onValueChange={(value) =>
          void setParams((previous) => {
            const next = new URLSearchParams(previous);
            next.set("status", value);
            return next;
          })
        }
        items={tabs.map((tab) => {
          const visible = changes.filter(
            (change) =>
              change.status === tab.value &&
              (space.role === "owner" || change.authorId === selfId),
          );
          return {
            ...tab,
            content: (
              <div className="flex flex-col gap-hm-12">
                {visible.length ? (
                  visible.map((change) => (
                    <MenuRow
                      key={change.id}
                      icon="edit"
                      title={`${change.before} → ${change.after}`}
                      description={`${change.author} · ${new Date(change.createdAt).toLocaleDateString("ko-KR")}`}
                      onClick={() =>
                        void navigate(
                          withReturn(spaceInfoRequestPath(space.id, change.id)),
                        )
                      }
                    />
                  ))
                ) : (
                  <EmptyState
                    title="표시할 내용이 없어요"
                    body="공간 정보 수정 요청과 처리 결과를 여기에서 확인할 수 있어요."
                  />
                )}
              </div>
            ),
          };
        })}
      />
    </AccountPageLayout>
  );
}
