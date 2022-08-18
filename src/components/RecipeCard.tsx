import Link from "next/link";
import Image from "next/image";
import React from "react";
import { msToTimeString } from "../utils/time";
import { ChevronDownIcon } from "@heroicons/react/solid";
import type { Recipe } from "@prisma/client";

const RecipeCard: React.FC<{ recipe: Recipe; dropdown?: boolean }> = ({
  recipe,
  dropdown = false,
}) => {
  return (
    <Link href={`/recipe/${recipe.id}`}>
      <div className="border-2 rounded-md cursor-pointer border-primary">
        <Image
          width={340}
          height={220}
          src={recipe.image}
          alt={recipe.name}
          className="rounded"
          objectFit="cover"
        />
        <div className="px-2 pt-0 pb-2 card-body">
          <div className="flex items-baseline justify-between">
            <h2 className="card-title">{recipe.name}</h2>

            {dropdown && (
              <div className="dropdown">
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
          <div className="card-actions">
            <p className="badge badge-primary">
              {recipe.steps.length} Step
              {recipe.steps.length > 1 ? "s" : ""}
            </p>

            <p className="badge badge-primary">
              {msToTimeString(recipe.timeRequired)}
            </p>

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
