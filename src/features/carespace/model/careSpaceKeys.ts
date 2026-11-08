export const careSpaceKeys = {
  all: ["carespace"] as const,
  list: () => [...careSpaceKeys.all, "list"] as const,
};
