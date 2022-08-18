import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import RecipeCard from "../../components/RecipeCard";
import { msToTime } from "../../utils/time";
import { trpc } from "../../utils/trpc";

const UserPage: NextPage = () => {
  const { query } = useRouter();
  const { id } = query;

  if (!id || typeof id !== "string") return <div>No id</div>;

  return <UserPageContent id={id} />;
};

const UserPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data: user, isLoading } = trpc.useQuery([
    "user.getUserById",
    { id: id },
  ]);

  const { data: recipes, isLoading: isRecipesLoading } = trpc.useQuery([
    "user.getAllUserRecipes",
    { id: id },
  ]);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container h-screen px-8 mx-auto">
        {!isLoading && !isRecipesLoading && recipes && user ? (
          <>
            <main className="flex flex-col items-center justify-center pb-16">
              <div>
                <img
                  src={user.image ?? ""}
                  alt={user.name ?? "Avatar of user"}
                  className="rounded-full"
                />
              </div>
              <div className="">
                <h1 className="py-8 mb-2 text-4xl font-bold">
                  {!(user.firstName && user.lastName)
                    ? user.name
                    : user.firstName + " " + user.lastName}
                </h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {recipes.map((recipe) => {
                  return <RecipeCard key={recipe.id} recipe={recipe} />;
                })}
              </div>
            </main>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </>
  );
};

export default UserPage;