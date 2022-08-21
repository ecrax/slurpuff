import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/solid";
import styles from "../../../styles/New.module.css";
import { useRouter } from "next/router";
import { trpc } from "../../../utils/trpc";
import { msToTime, toMiliseconds } from "../../../utils/time";
import { ImageInput, NumberInput, TextInput } from "../../../components/Input";
import DynamicInput from "../../../components/DynamicInput";
import { FilledButton } from "../../../components/Button";
import type { Session } from "next-auth";
import type { Recipe } from "@prisma/client";
import Image from "next/image";
import { uploadImage } from "../../../utils/uploadImage";

const Edit: NextPage = () => {
  const { query } = useRouter();
  const { id } = query;
  const { data: session, status } = useSession();

  if (!id || typeof id !== "string") return <div>No id</div>;

  const _id = Number.parseInt(id);
  if (Number.isNaN(_id)) return <p>Please pass a number</p>;

  if (status === "loading") {
    return <p>Loading</p>;
  } else if (!session) {
    return <p>Please Sign in</p>;
  }

  return <LoadRecipe session={session} id={_id} />;
};

const LoadRecipe: React.FC<{ session: Session; id: number }> = ({
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
    return <div>Loading...</div>;
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

const EditContent: React.FC<{ session: Session; oldRecipe: Recipe }> = ({
  session,
  oldRecipe,
}) => {
  const router = useRouter();

  const {
    isLoading: updateIsLoading,
    error: updateError,
    mutate: updateRecipe,
  } = trpc.useMutation(["recipe.update"]);

  const timeRequired = msToTime(oldRecipe.timeRequired);

  const [ingredients, setIngredients] = useState(oldRecipe.ingredients);
  const [steps, setSteps] = useState(oldRecipe.steps);
  const [tags, setTags] = useState(oldRecipe.tags);
  const [name, setName] = useState(oldRecipe.name);
  const [notes, setNotes] = useState(oldRecipe.notes);
  const [image, setImage] = useState<File>();
  const [rating, setRating] = useState(oldRecipe.rating);
  const [duration, setDuration] = useState({
    minutes: timeRequired.mins,
    hours: timeRequired.hrs,
  });

  const handleUpdate = async () => {
    if (!session?.user?.id) return;

    let uploadedImageUrl: string | undefined;
    if (image) {
      uploadedImageUrl = await uploadImage(image);
    }

    const durationMs = toMiliseconds(
      duration.hours === NaN ? 0 : duration.hours,
      duration.minutes === NaN ? 0 : duration.minutes,
      0
    );

    updateRecipe(
      {
        id: oldRecipe.id,
        authorId: oldRecipe.authorId,
        name: name === oldRecipe.name ? undefined : name.trim(),
        ingredients: arrayIsEqual(ingredients, oldRecipe.ingredients)
          ? undefined
          : ingredients.map((v) => v.trim()),
        steps: arrayIsEqual(steps, oldRecipe.steps)
          ? undefined
          : steps.map((v) => v.trim()),
        tags: arrayIsEqual(tags, oldRecipe.tags)
          ? undefined
          : tags.map((v) => v.trim()),
        image: !uploadedImageUrl ? undefined : uploadedImageUrl,
        timeRequired:
          durationMs === oldRecipe.timeRequired ? undefined : durationMs,
        notes: notes === oldRecipe.notes ? undefined : notes?.trim(),
        rating: rating === oldRecipe.rating ? undefined : rating,
      },
      {
        onSuccess() {
          console.log("update successfull");
          router.push(`/recipe/${oldRecipe.id}`);
        },
      }
    );
  };

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container h-screen px-8 mx-auto">
        <div className="flex flex-col items-center justify-center">
          <main className="w-full prose">
            <form
              className="flex flex-col"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="py-2">
                <label>
                  <h3>Name</h3>
                  <TextInput
                    name="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                        name="rating-9"
                        key={`${i}_rating`}
                        className="mask mask-star-2 bg-primary"
                        checked={rating === i + 1}
                        onChange={() => setRating(i + 1)}
                      />
                    ))}
                  </div>
                </label>
              </div>
              <div className="py-2">
                <label>
                  <h3>Notes</h3>
                  <TextInput
                    name="notes"
                    placeholder="Notes"
                    value={notes ?? ""}
                    onChange={(e) => setNotes(e.target.value)}
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
                  <ImageInput
                    name="image"
                    onChange={(e) => {
                      //not nice but i dont know ts
                      setImage(e.target.files![0]);
                    }}
                  />
                </label>
              </div>
              <div className="py-2">
                <label className={styles.inputGroupVerticalCustom}>
                  <h3>Time required</h3>
                  <NumberInput
                    placeholder="Hours"
                    name="hours"
                    min={0}
                    step="1"
                    value={duration.hours}
                    onChange={(e) => {
                      const num = Number.parseInt(e.target.value);
                      if (!Number.isInteger(num)) {
                        setDuration({
                          minutes: duration.minutes,
                          hours: Math.round(num),
                        });
                        return;
                      }

                      if (num < 0) {
                        setDuration({ minutes: duration.minutes, hours: 0 });
                        return;
                      }

                      setDuration((_d) => ({
                        minutes: _d.minutes,
                        hours: num,
                      }));
                    }}
                  />
                  <NumberInput
                    placeholder="Minutes"
                    name="minutes"
                    max={59}
                    min={0}
                    step="1"
                    value={duration.minutes}
                    onChange={(e) => {
                      const num = Number.parseInt(e.target.value);

                      if (num > 59) {
                        setDuration({ minutes: 59, hours: duration.hours });
                        return;
                      }

                      if (!Number.isInteger(num)) {
                        setDuration({
                          hours: duration.hours,
                          minutes: Math.round(num),
                        });
                        return;
                      }

                      setDuration((_d) => ({
                        hours: _d.hours,
                        minutes: num,
                      }));
                    }}
                  />
                </label>
              </div>
              <div className="py-2">
                <DynamicInput
                  setState={setIngredients}
                  state={ingredients}
                  name={"Ingredients"}
                />
              </div>
              <div className="py-2">
                <DynamicInput
                  setState={setSteps}
                  state={steps}
                  name={"Steps"}
                />
              </div>
              <div className="py-2">
                <DynamicInput setState={setTags} state={tags} name={"Tags"} />
              </div>
              <div className="py-2">
                <FilledButton
                  disabled={updateIsLoading}
                  onClick={handleUpdate}
                  icon={<PlusIcon />}
                >
                  Update
                </FilledButton>
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
