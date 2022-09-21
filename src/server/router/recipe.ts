import type { RecipeForCard, RecipeWithTag } from "../../utils/recipe";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const recipeRouter = createRouter()
  .query("getAll", {
    input: z.object({ cursor: z.string().nullish() }),
    async resolve({ ctx, input }) {
      let recipes;
      if (!input.cursor) {
        recipes = await ctx.prisma.recipe.findMany({
          take: 9,
          select: {
            id: true,
            image: true,
            name: true,
            rating: true,
            steps: true,
            tags: true,
            timeRequired: true,
          },
        });
      } else {
        recipes = await ctx.prisma.recipe.findMany({
          take: 9,
          skip: 1,
          cursor: {
            id: input.cursor,
          },
          select: {
            id: true,
            image: true,
            name: true,
            rating: true,
            steps: true,
            tags: true,
            timeRequired: true,
          },
        });
      }

      return recipes as RecipeForCard[];
    },
  })
  .query("getById", {
    input: z.object({
      id: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      const recipe = await ctx.prisma.recipe.findUnique({
        where: { id: input.id },
        include: { tags: true },
      });

      if (recipe === null) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return recipe as RecipeWithTag;
    },
  })
  .query("getAllWithTag", {
    input: z.object({
      tag: z.string(),
      cursor: z.string().nullish(),
    }),
    resolve: async ({ input, ctx }) => {
      let recipes;
      if (!input.cursor) {
        recipes = await ctx.prisma.recipe.findMany({
          take: 9,
          where: {
            tags: {
              some: {
                name: input.tag,
              },
            },
          },
          select: {
            id: true,
            image: true,
            name: true,
            rating: true,
            steps: true,
            tags: true,
            timeRequired: true,
          },
        });
      } else {
        recipes = await ctx.prisma.recipe.findMany({
          take: 9,
          skip: 1,
          cursor: {
            id: input.cursor,
          },
          where: {
            tags: {
              some: {
                name: input.tag,
              },
            },
          },
          select: {
            id: true,
            image: true,
            name: true,
            rating: true,
            steps: true,
            tags: true,
            timeRequired: true,
          },
        });
      }

      return recipes as RecipeForCard[];
    },
  })
  .query("getAllWithTags", {
    input: z.object({
      tags: z.array(z.string()),
      cursor: z.string().nullish(),
    }),
    resolve: async ({ input, ctx }) => {
      let recipes;
      if (!input.cursor) {
        recipes = await ctx.prisma.recipe.findMany({
          take: 9,
          where: {
            tags: {
              some: {
                name: {
                  in: input.tags
                }
              }
            },
          },
          select: {
            id: true,
            image: true,
            name: true,
            rating: true,
            steps: true,
            tags: true,
            timeRequired: true,
          },
        });
      } else {
        recipes = await ctx.prisma.recipe.findMany({
          take: 9,
          skip: 1,
          cursor: {
            id: input.cursor,
          },
          where: {
            tags: {
              some: {
                name: {
                  in: input.tags
                }
              }
            },
          },
          select: {
            id: true,
            image: true,
            name: true,
            rating: true,
            steps: true,
            tags: true,
            timeRequired: true,
          },
        });
      }

      return recipes as RecipeForCard[];
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
      //authorId: z.string(),
      tags: z.array(z.string()),
      notes: z.string().nullish(),
      rating: z.number(),
    }),
    resolve: async ({ input, ctx }) => {
      await ctx.prisma.recipe.create({
        data: {
          name: input.name,
          image: input.image,
          ingredients: input.ingredients,
          steps: input.steps,
          timeRequired: input.timeRequired,
          tags: {
            connectOrCreate: input.tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
          notes: input.notes,
          rating: input.rating,
          authorId: ctx.session?.user?.id!,
        },
      });
    },
  })
  .mutation("update", {
    input: z.object({
      id: z.string(),
      name: z.string().nullish(),
      image: z.string().nullish(),
      ingredients: z.array(z.string()).nullish(),
      steps: z.array(z.string()).nullish(),
      timeRequired: z.number().nullish(),
      tags: z.array(z.string()).nullish(),
      oldTags: z.array(z.string()),
      notes: z.string().nullish(),
      rating: z.number().nullish(),
    }),
    resolve: async ({ input, ctx }) => {
      const recipe = await ctx.prisma.recipe.findUniqueOrThrow({
        where: { id: input.id },
        select: { authorId: true },
      });
      if (recipe.authorId !== ctx.session?.user?.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
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
          tags: !input.tags
            ? undefined
            : {
                disconnect: input.oldTags
                  .filter((x) => !input.tags?.includes(x))
                  .map((tag) => ({
                    name: tag,
                  })),
                connectOrCreate: input.tags.map((tag) => ({
                  where: {
                    name: tag,
                  },
                  create: {
                    name: tag,
                  },
                })),
              },
          notes: input.notes ?? undefined,
          rating: input.rating ?? undefined,
        },
      });
    },
  })
  //.mutation("insertTests", {
  //  resolve: async ({ ctx }) => {
  //    for (let i = 0; i < 20; i++) {
  //      console.log("test");
  //
  //      await ctx.prisma.recipe.create({
  //        data: {
  //          image:
  //            "http://res.cloudinary.com/ecrax/image/upload/v1660649006/slurpuff/dtl9gi7erh1irkccanpm.jpg",
  //          name: i.toString(),
  //          rating: 1,
  //          timeRequired: 360000,
  //          authorId: "cl6w3f4zy0261lap9e61safzd",
  //          ingredients: ["dsad"],
  //          steps: ["dsad"],
  //          tags: ["dsad"],
  //        },
  //      });
  //    }
  //  },
  //})
  .mutation("delete", {
    input: z.object({ recipeId: z.string() }),
    resolve: async ({ input, ctx }) => {
      const recipe = await ctx.prisma.recipe.findUniqueOrThrow({
        where: { id: input.recipeId },
        select: { authorId: true },
      });
      if (recipe.authorId !== ctx.session?.user?.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.prisma.recipe.delete({
        where: {
          id: input.recipeId,
        },
      });
    },
  });
