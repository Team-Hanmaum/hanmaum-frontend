import type { SocialProvider } from "@/components/ui";
import { getApiBaseUrl } from "@/lib/env";
import { localDevelopment } from "@/lib/localDevelopment";

export function getOAuthLoginUrl(
  provider: SocialProvider,
  frontendOrigin: string,
) {
  const url = new URL(`/oauth2/authorization/${provider}`, getApiBaseUrl());
  // BE must persist this allowlisted selector with the OAuth request/state.
  // Production builds never request a local callback.
  if (
    import.meta.env.DEV &&
    frontendOrigin === localDevelopment.origin &&
    url.origin === localDevelopment.apiOrigin
  )
    url.searchParams.set("frontend", "local");
  return url.href;
}
