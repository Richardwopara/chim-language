import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TroubleshootDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (prompt: string) => void;
  initialData?: Partial<FormData>;
  naturalLanguageInput?: string;
}

interface FormData {
  platform: string;
  device: string;
  element: string;
  reference: string;
  background?: string;
}

const QUESTIONS = [
  {
    id: 'platform',
    label: 'What platform or language are you targeting?',
    placeholder: 'e.g. swift, react, flutter',
    required: true
  },
  {
    id: 'device',
    label: 'What device or environment is this for?',
    placeholder: 'e.g. iPhone, Android, web',
    required: true
  },
  {
    id: 'element',
    label: 'What UI element do you want to create?',
    placeholder: 'e.g. search bar, button, card',
    required: true
  },
  {
    id: 'reference',
    label: 'Which app would you like to reference the style from?',
    placeholder: 'e.g. Instagram, WhatsApp, Twitter',
    required: true
  },
  {
    id: 'background',
    label: 'Any specific background color? (optional, in hex)',
    placeholder: 'e.g. 000000',
    required: false
  }
];

export default function TroubleshootDialog({ 
  isOpen, 
  onClose, 
  onComplete, 
  initialData = {},
  naturalLanguageInput 
}: TroubleshootDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    platform: '',
    device: '',
    element: '',
    reference: '',
    background: '',
    ...initialData
  });

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setFormData({
        platform: '',
        device: '',
        element: '',
        reference: '',
        background: '',
        ...initialData
      });
    }
  }, [isOpen, initialData]);

  const constructPrompt = (data: FormData) => {
    let prompt = '';
    if (data.platform) prompt += `*in* ${data.platform}`;
    if (data.device) prompt += `${prompt ? ' | ' : ''}*for* ${data.device}`;
    if (data.element) prompt += `${prompt ? ' | ' : ''}*create* ${data.element}`;
    if (data.reference) prompt += `${prompt ? ' | ' : ''}*from* ${data.reference}`;
    if (data.background) prompt += `${prompt ? ' | ' : ''}*background* ${data.background}`;
    return prompt;
  };

  const handleNext = () => {
    const currentQuestion = QUESTIONS[currentStep];

    // Validate current field if required
    if (currentQuestion.required && !formData[currentQuestion.id as keyof FormData]) {
      return;
    }

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      const prompt = constructPrompt(formData);
      onComplete(prompt);
      onClose();
    }
  };

  const currentQuestion = QUESTIONS[currentStep];
  const isLastStep = currentStep === QUESTIONS.length - 1;
  const canProceed = !currentQuestion.required || formData[currentQuestion.id as keyof FormData]?.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create ChimPrompt</DialogTitle>
          <DialogDescription>
            Please provide the following information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor={currentQuestion.id}>{currentQuestion.label}</Label>
            <Input
              id={currentQuestion.id}
              placeholder={currentQuestion.placeholder}
              value={formData[currentQuestion.id as keyof FormData] || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [currentQuestion.id]: e.target.value
              }))}
            />
          </div>
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed}
            >
              {isLastStep ? 'Create Prompt' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}