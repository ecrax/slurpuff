import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

import { v2 as cloudinary } from "cloudinary";

const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const imageRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .mutation("upload", {
    input: z.object({
      image: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      //console.log("file?", input.file);
      const { secure_url } = await cloudinary.uploader.upload(
        input.image,
        { folder: "slurpuff" },
        function (error, result) {
          console.log(result, error);
        }
      );

      return secure_url;
    },
  });
