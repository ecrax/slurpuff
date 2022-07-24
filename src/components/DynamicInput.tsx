import React, { type Dispatch, type SetStateAction } from "react";
const DynamicInput: React.FC<{
  setState: Dispatch<SetStateAction<string[]>>;
  state: string[];
  name: string;
}> = ({ setState, state, name }) => {
  return (
    <label>
      {name}
      {state.map((ingredient, i) => (
        <div key={i}>
          <input type="text" />
          <button
            onClick={() => {
              setState([...state, ""]);
            }}
          >
            +
          </button>
          {state.length !== 1 && i === state.length - 1 && (
            <button
              onClick={() => {
                const _ingredients = [...state];

                _ingredients.splice(i, 1);

                setState(_ingredients);
              }}
            >
              -
            </button>
          )}
        </div>
      ))}
    </label>
  );
};

export default DynamicInput;
