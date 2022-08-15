import type { ChangeEventHandler } from "react";

export const NumberInput: React.FC<{
  name: string;
  placeholder: string | undefined;
  value?: string | number | undefined;
  onChange: ChangeEventHandler<HTMLInputElement>;
  step: string | number;
  min: string | number;
  max?: string | number | undefined;
}> = ({ name, placeholder, value, onChange, step, min, max }) => {
  return (
    <input
      type="number"
      name={name}
      id={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      step={step}
      min={min}
      max={max}
      className="w-full max-w-xs input input-bordered"
    />
  );
};

export const TextInput: React.FC<{
  name: string;
  placeholder: string | undefined;
  value?: string | number;
  onChange: ChangeEventHandler<HTMLInputElement>;
}> = ({ name, placeholder, value, onChange }) => {
  return (
    <input
      type="text"
      name={name}
      id={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full max-w-xs input input-bordered"
    />
  );
};

export const ImageInput: React.FC<{
  name: string;

  onChange: ChangeEventHandler<HTMLInputElement>;
}> = ({ name, onChange }) => {
  return (
    <input
      name={name}
      onChange={onChange}
      accept=".jpg, .png, .jpeg"
      type="file"
      className="w-full max-w-xs input input-bordered"
    />
  );
};
