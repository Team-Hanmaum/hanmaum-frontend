import { MenuRow } from "@/components/ui";
import { careSpaceName, type CareSpaceView } from "../model/careSpaceViewTypes";

// API 공간 목록의 표시 항목. 인원수는 소유자·본인을 포함한다.
export type CareSpaceListItem = Pick<
  CareSpaceView,
  "id" | "subjectLabel" | "role"
> & {
  memberCount: number;
};

export function CareSpaceList({
  spaces,
  currentId,
  onSelect,
}: {
  spaces: CareSpaceListItem[];
  currentId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ul
      className="flex flex-col gap-hm-24"
      aria-label="참여 중인 돌봄 공간"
    >
      {spaces.map((space) => (
        <li key={space.id}>
          <MenuRow
            icon="home-brand"
            title={careSpaceName(space)}
            description={`${currentId === space.id ? "현재 공간 · " : ""}${space.role === "owner" ? "소유자" : "구성원"}\n함께하는 가족 ${space.memberCount}명`}
            className="whitespace-pre-line"
            onClick={() => onSelect(space.id)}
          />
        </li>
      ))}
    </ul>
  );
}
