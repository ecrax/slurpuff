import { PlusIcon, MinusIcon } from "@heroicons/react/solid";
import {
  useFieldArray,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import type { IFormInput } from "../pages/new";
import capitalize from "../utils/capitalize";

const DynamicInput: React.FC<{
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

export default DynamicInput;
