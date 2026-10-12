import { Badge } from "@/components/ui";

export function InvitationLinkCard({
  expiresAt,
  expired,
}: {
  expiresAt: number;
  expired: boolean;
}) {
  const date = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(expiresAt);
  return (
    <div className="flex flex-col items-start gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
      <Badge
        label={expired ? "기간 만료" : "초대 링크 준비 완료"}
        tone={expired ? "neutral" : "brand"}
      />
      <p className="text-hm-body-small text-hm-text-secondary">
        사용할 수 있는 기한
      </p>
      <p className="text-hm-body-emphasis wrap-anywhere">{date}까지</p>
      <p className="text-hm-body-small text-hm-text-secondary">
        발급 시점부터 24시간 동안 유효해요.
      </p>
    </div>
  );
}
