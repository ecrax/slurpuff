import Link from "next/link";
import Image from "next/image";
import { msToTimeString } from "../utils/time";
import { BookmarkIcon as BookmarkIconOutline } from "@heroicons/react/outline";
import {
  BookmarkIcon as BookmarkIconSolid,
  ChevronDownIcon,
} from "@heroicons/react/solid";
import type { Recipe } from "@prisma/client";
import type { Session } from "next-auth";
import { useState } from "react";
import { trpc } from "../utils/trpc";

const RecipeCard: React.FC<{
  recipe: Recipe;
  session?: Session | null;
  savedRecipes?: number[];
  dropdown?: boolean;
}> = ({ recipe, dropdown = false, session, savedRecipes }) => {
  const [isSaved, setIsSaved] = useState(
    !!savedRecipes &&
      savedRecipes.length > 0 &&
      savedRecipes.includes(recipe.id)
  );

    const utils = trpc.useContext();

    const { mutate: addRecipe } = trpc.useMutation("user.addSavedRecipe", {
      onSuccess(_, variables) {
        utils.invalidateQueries(["user.getUserById", { id: variables.id }]);
      },
    });
    const { mutate: removeRecipe } = trpc.useMutation(
      "user.removeSavedRecipe",
      {
        onSuccess(_, variables) {
          utils.invalidateQueries(["user.getUserById", { id: variables.id }]);
        },
      }
    );
    console.log(recipe.rating);

    return (
      <Link href={`/recipe/${recipe.id}`}>
        <div className="border-2 rounded-md cursor-pointer border-primary">
          <Image
            width={445}
            height={220}
            src={recipe.image}
            alt={recipe.name}
            className="rounded"
            objectFit="cover"
          />
          <div className="px-2 pt-0 pb-2 card-body">
            <div className="flex items-baseline justify-between">
              <h2 className="card-title">{recipe.name}</h2>

              <div>
                {session && (
                  <div
                    className="px-2 btn btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSaved) {
                        //add to saved recipes
                        addRecipe({
                          id: session.user?.id!,
                          recipeId: recipe.id,
                        });
                      } else {
                        //remove from saved recipes
                        removeRecipe({
                          id: session.user?.id!,
                          recipeId: recipe.id,
                        });
                      }
                      setIsSaved(!isSaved);
                    }}
                  >
                    {isSaved ? (
                      <BookmarkIconSolid className="w-4 h-4" />
                    ) : (
                      <BookmarkIconOutline className="w-4 h-4" />
                    )}
                  </div>
                )}

                {dropdown && (
                  <div className="mx-2 dropdown dropdown-left lg:dropdown-right">
                    <label
                      tabIndex={0}
                      className="btn btn-ghost btn-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ChevronDownIcon className="w-4 h-4" />
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
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="card-actions">
              <p className="badge badge-primary">
                {recipe.steps.length} Step
                {recipe.steps.length > 1 ? "s" : ""}
              </p>

              <p className="badge badge-primary">
                {msToTimeString(recipe.timeRequired)}
              </p>

              <div className="badge badge-ghost rating rating-sm">
                {Array.from({ length: 5 }, (_, i) => (
                  <input
                    type="radio"
                    name={`${i}_rating`}
                    className="mask mask-star-2 bg-primary"
                    checked={recipe.rating === i + 1}
                    readOnly
                    key={`${i}_rating_${recipe.id}`}
                  />
                ))}
              </div>

              {recipe.tags.map((t, i) => {
                return (
                  <p className="badge badge-ghost" key={i}>
                    {t}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </Link>
    );
};

export default RecipeCard;
