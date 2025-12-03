import { Tab } from "../types/tabTypes";

export const reorder = (
  list: Tab[],
  startIndex: number,
  endIndex: number
): Tab[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
