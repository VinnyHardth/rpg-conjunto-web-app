import AvatarUpload from "../AvatarUpload";
import BasicInfoForm from "../BasicInfoForm";
import { CreateFullCharacter } from "@/types/models";

interface StepOneProps {
  characterData: CreateFullCharacter;
  onDataChange: (section: "base", key: string, value: string | number) => void;
}

export default function StepOne({ characterData, onDataChange }: StepOneProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AvatarUpload 
        imageUrl={characterData.info.imageUrl}
        onImageUrlChange={(url) => onDataChange("base", "imageUrl", url)} />
      <BasicInfoForm
        characterData={characterData}
        onDataChange={onDataChange}
      />
    </div>
  );
}
