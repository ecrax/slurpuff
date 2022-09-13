import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import RecipeCard from "../components/RecipeCard";
import { savedRecipesAtom } from "../utils/atoms";
import { trpc } from "../utils/trpc";
import { useAtom } from "jotai";
import { useEffect } from "react";

const Recipes: NextPage = () => {
  const [x, setX] = useAtom(savedRecipesAtom);
  const { data: recipes } = trpc.useQuery(["recipe.getAll"]);
  const { data: session, status } = useSession();
  const { data: user, isLoading } = trpc.useQuery(
    ["user.getUserById", { id: session?.user?.id ?? "" }],
    {
      enabled: !!session?.user?.id,
    }
  );

  useEffect(() => {
    if (x.length === 0 && user?.savedRecipes) setX(user.savedRecipes);
  }, [setX, user?.savedRecipes, x.length]);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container h-screen px-8 mx-auto">
        <main className="flex flex-col items-center justify-center mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {recipes && !isLoading && status !== "loading" ? (
              recipes.map((recipe) => {
                return (
                  <RecipeCard
                    session={session}
                    recipe={recipe}
                    key={recipe.id}
                  />
                );
              })
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Recipes;
