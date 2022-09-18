import Link from "next/link";
import Image from "next/image";
import { msToTimeString } from "../utils/time";
import { BookmarkIcon as BookmarkIconOutline } from "@heroicons/react/outline";
import {
  BookmarkIcon as BookmarkIconSolid,
  ChevronDownIcon,
} from "@heroicons/react/solid";
import type { Session } from "next-auth";
import { trpc } from "../utils/trpc";
import { useAtom } from "jotai";
import { savedRecipesAtom } from "../utils/atoms";
import type { RecipeForCard } from "../utils/recipe";

const RecipeCard: React.FC<{
  recipe: RecipeForCard;
  session?: Session | null;
  dropdown?: boolean;
}> = ({ recipe, dropdown = false, session }) => {
  if (session)
    return (
      <RecipeCardLoggedIn
        recipe={recipe}
        session={session}
        dropdown={dropdown}
      />
    );
  else return <RecipeCardAnon recipe={recipe} dropdown={dropdown} />;
};

const RecipeCardAnon: React.FC<{
  recipe: RecipeForCard;
  dropdown?: boolean;
}> = ({ recipe, dropdown }) => {
  return (
    <Link href={`/recipe/${recipe.id}`}>
      <div className="border-2 rounded-md cursor-pointer border-primary">
        <Image
          width={530}
          height={300}
          src={recipe.image}
          alt={recipe.name}
          className="rounded"
          objectFit="cover"
        />
        <div className="px-2 pt-0 pb-2 card-body">
          <div className="flex items-baseline justify-between">
            <h2 className="card-title">{recipe.name}</h2>
            <div>
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
          <CardTabs recipe={recipe} />
        </div>
      </div>
    </Link>
  );
};
const RecipeCardLoggedIn: React.FC<{
  recipe: RecipeForCard;
  session: Session;
  dropdown?: boolean;
}> = ({ recipe, dropdown = false, session }) => {
  const [x, setX] = useAtom(savedRecipesAtom);

  const { mutate: addRecipe } = trpc.useMutation("user.addSavedRecipe");
  const { mutate: removeRecipe } = trpc.useMutation("user.removeSavedRecipe");

  return (
    <Link href={`/recipe/${recipe.id}`}>
      <div className="border-2 rounded-md cursor-pointer border-primary">
        <Image
          width={530}
          height={300}
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
                    if (!x?.includes(recipe.id)) {
                      //add to saved recipes
                      addRecipe({
                        recipeId: recipe.id,
                      });
                      setX([...(x ?? []), recipe.id]);
                    } else {
                      //remove from saved recipes
                      removeRecipe({
                        recipeId: recipe.id,
                      });
                      const d = [...x];
                      const i = d.indexOf(recipe.id, 0);
                      if (i > -1) d.splice(i, 1);
                      setX(d);
                    }
                  }}
                >
                  {x && x.includes(recipe.id) ? (
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
          <CardTabs recipe={recipe} />
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;

const CardTabs: React.FC<{
  recipe: RecipeForCard;
}> = ({ recipe }) => (
  <div className="card-actions">
    <p className="badge badge-primary">
      {recipe.steps.length} Step
      {recipe.steps.length > 1 ? "s" : ""}
    </p>

    <p className="badge badge-primary">{msToTimeString(recipe.timeRequired)}</p>

    <div className="badge badge-ghost rating rating-sm">
      {Array.from(
        {
          length: 5,
        },
        (_, i) => (
          <input
            type="radio"
            name={`${i}_rating_${recipe.id}`}
            className="mask mask-star-2 bg-primary"
            style={{
              transform: "none",
              animation: "none",
            }}
            checked={recipe.rating === i + 1}
            readOnly
            key={`${i}_rating_${recipe.id}`}
          />
        )
      )}
    </div>

    {recipe.tags.map(({ name }, i) => {
      return (
        <p
          className="badge badge-ghost underline font-medium capitalize"
          key={name + "_" + recipe.id}
        >
          <Link href={"/tag/" + name}>{name}</Link>
        </p>
      );
    })}
  </div>
);

  