import { atom } from "jotai";

export const savedRecipesAtom = atom<number[] | undefined>(undefined);
