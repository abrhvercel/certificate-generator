import { PersonType } from "../types/person.type";

export const sheetToPeople = (
  arr: Array<{ [key: string]: string }>
): PersonType[] => {
  return arr.map((row) => {
    return {
      name: row["Nome"],
      email: row["Email"],
    };
  });
};
