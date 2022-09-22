import { PlusIcon, MinusIcon } from "@heroicons/react/solid";
import {
  useFieldArray,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import type { IFormInput } from "../utils/recipe";
import capitalize from "../utils/capitalize";
import { type ChangeEvent, useState, useEffect } from "react";
import { trpc } from "../utils/trpc";

export const DynamicInput: React.FC<{
  name: "steps" | "tags" | "ingredients";
  control: Control<IFormInput, any>;
  register: UseFormRegister<IFormInput>;
}> = ({ name, control, register }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
    rules: {
      required: {
        message: "Enter " + capitalize(name),
        value: true,
      },
      minLength: 1,
    },
  });

  return (
    <>
      {fields.map((field, i) => (
        <div key={field.id}>
          <div className="flex">
            <input
              type="text"
              placeholder={`${i + 1}. ${capitalize(name).slice(0, -1)}`}
              className={
                "w-full input input-bordered " +
                (fields.length > 1 ? "rounded-l-lg rounded-r-none" : "")
              }
              {...register(`${name}.${i}.value` as const, {
                required: {
                  message: "Fill or delete empty fields",
                  value: true,
                },
              })}
            />
            {fields.length > 1 && (
              <button
                className="btn btn-outline rounded-r-lg rounded-l-none"
                type="button"
                onClick={() => remove(i)}
              >
                <div className="w-5 h-5">
                  <MinusIcon />
                </div>
              </button>
            )}
          </div>

          <div className="h-2" />

          <div>
            {i === fields.length - 1 && (
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => append({ value: "" })}
              >
                <div className="w-5 h-5">
                  <PlusIcon />
                </div>
              </button>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export const DynamicInputWithAutocomplete: React.FC<{
  name: "tags";
  control: Control<IFormInput, any>;
  register: UseFormRegister<IFormInput>;
}> = ({ name, control, register }) => {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name,
    rules: {
      required: {
        message: "Enter " + capitalize(name),
        value: true,
      },
      minLength: 1,
    },
  });

  const [recommendations, setRecommendations] = useState<
    string[] | undefined
  >();
  const [currentlyFocused, setCurrentlyFocused] = useState<
    number | undefined
  >();
  const [displayAutocomplete, setDisplayAutocomplete] = useState(false);

  const { data: tags } = trpc.useQuery(["recipe.getAllTagsName"]);

  //useEffect(() => {
  //  setRecommendations(tags);
  //}, [tags]);

  return (
    <>
      {fields.map((field, i) => (
        <div key={field.id}>
          <div className="flex">
            <input
              type="text"
              placeholder={`${i + 1}. ${capitalize(name).slice(0, -1)}`}
              className={
                "w-full input input-bordered " +
                (fields.length > 1 ? "rounded-l-lg rounded-r-none" : "")
              }
              onFocus={(e) => {
                setRecommendations(
                  tags?.filter(
                    (v) =>
                      v.includes(e.target.value.toLowerCase()) &&
                      v !== e.target.value.toLowerCase()
                  )
                );
                setCurrentlyFocused(i);
                setDisplayAutocomplete(true);
              }}
              {...register(`${name}.${i}.value` as const, {
                required: {
                  message: "Fill or delete empty fields",
                  value: true,
                },
                onChange: (e: ChangeEvent<HTMLInputElement>) => {
                  setRecommendations(() =>
                    tags?.filter(
                      (v) =>
                        v.includes(e.target.value.toLowerCase()) &&
                        v !== e.target.value.toLowerCase()
                    )
                  );
                },
              })}
            />
            {fields.length > 1 && (
              <button
                className="btn btn-outline rounded-r-lg rounded-l-none"
                type="button"
                onClick={() => remove(i)}
              >
                <div className="w-5 h-5">
                  <MinusIcon />
                </div>
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            {i === currentlyFocused &&
            displayAutocomplete &&
            tags &&
            recommendations &&
            tags.length !== recommendations?.length
              ? recommendations.map((r, i) => (
                  <p
                    className="capitalize cursor-pointer badge badge-ghost"
                    key={r + i}
                    onClick={() => {
                      update(currentlyFocused, { value: capitalize(r) });
                      console.log(currentlyFocused, r);
                      setDisplayAutocomplete(false);
                    }}
                  >
                    {r}
                  </p>
                ))
              : ""}
          </div>
          <div className="h-2" />

          <div>
            {i === fields.length - 1 && (
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => append({ value: "" })}
              >
                <div className="w-5 h-5">
                  <PlusIcon />
                </div>
              </button>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

