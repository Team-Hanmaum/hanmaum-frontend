import { useRef, useState } from "react";
import { useParams } from "react-router";
import { BottomSheet, Notice } from "@/components/feedback";
import {
  Badge,
  Button,
  Field,
  SelectionRow,
  TextAction,
} from "@/components/ui";
import type { CareDetail } from "@/features/careitem/api/careReadTypes";
import { useCareItem } from "@/features/careitem/model/useCareQueries";
import { itemLabels } from "@/features/careitem/model/careReadView";
import { CareSection } from "@/features/careitem/ui/CareSection";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { useCareShareLink } from "@/features/sharing/model/useCareShareLink";
import { useShareActions } from "@/features/sharing/model/useShareActions";
import {
  needsShareRefresh,
  shareLinkFailure,
} from "@/features/sharing/model/shareLinkFailure";
import { ApiError } from "@/lib/api";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { careItemPath, careListPath } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function CareSharePage() {
  const { space } = useSpaceContext();
  const { itemId = "" } = useParams();
  const query = useCareItem(space.spaceId, itemId);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const backPath =
    query.error instanceof ApiError && query.error.status === 404
      ? careListPath(space.spaceId)
      : careItemPath(space.spaceId, itemId);
  const back = () =>
    void navigate(withReturn(backPath), {
      motion: "back",
    });
  const [revision, setRevision] = useState(0);
  const refresh = async () => {
    const next = await query.refetch();
    if (next.isSuccess) setRevision((value) => value + 1);
  };
  if (!query.data || query.isError)
    return (
      <ProposalPageLayout
        title="공유 미리보기"
        spaceId={space.spaceId}
        onBack={back}
      >
        <ReviewQueryState
          error={query.error}
          retry={() => void refresh()}
        />
      </ProposalPageLayout>
    );
  if (
    query.data.needsReconfirmation ||
    query.data.visibility === "DELETED" ||
    query.data.redactedFields.length
  )
    return (
      <ProposalPageLayout
        title="공유"
        spaceId={space.spaceId}
        onBack={back}

        actions={<Button onClick={back}>항목으로 돌아가기</Button>}
      >
        <Notice
          title="지금은 이 항목을 공유할 수 없어요"
          body="삭제되었거나 근거 재확인이 필요한 정보는 새로 공유할 수 없어요. 이전 제목과 내용은 표시하지 않아요."
        />
      </ProposalPageLayout>
    );
  return (
    <ShareContent
      key={`${space.spaceId}:${itemId}:${query.data.version}:${revision}`}
      item={query.data}
      onBack={back}
      refresh={() => void refresh()}
      refreshing={query.isFetching}
    />
  );
}

function ShareContent({
  item,
  onBack,
  refresh,
  refreshing,
}: {
  item: CareDetail;
  onBack: () => void;
  refresh: () => void;
  refreshing: boolean;
}) {
  const [includesChange, setIncludesChange] = useState(false);
  const link = useCareShareLink(item.spaceId, {
    itemId: item.itemId,
    expectedItemVersion: item.version,
    includesChange,
  });
  const actions = useShareActions();
  const field = useRef<HTMLInputElement>(null);
  const card = link.data?.cards[0];
  const conflict = link.isError && needsShareRefresh(link.error);
  return (
    <>
      <ProposalPageLayout
        title="공유 미리보기"
        spaceId={item.spaceId}
        onBack={onBack}

        actions={
          card ? (
            <>
              <Button
                disabled={actions.sdk !== "ready"}
                loading={actions.busy}
                onClick={() => void actions.share(card)}
              >
                카카오톡으로 공유
              </Button>
              <Button
                variant="secondary"
                disabled={actions.busy}
                onClick={() => void actions.copy(card.url)}
              >
                공유 링크 복사
              </Button>
              {actions.sdk === "error" && (
                <TextAction onClick={() => void actions.retrySdk()}>
                  카카오톡 공유 다시 준비
                </TextAction>
              )}
              <TextAction onClick={onBack}>항목으로 돌아가기</TextAction>
            </>
          ) : (
            <>
              <Button
                loading={link.isPending || refreshing}
                onClick={conflict ? refresh : () => void link.prepare()}
              >
                {conflict
                  ? "최신 내용 다시 확인"
                  : link.isError
                    ? "같은 요청으로 다시 확인"
                    : "공유 링크 만들기"}
              </Button>
              <TextAction onClick={onBack}>항목으로 돌아가기</TextAction>
            </>
          )
        }
      >
        <h1 className="text-hm-title-page">가족에게 이렇게 보여요</h1>
        <CareSection title="한마음">
          <Badge
            label={itemLabels[card?.itemType ?? item.itemType]}
            tone="brand"
          />
          <p className="text-hm-body-emphasis">
            {itemLabels[card?.itemType ?? item.itemType]} 정보를 확인해 주세요
          </p>
          <p className="text-hm-body-small text-hm-text-secondary">
            {(card?.includesChange ?? includesChange)
              ? "변경된 정보가 있어요"
              : "함께 확인할 정보가 있어요"}
          </p>
          <p className="text-hm-body-small text-hm-text-secondary">
            한마음에서 확인
          </p>
        </CareSection>
        <CareSection title="선택한 항목 · 공유 카드에 포함되지 않아요">
          <p className="text-hm-body-default wrap-anywhere whitespace-pre-wrap">
            {item.title ?? "제목 없음"}
          </p>
        </CareSection>
        {!card && (
          <SelectionRow
            label="변경 안내 함께 공유"
            description="유효한 확정 변경 이력이 있는지 확인한 뒤 공유해요."
            checked={includesChange}
            disabled={link.status !== "idle"}
            onChange={(event) => setIncludesChange(event.target.checked)}
          />
        )}
        <Notice
          title="상세 내용은 참여자만 볼 수 있어요"
          body="공유 카드에는 가족 이름이나 돌봄 상세 내용을 넣지 않아요. 로그인과 현재 참여 여부를 확인한 뒤 최신 항목을 열어요. 공유 링크는 초대 링크가 아니에요."
        />
        {link.isError && (
          <Notice
            tone="error"
            role="alert"
            title="공유 링크를 준비하지 못했어요"
            body={shareLinkFailure(link.error)}
          />
        )}
        {card && actions.sdk === "missing" && (
          <Notice
            title="카카오톡 공유를 준비 중이에요"
            body="공유 링크를 복사해서 가족에게 보내 주세요."
          />
        )}
        {card && actions.sdk === "loading" && (
          <p
            role="status"
            className="text-hm-body-small"
          >
            카카오톡 공유를 준비하고 있어요.
          </p>
        )}
        {card && actions.sdk === "error" && (
          <Notice
            tone="error"
            title="카카오톡 공유를 불러오지 못했어요"
            body="다시 준비하거나 공유 링크를 복사해 주세요."
          />
        )}
        {actions.feedback && (
          <Notice
            role="status"
            title="공유 안내"
            body={actions.feedback}
          />
        )}
      </ProposalPageLayout>
      <BottomSheet
        open={actions.fallbackOpen}
        onOpenChange={actions.setFallbackOpen}
        title="공유 링크 복사"
      >
        <Field
          ref={field}
          label="공유 링크"
          value={link.data?.shareUrl ?? ""}
          readOnly
          onFocus={(event) => event.target.select()}
        />
        <Button
          variant="secondary"
          onClick={() => {
            field.current?.focus();
            field.current?.select();
          }}
        >
          링크 선택
        </Button>
      </BottomSheet>
    </>
  );
}
