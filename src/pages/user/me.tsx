import type { NextPage } from "next";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Suspense, useState } from "react";
import RecipeCard from "../../components/RecipeCard";
import { trpc } from "../../utils/trpc";

const MePage: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;

  if (!session) return <div>You have to be logged in to view this page</div>;

  return <MePageContent session={session} />;
};

const MePageContent: React.FC<{ session: Session }> = ({ session }) => {
  const { data: user, isLoading } = trpc.useQuery([
    "user.getUserById",
    { id: session.user!.id! },
  ]);

  const { data: recipes, isLoading: isRecipesLoading } = trpc.useQuery([
    "user.getAllUserRecipes",
    { id: session.user!.id! },
  ]);

  const [currentTab, setCurrentTab] = useState<"all" | "saved">("all");

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
              <div>
                <h1 className="py-8 mb-2 text-4xl font-bold">
                  {!(user.firstName && user.lastName)
                    ? user.name
                    : user.firstName + " " + user.lastName}
                </h1>
              </div>
              <div className="pb-4 tabs">
                <a
                  className={`tab tab-bordered ${
                    currentTab === "all" ? "tab-active" : ""
                  }`}
                  onClick={() => setCurrentTab("all")}
                >
                  All
                </a>
                <a
                  className={`tab tab-bordered ${
                    currentTab === "saved" ? "tab-active" : ""
                  }`}
                  onClick={() => setCurrentTab("saved")}
                >
                  Saved
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {currentTab === "all" ? (
                  recipes.map((recipe) => {
                    return (
                      <RecipeCard
                        dropdown={session?.user?.id === recipe.authorId}
                        key={recipe.id}
                        recipe={recipe}
                        savedRecipes={user.savedRecipes}
                        session={session}
                      />
                    );
                  })
                ) : (
                  <Suspense fallback={<div>Loading...</div>}>
                    <DynamicSavedRecipes
                      user={user}
                      session={session}
                      recipes={recipes}
                    />
                  </Suspense>
                )}
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

export default MePage;

const DynamicSavedRecipes = dynamic(
  () => import("../../components/SavedRecipes"),
  { suspense: true, ssr: true }
);