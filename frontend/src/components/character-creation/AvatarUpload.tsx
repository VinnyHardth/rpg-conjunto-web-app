export default function AvatarUpload() {
  return (
    <div className="md:col-span-1 flex flex-col items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 mb-3 text-sm">
        Placeholder Avatar
      </div>
      <label className="block font-semibold text-center mb-1">
        Avatar do Personagem:
      </label>
      <input
        type="file"
        className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        accept="image/*"
      />
      <p className="text-xs text-gray-500 mt-1">Max. 5MB. JPG, PNG.</p>
    </div>
  );
}
