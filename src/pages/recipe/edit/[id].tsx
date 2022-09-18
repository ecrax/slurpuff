import type { NextPage } from "next";
import type { Session } from "next-auth";
import type { RecipeWithTag } from "../../../utils/recipe";
import type { IFormInput } from "../../../utils/recipe";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/solid";
import styles from "../../../styles/New.module.css";
import { useRouter } from "next/router";
import { trpc } from "../../../utils/trpc";
import { msToTime, toMiliseconds } from "../../../utils/time";
import DynamicInput from "../../../components/DynamicInput";
import Image from "next/image";
import { uploadImage } from "../../../utils/uploadImage";
import LoadingSpinner from "../../../components/LoadingSpinner";
import capitalize from "../../../utils/capitalize";
import { type SubmitHandler, useForm } from "react-hook-form";

const Edit: NextPage = () => {
  const { query } = useRouter();
  const { id } = query;
  const { data: session, status } = useSession();

  if (!id || typeof id !== "string") return <div>No id</div>;

  if (status === "loading") {
    return <LoadingSpinner />;
  } else if (!session) {
    return <p>Please Sign in</p>;
  }

  return <LoadRecipe session={session} id={id} />;
};

const LoadRecipe: React.FC<{ session: Session; id: string }> = ({
  id,
  session,
}) => {
  const {
    isLoading,
    data: oldRecipe,
    error,
  } = trpc.useQuery(["recipe.getById", { id: id }]);

  const router = useRouter();

  useEffect(() => {
    if (error?.data?.httpStatus === 404) {
      router.push("/404");
    }
  });

  if (!isLoading && oldRecipe) {
    if (oldRecipe.authorId !== session.user?.id)
      return <div>You can only edit a recipe if you are the author</div>;
    return <EditContent session={session} oldRecipe={oldRecipe} />;
  } else {
    return <LoadingSpinner />;
  }
};

const arrayIsEqual = (array1: string[], array2: string[]) => {
  return (
    array1.length === array2.length &&
    array1.every(function (element, index) {
      return element === array2[index];
    })
  );
};

