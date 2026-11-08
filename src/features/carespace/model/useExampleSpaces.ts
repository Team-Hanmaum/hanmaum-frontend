import { useLayoutEffect } from "react";
import type { CareSpaceSummary } from "../api/careSpaceTypes";
import { mockCareSpaces } from "./mockCareSpaces";
import { mockSpaceInfoChanges } from "./mockSpaceInfoChanges";
import { useExampleRevision } from "@/lib/examplePreview";

// Real membership is checked by API routes. This separate memory model supplies
// sample people and work items only to unconnected screens, never to the home API.
export function useExampleSpaces(
  spaces: readonly CareSpaceSummary[] | undefined,
) {
  const revision = useExampleRevision();
  useLayoutEffect(() => {
    spaces?.forEach((space) => {
      mockCareSpaces.ensureExampleSpace({
        id: space.spaceId,
        subjectLabel: space.subjectLabel,
        role: space.role === "OWNER" ? "owner" : "member",
      });
      const example = mockCareSpaces
        .getSnapshot()
        .spaces.find((entry) => entry.id === space.spaceId);
      if (example) mockSpaceInfoChanges.ensureExample(example);
    });
  }, [spaces, revision]);
}
