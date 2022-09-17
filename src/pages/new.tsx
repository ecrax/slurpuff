import DynamicInput from "./../components/DynamicInput";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import { toMiliseconds } from "../utils/time";
import { ImageInput, NumberInput, TextInput } from "../components/Input";
import { FilledButton } from "../components/Button";
import { PlusIcon } from "@heroicons/react/solid";
import styles from "../styles/New.module.css";
import { useRouter } from "next/router";
import { uploadImage } from "../utils/uploadImage";
import LoadingSpinner from "../components/LoadingSpinner";

const New: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    isLoading: createIsLoading,
    error: createError,
    mutate: createRecipe,
  } = trpc.useMutation(["recipe.create"]);

  const [ingredients, setIngredients] = useState([""]);
  const [steps, setSteps] = useState([""]);
  const [tags, setTags] = useState([""]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<File>();
  const [duration, setDuration] = useState({ minutes: 0, hours: 0 });
  const [rating, setRating] = useState(4);

  const handleCreate = async () => {
    if (!session?.user?.id) return;
    if (!image) return;
    if (!duration) return;
    if (!name) return;

    const uploadedImageUrl = await uploadImage(image);

    const durationMs = toMiliseconds(
      duration.hours === NaN ? 0 : duration.hours,
      duration.minutes === NaN ? 0 : duration.minutes,
      0
    );

    createRecipe(
      {
        name: name.trim(),
        ingredients: ingredients.map((v) => v.trim()),
        steps: steps.map((v) => v.trim()),
        tags: tags.map((v) => v.trim().toLowerCase()),
        image: uploadedImageUrl,
        timeRequired: durationMs,
        notes: notes.trim(),
        rating: rating,
      },
      {
        onSuccess() {
          //console.log("creation successfull");
          router.push("/recipes");
        },
      }
    );
  };

  if (status === "loading") {
    return <LoadingSpinner />;
  } else if (!session) {
    return <p>Please Sign in</p>;
  } else {
    return (
      <>
        <Head>
          <title>New recipe: {name}</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="container h-screen px-8 mx-auto">
          {session && (
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
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="py-2">
                    <label>
                      <h3>Image</h3>
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
                        onChange={(e) => {
                          const num = Number.parseInt(e.target.value);
                          if (num < 0) e.target.value = "0";
                          if (!Number.isInteger(num))
                            e.target.value = Math.round(num).toString();
                          const _duration = duration;
                          _duration.hours = num;
                          setDuration(_duration);
                        }}
                      />
                      <NumberInput
                        placeholder="Minutes"
                        name="minutes"
                        max={59}
                        min={0}
                        step="1"
                        onChange={(e) => {
                          const num = Number.parseInt(e.target.value);
                          if (num > 59) e.target.value = "59";
                          if (!Number.isInteger(num))
                            e.target.value = Math.round(num).toString();
                          const _duration = duration;
                          _duration.minutes = num;
                          setDuration(_duration);
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
                    <DynamicInput
                      setState={setTags}
                      state={tags}
                      name={"Tags"}
                    />
                  </div>
                  <div className="py-2">
                    <FilledButton
                      disabled={createIsLoading}
                      onClick={handleCreate}
                      icon={<PlusIcon />}
                    >
                      Create
                    </FilledButton>
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
