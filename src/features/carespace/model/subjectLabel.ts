export function normalizeSubjectLabel(value: string) {
  return value.replace(/^[\s\p{Z}]+|[\s\p{Z}]+$/gu, "");
}

export function validateSubjectLabel(value: string) {
  const label = normalizeSubjectLabel(value);
  return !label ||
    Array.from(label).length > 30 ||
    /[\r\n\u2028\u2029]/u.test(label)
    ? "이름 또는 호칭을 줄바꿈 없이 1~30자로 입력해 주세요."
    : "";
}
