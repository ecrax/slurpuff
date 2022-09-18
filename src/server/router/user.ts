import type { Tag } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { RecipeWithTag } from "../../utils/recipe";
import { createRouter } from "./context";

export const userRouter = createRouter()
  .query("getUserDataById", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: {
          image: true,
          id: true,
          name: true,
        },
      });
      return user;
    },
  })
  .query("getAllUserRecipes", {
    input: z.object({
      id: z.string(),
      cursor: z.string().nullish(),
    }),
    async resolve({ ctx, input }) {
      let recipes;
      if (!input.cursor) {
        recipes = await ctx.prisma.recipe.findMany({
          take: 9,
          where: { authorId: input.id },
          include: { tags: true },
        });
      } else {
        recipes = await ctx.prisma.recipe.findMany({
          take: 9,
          skip: 1,
          where: { authorId: input.id },
          cursor: { id: input.cursor },
          include: { tags: true },
        });
      }

      return recipes as RecipeWithTag[];
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
  .query("getCurrentUser", {
    async resolve({ ctx }) {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session?.user?.id },
        include: {
          savedRecipes: {
            select: {
              id: true,
            },
          },
        },
      });
      return user;
    },
  })
  .mutation("addSavedRecipe", {
    input: z.object({
      recipeId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.user.update({
        where: { id: ctx.session?.user?.id },
        data: {
          savedRecipes: {
            connect: {
              id: input.recipeId,
            },
          },
        },
      });
    },
  })
  .mutation("removeSavedRecipe", {
    input: z.object({
      recipeId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.user.update({
        where: { id: ctx.session?.user?.id },
        data: {
          savedRecipes: {
            disconnect: {
              id: input.recipeId,
            },
          },
        },
      });
    },
  });
