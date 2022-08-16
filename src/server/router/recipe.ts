import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const recipeRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      const recipes = await ctx.prisma.recipe.findMany();
      return recipes;
    },
  })
  .query("getById", {
    input: z.object({
      id: z.number().min(1),
    }),
    resolve: async ({ input, ctx }) => {
      const recipe = await ctx.prisma.recipe.findUnique({
        where: { id: input.id },
      });
      return recipe;
    },
  })
  .mutation("create", {
    input: z.object({
      name: z.string(),
      image: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
      timeRequired: z.number(),
      authorId: z.string(),
      tags: z.array(z.string()),
      notes: z.string().nullish(),
    }),
    resolve: async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ctx.prisma.recipe.create({
        data: input,
      });
    },
  });
