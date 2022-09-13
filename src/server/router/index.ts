// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { recipeRouter } from "./recipe";
import { userRouter } from "./user";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("recipe.", recipeRouter)
  .merge("user.", userRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
