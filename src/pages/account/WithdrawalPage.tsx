import { useState } from "react";
import { useSearchParams } from "react-router";
import { Badge, Button, MenuRow, TextAction } from "@/components/ui";
import { ErrorState, LoadingState, Notice } from "@/components/feedback";
import { useSession } from "@/features/auth/model/useSession";
import { useCareSpaces } from "@/features/carespace/model/useCareSpaces";
import { AccountInfoCard } from "@/features/user/ui/AccountInfoCard";
import { WithdrawalSpaceList } from "@/features/user/ui/WithdrawalSpaceList";
import { useWithdrawal } from "@/features/user/model/useWithdrawal";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import { useAppNavigate } from "@/routes/useAppNavigate";
import {
  familyDeletePath,
  familyTransferPath,
  paths,
  spaceInvitePath,
} from "@/routes/paths";

export function WithdrawalPage() {
  const session = useSession();
  const spaces = useCareSpaces({ enabled: session.status === "authenticated" });
  const withdrawal = useWithdrawal();
  const navigate = useAppNavigate();
  const [params] = useSearchParams();
  const [checked, setChecked] = useState(false);
  const owned = spaces.data?.filter((space) => space.role === "OWNER") ?? [];
  const unknown = session.status === "withdrawal-unknown";
  const checking = unknown && session.checking;
  const pending = withdrawal.isPending || session.status === "withdrawing";
  const ready = !!spaces.data && !spaces.isError;
  const cancel = () => {
    if (!pending && !unknown)
      void navigate(paths.account, { replace: true, motion: "back" });
  };
  const leave = async () => {
    await session.leaveWithdrawal();
    void navigate(paths.landing, { replace: true, motion: "back" });
  };
  const refresh = () => {
    setChecked(true);
    withdrawal.reset();
    void spaces.refetch();
  };

  return (
    <AccountPageLayout
      connected
      title="회원 탈퇴"
      onBack={cancel}
      actions={
        unknown ? (
          <>
            <Button
              loading={checking}
              onClick={() => void session.checkWithdrawal()}
            >
              로그인 상태 확인
            </Button>
            <TextAction
              disabled={checking}
              onClick={() => void leave()}
            >
              처음으로
            </TextAction>
          </>
        ) : ready ? (
          <>
            <Button
              variant={owned.length ? "primary" : "destructive"}
              loading={pending || spaces.isFetching}
              onClick={() => {
                if (owned.length) refresh();
                else withdrawal.mutate();
              }}
            >
              {owned.length ? "정리 상태 확인하기" : "계정 정보 삭제하고 탈퇴"}
            </Button>
            <TextAction
              disabled={pending}
              onClick={cancel}
            >
              탈퇴 취소
            </TextAction>
          </>
        ) : undefined
      }
    >
      {unknown ? (
        <>
          <h1 className="text-hm-title-page">
            탈퇴 처리 결과를
            <br />
            확인하지 못했어요
          </h1>
          <Notice
            title="이전 돌봄 화면은 가려두었어요"
            body="응답을 받지 못해 탈퇴 완료 여부를 확인할 수 없어요. 탈퇴 요청을 자동으로 다시 보내지 않아요."
          />
          <p className="text-hm-body-default text-hm-text-secondary">
            로그인 상태를 확인해 계정이 유지되고 있으면 탈퇴 안내로 돌아가요.
            로그인이 종료되었더라도 탈퇴 완료로 단정하지 않아요.
          </p>
          {session.error.status === 401 && (
            <Notice
              title="로그인이 종료되었어요"
              body="탈퇴 완료 여부는 확인할 수 없어요. 탈퇴가 완료되었다면 이후 소셜 로그인 시 새 계정이 만들어질 수 있어요."
            />
          )}
        </>
      ) : spaces.isPending ? (
        <LoadingState label="소유 중인 공간을 확인하고 있어요" />
      ) : spaces.isError ? (
        <ErrorState
          reason="load-error"
          title="공간 목록을 불러오지 못했어요"
          actionLabel="다시 확인"
          onAction={refresh}
        />
      ) : owned.length ? (
        <>
          <h1 className="text-hm-title-page">
            소유 중인 공간을
            <br />
            먼저 정리해 주세요
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            가족에게 소유권을 넘기거나 공간을 삭제한 뒤 탈퇴할 수 있어요.
          </p>
          <Badge
            className="self-start"
            label={`소유 중인 공간 ${owned.length}개`}
          />
          <WithdrawalSpaceList
            spaces={owned}
            onTransfer={(id) =>
              void navigate(`${familyTransferPath(id)}?returnTo=withdrawal`)
            }
            onDelete={(id) =>
              void navigate(`${familyDeletePath(id)}?returnTo=withdrawal`)
            }
            onInvite={(id) =>
              void navigate(`${spaceInvitePath(id)}?returnTo=withdrawal`)
            }
          />
          <Notice
            tone="error"
            title="공간 삭제는 별도 작업이에요"
            body="이전하면 공간은 유지돼요. 삭제하면 해당 공간과 자료는 복구할 수 없어요."
          />
          {checked && !spaces.isFetching && (
            <Notice
              role="status"
              title={`아직 소유 중인 공간이 ${owned.length}개 있어요`}
              body="모든 소유 공간을 정리한 뒤 탈퇴할 수 있어요."
            />
          )}
        </>
      ) : (
        <>
          <Badge
            className="self-start"
            label="소유 중인 공간 없음"
            tone="brand"
          />
          <h1 className="text-hm-title-page">
            탈퇴하면
            <br />
            이렇게 처리돼요
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            삭제되는 계정 정보와 남는 공동 기록을 확인해 주세요.
          </p>
          <AccountInfoCard title="삭제되는 정보">
            <p className="text-hm-body-default">
              한마음 계정의 기본 정보
              <br />
              소셜 계정과의 연결 정보
              <br />
              로그인·인증 정보
            </p>
          </AccountInfoCard>
          <Notice
            tone="error"
            title="모든 참여 공간의 접근이 종료돼요"
            body="이 계정으로 참여한 공간을 더 이상 볼 수 없어요."
          />
          <AccountInfoCard title="가족과 공유한 기록은 남아요">
            <p className="text-hm-body-default">
              공유 돌봄 기록과 변경 이력의 작성자는 ‘탈퇴한 사용자’로 표시돼요.
              <br />
              탈퇴만으로 가족 공간 전체가 삭제되지는 않아요.
            </p>
          </AccountInfoCard>
          <p className="text-hm-body-default text-hm-text-secondary">
            삭제할 소식이 있다면 탈퇴 전에 별도의 소식 삭제 절차를 진행해
            주세요.
          </p>
          <MenuRow
            icon="news-brand"
            title="소식 확인하러 가기"
            disabled={pending}
            onClick={() => void navigate(paths.withdrawalNews)}
          />
        </>
      )}
      {params.get("cleanup") === "deleted" && !unknown && (
        <Notice
          role="status"
          title="공간 삭제를 완료했어요"
          body="회원 탈퇴는 아직 하지 않았어요. 남은 소유 공간과 탈퇴 내용을 확인해 주세요."
        />
      )}
      {withdrawal.error && !unknown && (
        <Notice
          tone="error"
          role="alert"
          title="탈퇴하지 못했어요"
          body={withdrawal.error.message}
        />
      )}
    </AccountPageLayout>
  );
}
