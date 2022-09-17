import type { Tag } from "@prisma/client";
import type { NextPage } from "next";
import type { Session } from "next-auth";
import type { InfiniteData } from "react-query";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import RecipeCard from "../../components/RecipeCard";
import { savedRecipesAtom } from "../../utils/atoms";
import { trpc } from "../../utils/trpc";
import Link from "next/link";
import capitalize from "../../utils/capitalize";

const TagPage: NextPage = () => {
  const { query } = useRouter();
  const { name } = query;

  const { data: session, status } = useSession();

  if (status === "loading") return <LoadingSpinner />;

  if (!name || typeof name !== "string") return <div>No name</div>;

  if (session) return <TagPageContentLoggedIn name={name} session={session} />;
  else return <TagPageContentAnon name={name} />;
};

const TagPageContentLoggedIn: React.FC<{ name: string; session: Session }> = ({
  name,
  session,
}) => {
  const [x, setX] = useAtom(savedRecipesAtom);
  const {
    data: recipePages,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = trpc.useInfiniteQuery(["recipe.getAllWithTag", { tag: name }], {
    getNextPageParam: (lastPage) => lastPage.at(8)?.id,
  });

  const {
    data: tagPages,
    fetchNextPage: fetchNextTagPage,
    isFetchingNextPage: isFetchingNextTagPage,
    hasNextPage: hasNextTagPage,
  } = trpc.useInfiniteQuery(["tags.getAllTags", {}], {
    getNextPageParam: (lastPage) => lastPage.at(9)?.id,
  });

  const { data: user, isLoading } = trpc.useQuery(["user.getCurrentUser"], {
    enabled: !!session.user?.id,
  });

  useEffect(() => {
    if (!x && user?.savedRecipes) setX(user.savedRecipes.map((v) => v.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.savedRecipes]);

  return (
    <>
      <Head>
        <title>{capitalize(name)}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container h-screen px-8 mx-auto">
        {recipePages && tagPages && x && !isLoading ? (
          <>
            <TagPageHeader
              tagPages={tagPages}
              fetchNextPage={fetchNextTagPage}
              hasNextPage={hasNextTagPage}
              isFetchingNextPage={isFetchingNextTagPage}
              name={name}
            />
            <main className="flex flex-col items-center justify-center mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {recipePages.pages.map((recipes) =>
                  recipes.map((recipe) => {
                    return (
                      <RecipeCard
                        session={session}
                        recipe={recipe}
                        key={recipe.id}
                      />
                    );
                  })
                )}
              </div>
              <div className="mb-8 px-8 py-4 my-16">
                {isFetchingNextPage ? (
                  <LoadingSpinner height="mb-8 h-full" />
                ) : hasNextPage ? (
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                    className="mb-8 px-8 py-4 bg-base-200 rounded-xl"
                  >
                    Load More
                  </button>
                ) : (
                  ""
                )}
              </div>
            </main>
          </>
        ) : (
          <LoadingSpinner />
        )}
      </div>
    </>
  );
};

const TagPageContentAnon: React.FC<{ name: string }> = ({ name }) => {
  const {
    data: recipePages,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = trpc.useInfiniteQuery(["recipe.getAllWithTag", { tag: name }], {
    getNextPageParam: (lastPage) => lastPage.at(8)?.id,
  });

  const {
    data: tagPages,
    fetchNextPage: fetchNextTagPage,
    isFetchingNextPage: isFetchingNextTagPage,
    hasNextPage: hasNextTagPage,
  } = trpc.useInfiniteQuery(["tags.getAllTags", {}], {
    getNextPageParam: (lastPage) => lastPage.at(9)?.id,
  });

  return (
    <>
      <Head>
        <title>{capitalize(name)}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container h-screen px-8 mx-auto">
        {recipePages && tagPages ? (
          <>
            <TagPageHeader
              tagPages={tagPages}
              fetchNextPage={fetchNextTagPage}
              hasNextPage={hasNextTagPage}
              isFetchingNextPage={isFetchingNextTagPage}
              name={name}
            />
            <main className="flex flex-col items-center justify-center mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {recipePages.pages.map((recipes) =>
                  recipes.map((recipe) => {
                    return <RecipeCard recipe={recipe} key={recipe.id} />;
                  })
                )}
              </div>
              <div className="mb-8 px-8 py-4 my-16">
                {isFetchingNextPage ? (
                  <LoadingSpinner height="mb-8 h-full" />
                ) : hasNextPage ? (
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                    className="mb-8 px-8 py-4 bg-base-200 rounded-xl"
                  >
                    Load More
                  </button>
                ) : (
                  ""
                )}
              </div>
            </main>
          </>
        ) : (
          <LoadingSpinner />
        )}
      </div>
    </>
  );
};

const TagPageHeader: React.FC<{
  name: string;
  tagPages: InfiniteData<Tag[]>;
  fetchNextPage: any;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
}> = ({ name, tagPages, fetchNextPage, isFetchingNextPage, hasNextPage }) => {
  return (
    <>
      <h1 className="text-4xl font-extrabold capitalize">{name}</h1>
      <div className="pt-6">
        <p className="text-2xl font-bold pb-2">Other tags:</p>
        <div className="flex gap-4 items-center flex-wrap">
          {tagPages.pages.map((tags) =>
            tags.map((tag) => {
              return (
                <p className="capitalize btn btn-outline" key={tag.id}>
                  <Link href={"/tag/" + tag.name}>{tag.name}</Link>
                </p>
              );
            })
          )}
          {isFetchingNextPage ? (
            <LoadingSpinner height="h-12" />
          ) : hasNextPage ? (
            <button
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
              className="btn btn-ghost px-8 py-4 bg-base-200 rounded-xl"
            >
              Load More
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};

export default TagPage;
