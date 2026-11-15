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
    <div className="flex flex-col gap-hm-4 border-t border-hm-divider-default px-hm-16 py-hm-12">
      <div className="flex items-center justify-between gap-hm-8">
        <p className="text-hm-body-small text-hm-text-secondary">
          {expired ? "만료 시각" : "링크 사용 기한"}
        </p>
        <Badge
          label={expired ? "만료" : "사용 가능"}
          tone={expired ? "neutral" : "brand"}
        />
      </div>
      <p className="text-hm-body-emphasis wrap-anywhere">
        {date}
        {!expired && "까지"}
      </p>
    </div>
  );
}
