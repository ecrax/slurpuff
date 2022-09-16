import type { Recipe, Tag, User } from "@prisma/client";
import type { Session } from "next-auth";
import { savedRecipesAtom } from "../utils/atoms";
import RecipeCard from "./RecipeCard";
import { useAtom } from "jotai";

const SavedRecipes: React.FC<{
  recipes: (Recipe & {
    tags: Tag[];
  })[];
  user: User;
  session: Session;
}> = ({ recipes, session, user }) => {
  const [x] = useAtom(savedRecipesAtom);
  const savedRecipes = recipes.filter((r) => x!.includes(r.id));

  return (
    <>
      {savedRecipes.map((recipe) => {
        return (
          <RecipeCard
            dropdown={session.user?.id === recipe.authorId}
            key={recipe.id}
            recipe={recipe}
            session={session}
          />
        );
      })}
    </>
  );
};

export default SavedRecipes;
