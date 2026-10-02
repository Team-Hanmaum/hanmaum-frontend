import google from "@/assets/icons/google.svg";
import kakao from "@/assets/icons/kakao.svg";
import chevronLeft from "@/assets/icons/chevron-left.svg";
import chevronLeftDisabled from "@/assets/icons/chevron-left-disabled.svg";
import chevronDown from "@/assets/icons/chevron-down.svg";
import alert from "@/assets/icons/alert.svg";

const icons = {
  google,
  kakao,
  "chevron-left": chevronLeft,
  "chevron-left-disabled": chevronLeftDisabled,
  "chevron-down": chevronDown,
  alert,
};

export type IconName = keyof typeof icons;

export function Icon({ name }: { name: IconName }) {
  return (
    <span
      className="inline-grid size-6 shrink-0 place-items-center"
      aria-hidden="true"
    >
      <img
        src={icons[name]}
        alt=""
        draggable={false}
      />
    </span>
  );
}
