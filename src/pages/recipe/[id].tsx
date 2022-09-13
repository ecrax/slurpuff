import { BookmarkIcon as BookmarkIconOutline } from "@heroicons/react/outline";
import {
  BookmarkIcon as BookmarkIconSolid,
  ChevronDownIcon,
} from "@heroicons/react/solid";
import { useAtom } from "jotai";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { savedRecipesAtom } from "../../utils/atoms";
import { msToTimeString } from "../../utils/time";
import { trpc } from "../../utils/trpc";

const RecipePage: NextPage = () => {
  const { query } = useRouter();

  const { id } = query;

  if (!id || typeof id !== "string") return <div>No id</div>;

  const _id = Number.parseInt(id);
  if (Number.isNaN(_id)) return <p>Please pass a number</p>;

  return <RecipePageContent id={_id} />;
};

const RecipePageContent: React.FC<{ id: number }> = ({ id }) => {
  const {
    data: recipe,
    isLoading: isRecipeLoading,
    error,
  } = trpc.useQuery(["recipe.getById", { id: id }]);

  const { data: user, isLoading: isLoading } = trpc.useQuery(
    ["user.getUserById", { id: recipe?.authorId! }],
    { enabled: !!recipe?.authorId }
  );
  const { mutate: deleteRecipe } = trpc.useMutation(["recipe.delete"]);
  const { mutate: addSavedRecipe } = trpc.useMutation("user.addSavedRecipe");
  const { mutate: removeSavedRecipe } = trpc.useMutation(
    "user.removeSavedRecipe"
  );

  const { data: session, status } = useSession();

  const [x, setX] = useAtom(savedRecipesAtom);

  useEffect(() => {
    if (!x && user?.savedRecipes) setX(user.savedRecipes);
    if (!session) setX([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.savedRecipes, session]);


  const router = useRouter();

  useEffect(() => {
    if (error?.data?.httpStatus === 404) {
      router.push("/404");
    }
  });

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container h-screen px-8 mx-auto">
        {!isLoading &&
        !isRecipeLoading &&
        status !== "loading" &&
        x &&
        recipe &&
        user ? (
          <>
            <div className="mt-8 h-64 md:h-72 lg:h-96 left-[50%] -ml-[50vw] -mr-[50vw] max-w-[100vw] relative right-[50%] w-screen">
              <Image
                src={recipe.image ?? ""}
                alt={recipe.name}
                objectFit="cover"
                layout="fill"
                priority
              />
            </div>

            <main className="flex flex-col items-center justify-center w-full pb-16 prose max-w-none ">
              <div className="w-full">
                <div className="flex flex-row items-baseline">
                  <h1 className="pt-8 mb-2">{recipe.name}</h1>{" "}
                  <div className="flex items-center">
                    {session && (
                      <div
                        className="ml-4 btn btn-ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!x!.includes(recipe.id)) {
                            //add to saved recipes
                            addSavedRecipe({
                              id: session.user?.id!,
                              recipeId: recipe.id,
                            });
                            setX([...x!, recipe.id]);
                          } else {
                            //remove from saved recipes
                            removeSavedRecipe({
                              id: session.user?.id!,
                              recipeId: recipe.id,
                            });
                            const d = [...x!];
                            const i = d.indexOf(recipe.id, 0);
                            if (i > -1) d.splice(i, 1);
                            setX(d);
                          }
                        }}
                      >
                        {x!.includes(recipe.id) ? (
                          <BookmarkIconSolid className="w-4 h-4" />
                        ) : (
                          <BookmarkIconOutline className="w-4 h-4" />
                        )}
                      </div>
                    )}
                    {session && session.user?.id === recipe.authorId && (
                      <div className="ml-4 dropdown dropdown-left lg:dropdown-right">
                        <label
                          tabIndex={0}
                          className="btn btn-ghost btn-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ChevronDownIcon className="w-6 h-6" />
                        </label>
                        <ul
                          tabIndex={0}
                          className="z-40 p-2 shadow dropdown-content menu bg-base-100 rounded-box w-52"
                        >
                          <li onClick={(e) => e.stopPropagation()}>
                            <Link href={`/recipe/edit/${recipe.id}`}>Edit</Link>
                          </li>
                          <li
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(
                                `https://recipes.leo-kling.dev/recipe/${recipe.id}`
                              );
                            }}
                          >
                            <span>Share</span>
                          </li>
                          <li
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRecipe({
                                id: recipe.id,
                                authorId: recipe.authorId,
                              });
                              router.replace("/recipes");
                            }}
                          >
                            <span>Delete</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <Link href={`/user/${user.id}`}>
                  <p className="link">
                    by{" "}
                    {!(user.firstName && user.lastName)
                      ? user.name
                      : user.firstName + " " + user.lastName}
                  </p>
                </Link>
                <div className="space-x-2">
                  <span className="badge badge-primary">
                    {recipe.steps.length} Step
                    {recipe.steps.length > 1 ? "s" : ""}
                  </span>

                  <span className="badge badge-primary">
                    {msToTimeString(recipe.timeRequired)}
                  </span>

                  {recipe.tags.map((t) => (
                    <span className="badge badge-ghost" key={t}>
                      {t}
                    </span>
                  ))}
                </div>

                <div className="pt-4 rating">
                  {Array.from({ length: 5 }, (_, i) => (
                    <input
                      type="radio"
                      name="rating-9"
                      className="mask mask-star-2 bg-primary"
                      checked={recipe.rating === i + 1}
                      readOnly
                      key={`${i}_rating`}
                    />
                  ))}
                </div>

                <div className="pt-8">
                  <i>~ {recipe.notes}</i>
                </div>

                <div className="grid grid-cols-3 gap-8 w-full mt-8">
                  <div>
                    <h2>Ingredients</h2>
                    {recipe.ingredients.map((ingr) => (
                      <div key={ingr}>
                        <span className="font-bold">
                          {ingr.substring(0, ingr.indexOf(" "))}
                        </span>{" "}
                        <span>{ingr.substring(ingr.indexOf(" ") + 1)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="col-span-2">
                    <h2>Steps</h2>
                    {recipe.steps.map((s, i) => (
                      <div key={s}>
                        <span className="font-bold">{i + 1}.</span>
                        {" " + s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </main>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </>
  );
};;

export default RecipePage;
