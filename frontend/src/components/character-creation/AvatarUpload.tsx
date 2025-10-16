import Image from "next/image";

interface AvatarUploadProps {
  imageUrl: string | null | undefined;
  onImageUrlChange: (url: string) => void;
}

const PLACEHOLDER_IMAGE =
  "https://placehold.co/150x150/e2e8f0/64748b?text=Avatar";

export default function AvatarUpload({
  imageUrl,
  onImageUrlChange,
}: AvatarUploadProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-50 p-4 md:col-span-1">
      <Image
        src={imageUrl || PLACEHOLDER_IMAGE}
        alt="Avatar do Personagem"
        width={128}
        height={128}
        className="mb-3 flex h-32 w-32 items-center justify-center rounded-full border-2 border-white bg-gray-300 object-cover text-sm text-gray-600 shadow-md"
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER_IMAGE;
        }}
      />
      <label
        htmlFor="avatar-url"
        className="block font-semibold text-center mb-1"
      >
        URL do Avatar:
      </label>
      <input
        id="avatar-url"
        type="url"
        value={imageUrl || ""}
        onChange={(e) => onImageUrlChange(e.target.value)}
        placeholder="https://exemplo.com/imagem.png"
        className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  );
}
