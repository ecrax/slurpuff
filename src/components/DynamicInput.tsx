import React, { type Dispatch, type SetStateAction } from "react";
const DynamicInput: React.FC<{
  setState: Dispatch<SetStateAction<string[]>>;
  state: string[];
  name: string;
}> = ({ setState, state, name }) => {
  return (
    <label>
      {name}
      {state.map((field, i) => (
        <div key={i}>
          <input
            type="text"
            onChange={(e) => {
              const _state = [...state];
              _state[i] = e.target.value;
              setState(_state);
            }}
          />
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
                const _state = [...state];

                _state.splice(i, 1);

                setState(_state);
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
