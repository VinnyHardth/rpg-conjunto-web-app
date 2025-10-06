import React from "react";

type Props = {
    label?: string;
    type?: string;
    name: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function InputField({ label, type = "text", name, value, placeholder, onChange }: Props) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required
        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-500"
      />
    </div>
  );
}