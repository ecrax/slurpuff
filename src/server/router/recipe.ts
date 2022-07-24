import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const recipeRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
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
    }),
    resolve: async ({ input, ctx }) => {
      await ctx.prisma.recipe.create({
        data: input,
      });
    },
  });
