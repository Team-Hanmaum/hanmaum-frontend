import { iconSources, type IconName } from "./iconSources";
export type { IconName } from "./iconSources";

export function Icon({ name }: { name: IconName }) {
  return (
    <span
      className="relative inline-grid size-6 shrink-0 place-items-center"
      aria-hidden="true"
    >
      <img
        src={iconSources[name]}
        className={
          name === "link" ? "absolute top-0 right-0 max-w-none" : "max-w-none"
        }
        alt=""
        draggable={false}
      />
    </span>
  );
}
