import type { Recipe, User } from "@prisma/client";
import type { Session } from "next-auth";
import { savedRecipesAtom } from "../utils/atoms";
import RecipeCard from "./RecipeCard";
import { useAtom } from "jotai";

const SavedRecipes: React.FC<{
  recipes: Recipe[];
  user: User;
  session: Session;
}> = ({ recipes, session, user }) => {
  const [x, setX] = useAtom(savedRecipesAtom);
  const savedRecipes = recipes.filter((r) => x.includes(r.id));

  if (savedRecipes.length === 0) return <div>No Recipes Saved Yet</div>;

  return (
    <div>
      {savedRecipes.map((recipe) => {
        return (
          <RecipeCard
            dropdown={session?.user?.id === recipe.authorId}
            key={recipe.id}
            recipe={recipe}
            session={session}
          />
        );
      })}
    </div>
  );
};

export default SavedRecipes;
