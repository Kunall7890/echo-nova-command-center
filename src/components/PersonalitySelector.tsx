
import React from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PersonalityType } from "@/types/commands";
import { Brain, User2, Smile, Sparkles } from "lucide-react";
import { setPersonality, getPersonality } from "@/utils/chatMemory";

interface PersonalitySelectorProps {
  onSelect: (personality: PersonalityType) => void;
}

const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({ onSelect }) => {
  const currentPersonality = getPersonality();
  
  const handleSelect = (personality: PersonalityType) => {
    setPersonality(personality);
    onSelect(personality);
  };
  
  const getPersonalityIcon = (type: PersonalityType) => {
    switch (type) {
      case 'formal':
        return <User2 className="h-4 w-4 mr-2" />;
      case 'funny':
        return <Smile className="h-4 w-4 mr-2" />;
      case 'tony_stark':
        return <Sparkles className="h-4 w-4 mr-2" />;
      default:
        return <Brain className="h-4 w-4 mr-2" />;
    }
  };
  
  const getPersonalityLabel = (type: PersonalityType) => {
    switch (type) {
      case 'formal':
        return "Formal";
      case 'funny':
        return "Humorous";
      case 'tony_stark':
        return "Tony Stark";
      default:
        return "Default";
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-nova-light flex items-center">
          {getPersonalityIcon(currentPersonality)}
          <span>{getPersonalityLabel(currentPersonality)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSelect('default')} className="cursor-pointer">
          <Brain className="h-4 w-4 mr-2" />
          <span>Default</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('formal')} className="cursor-pointer">
          <User2 className="h-4 w-4 mr-2" />
          <span>Formal</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('funny')} className="cursor-pointer">
          <Smile className="h-4 w-4 mr-2" />
          <span>Humorous</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('tony_stark')} className="cursor-pointer">
          <Sparkles className="h-4 w-4 mr-2" />
          <span>Tony Stark</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PersonalitySelector;
