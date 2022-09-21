import type { Tag } from "@prisma/client";

//TODO: I loose a lot of generated typesafety here because I want to type the JSON fields,
//there might be a way to modify the generated prisma types but I am too lazy ._.

export type RecipeForCard = {
  id: string;
  image: string;
  name: string;
  rating: number;
  steps: string[];
  tags: Tag[];
  timeRequired: number;
};

export type RecipeWithTag = {
  id: string;
  image: string;
  name: string;
  ingredients: string[];
  steps: string[];
  timeRequired: number;
  notes: string | null;
  authorId: string;
  rating: number;
  createdAt: Date;
} & {
  tags: Tag[];
};

export interface IFormInput {
  name: string;
  rating: string;
  notes: string;
  duration: {
    minutes: number;
    hours: number;
  };
  image: FileList;
  steps: { value: string }[];
  ingredients: { value: string }[];
  tags: { value: string }[];
}