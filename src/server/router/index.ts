// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { recipeRouter } from "./recipe";
import { userRouter } from "./user";
import { tagsRouter } from "./tags";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("recipe.", recipeRouter)
  .merge("user.", userRouter)
  .merge("tags.", tagsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
