import { useRef, useState } from "react";
import { useParams } from "react-router";
import { BottomSheet, Notice } from "@/components/feedback";
import { BrandSymbol, Button, Field, TextAction } from "@/components/ui";
import type { CareDetail } from "@/features/careitem/api/careReadTypes";
import { useCareItem } from "@/features/careitem/model/useCareQueries";
import { CareFieldList } from "@/features/careitem/ui/CareFieldList";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { useCareShareLink } from "@/features/sharing/model/useCareShareLink";
import {
  shareCardButtonTitle,
  shareCardMessage,
} from "@/features/sharing/model/kakaoShare";
import { useShareActions } from "@/features/sharing/model/useShareActions";
import {
  needsShareRefresh,
  shareLinkFailure,
} from "@/features/sharing/model/shareLinkFailure";
import { ApiError } from "@/lib/api";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { careItemPath, careListPath } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function CareSharePage() {
  const { space } = useSpaceContext();
  const { itemId = "" } = useParams();
  const query = useCareItem(space.spaceId, itemId);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const backToItem = useBackNavigation(
    withReturn(careItemPath(space.spaceId, itemId)),
  );
  const back = () => {
    if (query.error instanceof ApiError && query.error.status === 404) {
      void navigate(withReturn(careListPath(space.spaceId)), {
        replace: true,
        motion: "back",
      });
    } else {
      backToItem();
    }
  };
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
  const link = useCareShareLink(item.spaceId, {
    itemId: item.itemId,
    expectedItemVersion: item.version,
    includesChange: false,
  });
  const actions = useShareActions();
  const field = useRef<HTMLInputElement>(null);
  const card = link.data?.cards[0];
  const message = shareCardMessage(
    card ?? { itemType: item.itemType, includesChange: false },
  );
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
              <div className="grid grid-cols-2 gap-hm-12">
                <Button
                  disabled={actions.sdk !== "ready"}
                  loading={actions.busy}
                  onClick={() => void actions.share(card)}
                  className="px-hm-8"
                >
                  카카오톡 공유
                </Button>
                <Button
                  variant="secondary"
                  disabled={actions.busy}
                  onClick={() => void actions.copy(card.url)}
                  className="px-hm-8"
                >
                  링크 복사
                </Button>
              </div>
              {actions.sdk === "error" && (
                <TextAction onClick={() => void actions.retrySdk()}>
                  카카오톡 공유 다시 준비
                </TextAction>
              )}
            </>
          ) : (
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
          )
        }
      >
        <section className="flex flex-col gap-hm-4">
          <h1 className="text-hm-title-page">공유할 항목</h1>
          <p className="text-hm-body-emphasis wrap-anywhere">
            {item.title ?? "제목 없음"}
          </p>
          {item.itemType === "SCHEDULE" && (
            <CareFieldList
              values={item}
              keys={["scheduledDate", "scheduledTime", "location"]}
            />
          )}
        </section>
        <section className="flex flex-col gap-hm-8">
          <h2 className="text-hm-heading-section">가족에게 보이는 카드</h2>
          <div className="overflow-hidden rounded-hm-16 border border-hm-border-default bg-hm-bg-surface">
            <div className="flex items-center gap-hm-8 bg-hm-bg-brand-subtle px-hm-16 py-hm-12 text-hm-body-emphasis text-hm-text-brand">
              <BrandSymbol decorative />
              한마음
            </div>
            <div className="flex flex-col gap-hm-4 px-hm-16 py-hm-12">
              <p className="text-hm-body-emphasis">{message.heading}</p>
              <p className="text-hm-body-small text-hm-text-secondary">
                {message.body}
              </p>
            </div>
            <p className="border-t border-hm-divider-default px-hm-16 py-hm-12 text-center text-hm-body-small font-bold text-hm-text-brand">
              {shareCardButtonTitle}
            </p>
          </div>
        </section>
        <p className="text-hm-body-small text-hm-text-secondary">
          상세 내용은 링크를 연 뒤 로그인한 공간 참여자에게만 보여요.
        </p>
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
