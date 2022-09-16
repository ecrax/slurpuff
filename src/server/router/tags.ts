import { z } from "zod";
import { createRouter } from "./context";

export const tagsRouter = createRouter().query("getAllTags", {
  input: z.object({
    cursor: z.string().nullish(),
  }),
  async resolve({ ctx, input }) {
    let tags;
    if (!input.cursor) {
      tags = await ctx.prisma.tag.findMany({
        take: 10,
      });
    } else {
      tags = await ctx.prisma.tag.findMany({
        take: 10,
        skip: 1,
        cursor: { id: input.cursor },
      });
    }

    return tags;
  },
});
