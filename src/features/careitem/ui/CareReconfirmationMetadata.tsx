import type { CareDetail } from "../api/careReadTypes";
import { displayCareValue, formatServerTime } from "../model/careReadView";

export function CareReconfirmationMetadata({ item }: { item: CareDetail }) {
  return (
    <p className="flex flex-wrap gap-x-hm-12 gap-y-hm-4 text-hm-body-small text-hm-text-secondary">
      <span>
        등록일{" "}
        <time dateTime={item.createdAt}>
          {formatServerTime(item.createdAt)}
        </time>
      </span>
      {item.status && (
        <span>기존 상태 {displayCareValue("status", item.status)}</span>
      )}
    </p>
  );
}
