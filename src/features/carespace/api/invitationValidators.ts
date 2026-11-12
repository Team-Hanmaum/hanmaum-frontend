import { isObject, isTimestamp } from "@/lib/api/responseValidators";
import type {
  CreatedInvitation,
  InvitationPreview,
  JoinedInvitation,
} from "./invitationTypes";

const isHttpUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

export function isCreatedInvitation(
  value: unknown,
): value is CreatedInvitation {
  return (
    isObject(value) &&
    typeof value.invitationId === "string" &&
    typeof value.spaceId === "string" &&
    isHttpUrl(value.invitationUrl) &&
    isTimestamp(value.issuedAt) &&
    isTimestamp(value.expiresAt)
  );
}

export function isInvitationPreview(
  value: unknown,
): value is InvitationPreview {
  return (
    isObject(value) &&
    typeof value.invitationId === "string" &&
    typeof value.spaceId === "string" &&
    isTimestamp(value.expiresAt) &&
    typeof value.isMember === "boolean"
  );
}

export function isJoinedInvitation(value: unknown): value is JoinedInvitation {
  return (
    isObject(value) &&
    typeof value.spaceId === "string" &&
    typeof value.membershipId === "string" &&
    (value.role === "OWNER" || value.role === "MEMBER") &&
    isTimestamp(value.joinedAt)
  );
}
