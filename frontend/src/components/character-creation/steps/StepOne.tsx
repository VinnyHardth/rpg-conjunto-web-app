import AvatarUpload from "../AvatarUpload";
import BasicInfoForm from "../BasicInfoForm";
import { CharacterData } from "@/types/character";

interface StepOneProps {
  characterData: CharacterData;
  onDataChange: (section: "base", key: string, value: string | number) => void;
}

export default function StepOne({ characterData, onDataChange }: StepOneProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AvatarUpload />
      <BasicInfoForm characterData={characterData} onDataChange={onDataChange} />
    </div>
  );
}