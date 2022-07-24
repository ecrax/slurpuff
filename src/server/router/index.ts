// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { authRouter } from "./auth";
import { recipeRouter } from "./recipe";
import { userRouter } from "./user";
import { imageRouter } from "./image";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("auth.", authRouter)
  .merge("recipe.", recipeRouter)
  .merge("user.", userRouter)
  .merge("image.", imageRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
