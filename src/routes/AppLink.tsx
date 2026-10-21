import { Link, type LinkProps } from "react-router";
import type { Ref } from "react";
import { canAnimateNavigation } from "./routeMotion";

export function AppLink({
  viewTransition,
  ...props
}: LinkProps & { ref?: Ref<HTMLAnchorElement> }) {
  return (
    <Link
      {...props}
      viewTransition={viewTransition ?? canAnimateNavigation()}
    />
  );
}
