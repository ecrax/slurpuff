import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const userRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
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
  });
