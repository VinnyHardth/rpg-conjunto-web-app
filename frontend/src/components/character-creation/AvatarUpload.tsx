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
    <div className="md:col-span-1 flex flex-col items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl || PLACEHOLDER_IMAGE}
        alt="Avatar do Personagem"
        className="w-32 h-32 bg-gray-300 rounded-full object-cover flex items-center justify-center text-gray-600 mb-3 text-sm border-2 border-white shadow-md"
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
        className="text-sm w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  );
}
