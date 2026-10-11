export function getApiBaseUrl(): string {
  const value = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!value) {
    throw new Error("VITE_API_BASE_URL에 API 서버 주소를 설정해주세요.");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      "VITE_API_BASE_URL은 올바른 HTTP 또는 HTTPS 주소여야 합니다.",
    );
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "VITE_API_BASE_URL에는 경로·쿼리·인증 정보 없이 API 서버 주소만 설정해주세요.",
    );
  }

  return url.origin;
}
