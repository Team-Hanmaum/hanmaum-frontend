export type UpdateSpaceInfoBody = {
  subjectLabel: string;
  expectedSpaceVersion: string;
  clientRequestId: string;
};

export type UpdateSpaceInfoResult = {
  spaceId: string;
  subjectLabel: string;
  version: string;
  updatedAt: string;
};
