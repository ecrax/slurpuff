import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "../utils/trpc";

const Recipes: NextPage = () => {
  const { data: session, status } = useSession();

  const { data: recipes } = trpc.useQuery(["recipe.getAll"]);

  if (status === "loading") {
    return <p>Loading</p>;
  } else if (!session) {
    console.log("test");
    return <p>Please Sign in</p>;
  } else {
    return (
      <>
        <Head>
          <title>Create T3 App</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="container h-screen p-8 mx-auto">
          {session && (
            <>
              <nav className="flex flex-row justify-between">
                <p>Signed in as {session.user?.email}</p>
                <button
                  onClick={() => {
                    signOut();
                  }}
                >
                  Sign out
                </button>
              </nav>
              <main className="flex flex-col items-center justify-center">
                <div className="grid grid-cols-4 gap-7">
                  {recipes ? (
                    recipes.map((recipe, i) => {
                      return (
                        <Link key={i} href={`/recipe/${recipe.id}`}>
                          <div className="border-2 rounded-md border-amber-300">
                            <Image
                              width={300}
                              height={200}
                              src={recipe.image}
                              alt={recipe.name}
                              className="rounded"
                              objectFit="contain"
                            />
                            <div className="p-2">
                              <p>{recipe.name}</p>
                              <p>
                                {recipe.steps.length} Step
                                {recipe.steps.length > 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
              </main>
            </>
          )}
        </div>
      </>
    );
  }
};

export default Recipes;
