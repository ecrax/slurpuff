import type { NextPage } from "next";
import DynamicInput from "./../components/DynamicInput";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import { toMiliseconds } from "../utils/time";
import { PlusIcon } from "@heroicons/react/solid";
import styles from "../styles/New.module.css";
import { useRouter } from "next/router";
import { uploadImage } from "../utils/uploadImage";
import LoadingSpinner from "../components/LoadingSpinner";
import { type SubmitHandler, useForm } from "react-hook-form";

export interface IFormInput {
  name: String;
  rating: number;
  notes: string;
  duration: {
    minutes: number;
    hours: number;
  };
  image: FileList;
  steps: { value: string }[];
  ingredients: { value: string }[];
  tags: { value: string }[];
}

const New: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [createIsLoading, setCreateIsLoading] = useState(false);

  const { error: createError, mutateAsync: createRecipe } = trpc.useMutation([
    "recipe.create",
  ]);

  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
    reset,
  } = useForm<IFormInput>({
    mode: "onBlur",
    defaultValues: {
      rating: 5,
      ingredients: [{ value: "" }],
      steps: [{ value: "" }],
      tags: [{ value: "" }],
    },
  });
  const onSubmit: SubmitHandler<IFormInput> = (data) => handleCreate(data);

  const handleCreate = async (data: IFormInput) => {
    if (!session?.user?.id) return;
    setCreateIsLoading(true);

    const { image, duration, name, ingredients, steps, notes, rating, tags } =
      data;

    console.log(image);

    const img = image.item(0);
    if (image.length > 1 || !img) return;

    const uploadedImageUrl = await uploadImage(img);

    const durationMs = toMiliseconds(
      duration.hours === NaN ? 0 : duration.hours,
      duration.minutes === NaN ? 0 : duration.minutes,
      0
    );

    await createRecipe(
      {
        name: name.trim(),
        ingredients: ingredients.map(({ value }) => value.trim()),
        steps: steps.map(({ value }) => value.trim()),
        tags: tags.map(({ value }) => value.trim().toLowerCase()),
        image: uploadedImageUrl,
        timeRequired: durationMs,
        notes: notes.trim(),
        rating: rating,
      },
      {
        onSuccess() {
          //console.log("creation successfull");
          //router.push("/recipes");
          reset();
        },
      }
    );
    setCreateIsLoading(false);
  };

  if (status === "loading") {
    return <LoadingSpinner />;
  } else if (!session) {
    return <p>Please Sign in</p>;
  } else {
    return (
      <>
        <Head>
          <title>New recipe</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="container h-screen px-8 mx-auto">
          {session && (
            <div className="flex flex-col items-center justify-center">
              <main className="w-full prose">
                <form
                  className="flex flex-col"
                  onSubmit={handleSubmit(onSubmit)}
                >
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
                            {...register("rating")}
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
                      {errors.image && (
                        <p className="text-red-500">{errors.image.message}</p>
                      )}
                      <input
                        {...register("image", {
                          required: {
                            message: "Select an image",
                            value: true,
                          },
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
                        <p className="text-red-500">
                          Fill or delete empty fields
                        </p>
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
                        <p className="text-red-500">
                          Fill or delete empty fields
                        </p>
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
                        <p className="text-red-500">
                          Fill or delete empty fields
                        </p>
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
                      disabled={createIsLoading}
                    >
                      <div className="w-5 h-5 mr-2 -ml-1">
                        <PlusIcon />
                      </div>
                      {createIsLoading ? "Loading..." : "Create"}
                    </button>
                  </div>
                  <p className="py-2">
                    {createError?.message ? createError.message : ""}
                  </p>
                </form>
              </main>
            </div>
          )}
        </div>
      </>
    );
  }
};

export default New;
