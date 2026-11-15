import { formatRecordDate } from "../model/recordDates";
import type { RecordView } from "../model/recordViewTypes";

export function RecordOriginalCard({ record }: { record: RecordView }) {
  return (
    <section
      className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20 wrap-anywhere"
      aria-label="남긴 소식"
    >
      <h2 className="text-hm-heading-section">남긴 소식</h2>
      <div className="flex items-center gap-hm-8">
        <Avatar
          name={record.author.name}
          profileImageUrl={record.author.profileImageUrl}
          size="compact"
          decorative
        />
        <div className="flex min-w-0 flex-col gap-hm-8">
          <p className="text-hm-body-default">
            {record.author.name}
            {record.author.self && record.author.name !== "나" && " · 나"}
          </p>
          <time
            className="text-hm-body-small text-hm-text-secondary"
            dateTime={new Date(record.createdAt).toISOString()}
          >
            {formatRecordDate(record.createdAt)}
          </time>
        </div>
      </div>
      <p className="text-hm-body-reading whitespace-pre-wrap">{record.body}</p>
    </section>
  );
}
import { Avatar } from "@/components/ui";
