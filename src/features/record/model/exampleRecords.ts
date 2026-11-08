// 미연동 예시 화면(돌봄·제안 등)이 여는 메모리 예시 소식의 ID. 실제 소식 ID는 UUID다.
export const isExampleRecordId = (recordId: string) =>
  recordId.startsWith("mock-");
