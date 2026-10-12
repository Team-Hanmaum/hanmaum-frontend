import { Notice } from "@/components/feedback";
import { Icon } from "@/components/ui";

export function InvitationContent({
  state,
}: {
  state: "default" | "expired" | "unavailable" | "error";
}) {
  if (state === "expired" || state === "unavailable")
    return (
      <>
        <Icon name={state === "expired" ? "clock" : "link"} />
        <div className="flex flex-col gap-hm-8">
          <h1 className="text-hm-title-page">
            {state === "expired" ? (
              <>
                초대 링크의
                <br />
                유효기간이 지났어요
              </>
            ) : (
              <>
                이 초대로는
                <br />
                참여할 수 없어요
              </>
            )}
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {state === "expired" ? (
              <>
                가족에게 새 초대 링크를
                <br />
                보내 달라고 말씀해 주세요.
              </>
            ) : (
              <>
                링크가 올바르지 않거나
                <br />더 이상 참여할 수 없는 공간이에요.
              </>
            )}
          </p>
        </div>
        <Notice
          tone="neutral"
          title={
            state === "expired"
              ? "초대 링크는 24시간 동안 유효해요"
              : "새 초대 링크를 확인해 주세요"
          }
          body={
            state === "expired"
              ? "새 링크를 받으면 그 링크를 눌러\n다시 참여할 수 있어요."
              : "초대해 준 가족에게\n링크를 다시 보내 달라고 말씀해 주세요."
          }
        />
      </>
    );
  return (
    <>
      <div className="flex flex-col gap-hm-8">
        <h1 className="text-hm-title-page">
          가족이 한마음에
          <br />
          초대했어요
        </h1>
        <p className="text-hm-body-default text-hm-text-secondary">
          로그인하면 초대를 확인하고
          <br />
          가족의 돌봄 공간에 참여할 수 있어요.
        </p>
      </div>
      {state === "error" && (
        <Notice
          tone="error"
          role="alert"
          title="참여를 완료하지 못했어요"
          body="초대 링크는 그대로예요. 아래 버튼으로 다시 시도해 주세요."
        />
      )}
      <Notice
        title="가족이 함께 기록하는 공간이에요"
        body={"부모님의 일정과 돌봄 소식을\n가족과 한곳에서 확인해요."}
      />
    </>
  );
}
