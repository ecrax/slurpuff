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
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
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
      await ctx.prisma.recipe.create({
        data: input,
      });
    },
  })
  .mutation("update", {
    input: z.object({
      id: z.number(),
      authorId: z.string(),
      name: z.string().nullish(),
      image: z.string().nullish(),
      ingredients: z.array(z.string()).nullish(),
      steps: z.array(z.string()).nullish(),
      timeRequired: z.number().nullish(),
      tags: z.array(z.string()).nullish(),
      notes: z.string().nullish(),
    }),
    resolve: async ({ input, ctx }) => {
      if (ctx.session?.user?.id !== input.authorId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ctx.prisma.recipe.update({
        where: {
          id: input.id,
        },
        data: {
          id: input.id,
          name: input.name ?? undefined,
          image: input.image ?? undefined,
          ingredients: input.ingredients ?? undefined,
          steps: input.steps ?? undefined,
          timeRequired: input.timeRequired ?? undefined,
          tags: input.tags ?? undefined,
          notes: input.notes ?? undefined,
        },
      });
    },
  });
