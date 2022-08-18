import Link from "next/link";
import Image from "next/image";
import React from "react";
import { msToTime } from "../utils/time";
import type { Recipe } from "@prisma/client";

const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  return (
    <Link href={`/recipe/${recipe.id}`}>
      <div className="border-2 rounded-md cursor-pointer border-primary card">
        <Image
          width={300}
          height={200}
          src={recipe.image}
          alt={recipe.name}
          className="rounded"
          objectFit="cover"
        />
        <div className="p-2 card-body">
          <h2 className="card-title">{recipe.name}</h2>
          <div className="card-actions">
            <p className="badge badge-primary">
              {recipe.steps.length} Step
              {recipe.steps.length > 1 ? "s" : ""}
            </p>

            <p className="badge badge-primary">
              {msToTime(recipe.timeRequired)}
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
