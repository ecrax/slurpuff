import type { Recipe } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const userRouter = createRouter()
  .query("getUserById", {
    input: z.object({
      id: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });
      return user;
    },
  })
  .query("getAllUserRecipes", {
    input: z.object({
      id: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      const recipes: Recipe[] = await ctx.prisma.recipe.findMany({
        where: { authorId: input.id },
      });
      return recipes;
    },
  })
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .mutation("addSavedRecipe", {
    input: z.object({
      id: z.string().min(1),
      recipeId: z.number().min(1),
    }),
    async resolve({ ctx, input }) {
      if (ctx.session?.user?.id !== input.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Works, but fetching all saved recipes, when one adds a saved recipe is quite expensive
      //const { savedRecipes } = await ctx.prisma.user.findUniqueOrThrow({
      //  where: { id: input.id },
      //  select: { savedRecipes: true },
      //});
      //
      //if (!savedRecipes.includes(input.recipeId))
      //  savedRecipes.push(input.recipeId);

      await ctx.prisma.user.update({
        where: { id: input.id },
        data: {
          //savedRecipes: savedRecipes,
          savedRecipes: {
            push: input.recipeId,
          },
        },
      });
    },
  })
  .mutation("removeSavedRecipe", {
    input: z.object({
      id: z.string().min(1),
      recipeId: z.number().min(1),
    }),
    async resolve({ ctx, input }) {
      if (ctx.session?.user?.id !== input.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { savedRecipes } = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: input.id },
        select: { savedRecipes: true },
      });

      const i = savedRecipes.indexOf(input.recipeId, 0);
      if (i > -1) savedRecipes.splice(i, 1);

      await ctx.prisma.user.update({
        where: { id: input.id },
        data: {
          savedRecipes: {
            set: savedRecipes,
          },
        },
      });
    },
  });
