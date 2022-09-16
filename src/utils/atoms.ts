import { atom } from "jotai";

export const savedRecipesAtom = atom<string[] | undefined>(undefined);
