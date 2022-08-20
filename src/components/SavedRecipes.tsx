import type { Recipe, User } from "@prisma/client";
import type { Session } from "next-auth";
import RecipeCard from "./RecipeCard";

const SavedRecipes: React.FC<{
  recipes: Recipe[];
  user: User;
  session: Session;
}> = ({ recipes, session, user }) => {
  const savedRecipes = recipes.filter((r) => {
    user.savedRecipes?.includes(r.id);
  });

  if (savedRecipes.length === 0) return <div>No Recipes Saved Yet</div>;

  return (
    <div>
      {savedRecipes.map((recipe) => {
        return (
          <RecipeCard
            dropdown={session?.user?.id === recipe.authorId}
            key={recipe.id}
            recipe={recipe}
          />
        );
      })}
    </div>
  );
};

export default SavedRecipes;