const EditContent: React.FC<{
  session: Session;
  oldRecipe: RecipeWithTag;
}> = ({ session, oldRecipe }) => {
  const router = useRouter();

  const { error: updateError, mutateAsync: updateRecipe } = trpc.useMutation([
    "recipe.update",
  ]);

  const timeRequired = msToTime(oldRecipe.timeRequired);

  const [updateIsLoading, setUpdateIsLoading] = useState(false);
  const [ratingUi, setRatingUi] = useState(oldRecipe.rating);

  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
  } = useForm<IFormInput>({
    mode: "onBlur",
    defaultValues: {
      rating: oldRecipe.rating,
      duration: {
        hours: timeRequired.hrs,
        minutes: timeRequired.mins,
      },
      notes: oldRecipe.notes as string | undefined,
      name: oldRecipe.name,
      ingredients: oldRecipe.ingredients.map((v) => ({
        value: v,
      })),
      steps: oldRecipe.steps.map((v) => ({
        value: v,
      })),
      tags: oldRecipe.tags.map((v) => ({
        value: capitalize(v.name),
      })),
    },
  });
  const onSubmit: SubmitHandler<IFormInput> = (data) => handleUpdate(data);

  const handleUpdate = async (data: IFormInput) => {
    console.log(data);

    if (!session.user?.id) return;
    setUpdateIsLoading(true);

    const { image, duration, name, ingredients, steps, notes, rating, tags } =
      data;

    let uploadedImageUrl: string | undefined;
    if (image.length > 0) {
      const img = image.item(0);
      if (img) uploadedImageUrl = await uploadImage(img);
    }

    const durationMs = toMiliseconds(
      duration.hours === NaN ? 0 : duration.hours,
      duration.minutes === NaN ? 0 : duration.minutes,
      0
    );

    const transformedIngredients = ingredients.map((i) => i.value);
    const transformedSteps = steps.map((i) => i.value);
    const transformedTags = tags.map((i) => i.value);

    await updateRecipe(
      {
        id: oldRecipe.id,
        name: name === oldRecipe.name ? undefined : name.trim(),
        ingredients: arrayIsEqual(transformedIngredients, oldRecipe.ingredients)
          ? undefined
          : transformedIngredients.map((v) => v.trim()),
        steps: arrayIsEqual(transformedSteps, oldRecipe.steps)
          ? undefined
          : transformedSteps.map((v) => v.trim()),
        tags: arrayIsEqual(
          transformedTags,
          oldRecipe.tags.map(({ name }) => name)
        )
          ? undefined
          : transformedTags.map((v) => v.trim().toLowerCase()),
        oldTags: oldRecipe.tags.map(({ name }) => name),
        image: !uploadedImageUrl ? undefined : uploadedImageUrl,
        timeRequired:
          durationMs === oldRecipe.timeRequired ? undefined : durationMs,
        notes: notes === oldRecipe.notes ? undefined : notes?.trim(),
        rating: rating === oldRecipe.rating ? undefined : rating,
      },
      {
        onSuccess() {
          //console.log("update successfull");
          router.push(`/recipe/${oldRecipe.id}`);
        },
      }
    );
    setUpdateIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>Edit recipe: {oldRecipe.name}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container h-screen px-8 mx-auto">
        <div className="flex flex-col items-center justify-center">
          <main className="w-full prose">
            <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
              <div className="py-2">
                <label>
                  <h3>Name</h3>
                  {errors.name && (
                    <p className="text-red-500">{errors.name.message}</p>
                  )}
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full input input-bordered"
                    {...register("name", {
                      required: {
                        message: "Enter a name",
                        value: true,
                      },
                    })}
                  />
                </label>
              </div>
              <div className="py-2">
                <label>
                  <h3>Rating</h3>
                  <div className="rating">
                    {Array.from({ length: 5 }, (_, i) => (
                      <input
                        type="radio"
                        key={`${i}_rating`}
                        className="mask mask-star-2 bg-primary"
                        value={i + 1}
                        checked={i + 1 === ratingUi}
                        onClick={() => setRatingUi(i + 1)}
                        {...register("rating", { valueAsNumber: true })}
                      />
                    ))}
                  </div>
                </label>
              </div>
              <div className="py-2">
                <label>
                  <h3>Notes</h3>
                  <input
                    type="text"
                    placeholder="Notes"
                    className="w-full input input-bordered"
                    {...register("notes", { required: false })}
                  />
                </label>
              </div>
              <div className="py-2">
                <label>
                  <h3>Image</h3>
                  <Image
                    src={oldRecipe.image}
                    width={1000}
                    height={500}
                    alt={oldRecipe.name}
                    objectFit="cover"
                  />
                  {errors.image && (
                    <p className="text-red-500">{errors.image.message}</p>
                  )}
                  <input
                    {...register("image", {
                      required: false,
                    })}
                    accept=".jpg, .png, .jpeg"
                    type="file"
                    className="block w-full border rounded-lg cursor-pointer file:hover:border-r-base-100 file:mr-2 file:border-base-100 border-base-300 file:hover:bg-transparent file:border-r-1 file:border-l-0 file:border-t-0 file:border-b-0 file:rounded-none file:btn file:bg-transparent file:text-neutral bg-inherit"
                  />
                </label>
              </div>
              <div className="py-2">
                <label className={styles.inputGroupVerticalCustom}>
                  <h3>Time required</h3>
                  {errors.duration && (
                    <p className="text-red-500">
                      {errors.duration.hours?.message}
                    </p>
                  )}
                  {errors.duration && (
                    <p className="text-red-500">
                      {errors.duration.minutes?.message}
                    </p>
                  )}
                  <input
                    type="number"
                    placeholder="Hours"
                    step={1}
                    className="w-full input input-bordered"
                    {...register("duration.hours", {
                      required: {
                        message: "Enter Hours",
                        value: true,
                      },
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: "Please enter hours more than 0",
                      },
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Minutes"
                    className="w-full input input-bordered"
                    step={1}
                    {...register("duration.minutes", {
                      required: {
                        message: "Enter Minutes",
                        value: true,
                      },
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: "Please enter minutes between 0 and 59",
                      },
                      max: {
                        value: 59,
                        message: "Please enter minutes between 0 and 59",
                      },
                    })}
                  />
                </label>
              </div>
              <div className="py-2">
                <label>
                  <h3>Ingredients</h3>
                </label>
                {errors.ingredients &&
                  Array.isArray(errors.ingredients) &&
                  errors.ingredients.length > 0 && (
                    <p className="text-red-500">Fill or delete empty fields</p>
                  )}
                <DynamicInput
                  register={register}
                  control={control}
                  name={"ingredients"}
                />
              </div>
              <div className="py-2">
                <label>
                  <h3>Steps</h3>
                </label>
                {errors.steps &&
                  Array.isArray(errors.steps) &&
                  errors.steps.length > 0 && (
                    <p className="text-red-500">Fill or delete empty fields</p>
                  )}
                <DynamicInput
                  register={register}
                  control={control}
                  name={"steps"}
                />
              </div>
              <div className="py-2">
                <label>
                  <h3>Tags</h3>
                </label>

                {errors.tags?.message}
                {errors.tags &&
                  Array.isArray(errors.tags) &&
                  errors.tags.length > 0 && (
                    <p className="text-red-500">Fill or delete empty fields</p>
                  )}

                <DynamicInput
                  register={register}
                  control={control}
                  name={"tags"}
                />
              </div>
              <div className="py-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateIsLoading}
                >
                  <div className="w-5 h-5 mr-2 -ml-1">
                    <PlusIcon />
                  </div>
                  {updateIsLoading ? "Loading..." : "Update"}
                </button>
              </div>
              <p className="py-2">
                {updateError?.message ? updateError.message : ""}
              </p>
            </form>
          </main>
        </div>
      </div>
    </>
  );
};

export default Edit;
