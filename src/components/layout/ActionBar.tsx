import {
  Button,
  TextAction,
  type ButtonProps,
  type TextActionProps,
} from "@/components/ui";
import { FixedBottomArea, type FixedBottomAreaProps } from "./FixedBottomArea";
export type ActionBarProps = {
  primary: Omit<ButtonProps, "children"> & { label: string };
  secondary?: Omit<TextActionProps, "children"> & { label: string };
  position?: FixedBottomAreaProps["position"];
  className?: string;
  label?: string;
};
export function ActionBar({
  primary,
  secondary,
  position,
  className = "",
  label = "화면 행동",
}: ActionBarProps) {
  const {
    label: primaryLabel,
    className: primaryClassName = "",
    ...primaryProps
  } = primary;
  const {
    label: secondaryLabel,
    className: secondaryClassName = "",
    ...secondaryProps
  } = secondary ?? {};
  return (
    <FixedBottomArea
      position={position}
      className={className}
    >
      <div
        role="group"
        aria-label={label}
        className="flex w-full flex-col gap-hm-12 bg-hm-bg-surface px-hm-20 pt-hm-16 pb-[calc(var(--hm-spacing-24)+env(safe-area-inset-bottom))]"
      >
        <Button
          {...primaryProps}
          className={`w-full ${primaryClassName}`}
        >
          {primaryLabel}
        </Button>
        {secondary && (
          <TextAction
            {...secondaryProps}
            className={`w-full ${secondaryClassName}`}
          >
            {secondaryLabel}
          </TextAction>
        )}
      </div>
    </FixedBottomArea>
  );
}
