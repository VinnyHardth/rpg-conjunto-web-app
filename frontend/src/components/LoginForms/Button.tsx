type Props = {
  children: React.ReactNode;
  type?: "button" | "submit";
  color?: "primary" | "secondary";
};

export default function Button({
  children,
  type = "button",
  color = "primary",
}: Props) {
  const base = "w-full font-bold py-2 px-4 rounded-md transition";
  const styles =
    color === "primary"
      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
      : "bg-green-600 hover:bg-green-700 text-white";

  return (
    <button type={type} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}
