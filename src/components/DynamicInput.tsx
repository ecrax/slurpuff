import type { Dispatch, SetStateAction } from "react";
import { OutlineButton } from "./Button";
import { TextInput } from "./Input";
import { PlusIcon, MinusIcon } from "@heroicons/react/solid";

const DynamicInput: React.FC<{
  setState: Dispatch<SetStateAction<string[]>>;
  state: string[];
  name: string;
}> = ({ setState, state, name }) => {
  return (
    <label>
      <h3>{name}</h3>
      {state.map((_field, i) => (
        <div key={`${i}_${name}`}>
          <TextInput
            name="dynamicInput"
            value={state[i]}
            placeholder={`${i + 1}. ${name.slice(0, -1)}`}
            onChange={(e) => {
              const _state = [...state];
              _state[i] = e.target.value;
              setState(_state);
            }}
          />
          <div className="h-2" />

          <div className={state.length > 1 ? "btn-group" : ""}>
            {i === state.length - 1 && (
              <OutlineButton
                icon={<PlusIcon />}
                onClick={() => {
                  setState([...state, ""]);
                }}
              />
            )}
            {state.length !== 1 && i === state.length - 1 && (
              <OutlineButton
                icon={<MinusIcon />}
                onClick={() => {
                  const _state = [...state];

                  _state.splice(i, 1);

                  setState(_state);
                }}
              />
            )}
          </div>
        </div>
      ))}
    </label>
  );
};

export default DynamicInput;
