import { useAppNavigate } from "@/routes/useAppNavigate";
import { useOutletContext, useParams } from "react-router";
import { Notice } from "@/components/feedback";
import { Badge, Button, MenuRow, TextAction } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { careKindLabels } from "@/features/careitem/model/careItemViewTypes";
import { CareSection } from "@/features/careitem/ui/CareSection";
import {
  careShareStates,
  useMockCareShare,
} from "@/features/sharing/model/useMockCareShare";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { careItemPath, careListPath, careSharedPath } from "@/routes/paths";

export function CareSharePage() {
  const space = useOutletContext<CareSpaceView>();
  const { itemId = "" } = useParams();
  const data = useMockProposals(space);
  const item = data.items.find((entry) => entry.id === itemId);
  const { state, setState, pending, open } = useMockCareShare();
  const navigate = useAppNavigate();
  const unavailable =
    !item ||
    item.deletedAt ||
    item.needsReconfirmation ||
    state === "unavailable";
  const back = () =>
    void navigate(
      item && !item.deletedAt
        ? careItemPath(space.id, itemId)
        : careListPath(space.id),
    );
  return (
    <ProposalPageLayout
      title={state === "external" ? "외부 앱 단계" : "공유"}
      spaceId={space.id}
      onBack={back}
      preview={{ value: state, options: careShareStates, onChange: setState }}
      actions={
        unavailable ? (
          <Button onClick={back}>돌봄으로 돌아가기</Button>
        ) : state === "external" ? (
          <>
            <Button onClick={() => setState("returned")}>
              Mock · 공유 화면에서 복귀
            </Button>
            <TextAction onClick={() => setState("cancelled")}>
              Mock · 공유 취소
            </TextAction>
            <TextAction onClick={() => setState("error")}>
              Mock · 실행 실패 확인
            </TextAction>
          </>
        ) : state === "preview" || state === "error" ? (
          <>
            <Button
              loading={pending}
              onClick={open}
            >
              {state === "error" ? "다시 시도 · Mock" : "카카오톡 공유 · Mock"}
            </Button>
            <TextAction onClick={back}>항목으로 돌아가기</TextAction>
          </>
        ) : (
          <>
            <Button onClick={back}>항목으로 돌아가기</Button>
            <TextAction onClick={() => setState("preview")}>
              다시 공유하기
            </TextAction>
          </>
        )
      }
    >
      {unavailable ? (
        <Notice
          title="지금은 이 항목을 공유할 수 없어요"
          body="삭제되었거나 근거 재확인이 필요한 정보는 새로 공유할 수 없어요. 이전 제목과 내용은 표시하지 않아요."
        />
      ) : state === "preview" ? (
        <>
          <h1 className="text-hm-title-page">가족에게 이렇게 보여요</h1>
          <CareSection title="한마음">
            <Badge
              label={careKindLabels[item.kind]}
              tone="brand"
            />
            <p className="text-hm-body-emphasis">
              {careKindLabels[item.kind]} 정보를 확인해 주세요
            </p>
            <p className="text-hm-body-small text-hm-text-secondary">
              {item.version > 1
                ? "변경된 정보가 있어요"
                : "함께 확인할 정보가 있어요"}
            </p>
            <p className="text-hm-body-small break-all">
              {window.location.origin}
              {careSharedPath(space.id, itemId)}
            </p>
          </CareSection>
          <CareSection title="선택한 항목 · 공유 카드에 포함되지 않아요">
            <p className="text-hm-body-default whitespace-pre-wrap">
              {item.title}
            </p>
          </CareSection>
          <Notice
            title="상세 내용은 참여자만 볼 수 있어요"
            body="공유 카드에는 가족 이름이나 돌봄 상세 내용을 넣지 않아요. 로그인과 현재 참여 여부를 확인한 뒤 항목을 열어요."
          />
          <Notice
            title="Mock · 실제 전송 없음"
            body="카카오 SDK와 공유 링크 API 연결 전이에요. 다음 단계와 수신자 접근 상태만 확인할 수 있어요."
          />
          <MenuRow
            icon="link-brand"
            title="Mock · 공유 링크 열어 보기"
            onClick={() => void navigate(careSharedPath(space.id, itemId))}
          />
        </>
      ) : state === "external" ? (
        <>
          <h1 className="text-hm-title-page">
            카카오톡에서 보낼 곳을 선택해요
          </h1>
          <CareSection title="사용자가 직접 진행">
            <p className="text-hm-body-default whitespace-pre-wrap">
              {"카카오톡 열기\n→ 가족 또는 채팅방 선택\n→ 사용자가 카드 전송"}
            </p>
          </CareSection>
          <Notice
            title="Mock · 외부 앱을 열지 않아요"
            body="아래 버튼으로 복귀·취소·실패를 확인해 주세요. 실제 수신자 선택과 메시지 전송은 진행하지 않아요."
          />
          <Notice
            title="돌아와도 전송 완료로 단정하지 않아요"
            body="확인 가능한 취소·실패 신호가 있으면 해당 안내를 보여줘요."
          />
        </>
      ) : state === "error" ? (
        <Notice
          tone="error"
          title="공유 화면을 열지 못했어요"
          body="연결 상태를 확인한 뒤 다시 시도해 주세요."
        />
      ) : (
        <>
          <h1 className="text-hm-title-page">
            {state === "cancelled"
              ? "공유를 취소했어요"
              : "선택한 항목은 그대로예요"}
          </h1>
          <p className="text-hm-body-default">
            돌봄 정보로 돌아가거나 다시 공유할 수 있어요.
          </p>
          <Notice
            title="공유 링크에도 접근 권한이 필요해요"
            body="현재 참여 중인 가족만 상세 정보를 볼 수 있어요. Mock 화면 복귀를 실제 전송 완료로 표시하지 않아요."
          />
        </>
      )}
    </ProposalPageLayout>
  );
}
