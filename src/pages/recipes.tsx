import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import RecipeCard from "../components/RecipeCard";
import { savedRecipesAtom } from "../utils/atoms";
import { trpc } from "../utils/trpc";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { type Session } from "next-auth";
import LoadingSpinner from "../components/LoadingSpinner";

const Recipes: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") return <LoadingSpinner />;

  if (session) return <RecipePageLoggedIn session={session} />;
  else return <RecipePageAnon />;
};

const RecipePageLoggedIn: React.FC<{ session: Session }> = ({ session }) => {
  const [x, setX] = useAtom(savedRecipesAtom);
  const { data: recipes } = trpc.useQuery(["recipe.getAll"]);
  const { data: user, isLoading } = trpc.useQuery(["user.getCurrentUser"], {
    enabled: !!session.user?.id,
  });

  useEffect(() => {
    if (!x && user?.savedRecipes) setX(user.savedRecipes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.savedRecipes, session]);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container h-screen px-8 mx-auto">
        <main className="flex flex-col items-center justify-center mt-8">
          {recipes && x && !isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {recipes.map((recipe) => {
                return (
                  <RecipeCard
                    session={session}
                    recipe={recipe}
                    key={recipe.id}
                  />
                );
              })}
            </div>
          ) : (
            <LoadingSpinner />
          )}
        </main>
      </div>
    </>
  );
};
const RecipePageAnon: React.FC = () => {
  const { data: recipes } = trpc.useQuery(["recipe.getAll"]);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container h-screen px-8 mx-auto">
        <main className="flex flex-col items-center justify-center mt-8">
          {recipes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {recipes.map((recipe) => {
                return <RecipeCard recipe={recipe} key={recipe.id} />;
              })}
            </div>
          ) : (
            <LoadingSpinner />
          )}
        </main>
      </div>
    </>
  );
};

export default Recipes;
