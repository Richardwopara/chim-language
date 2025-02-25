import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { elements } from "@/lib/data";
import { Copy, Check } from "lucide-react";

// Define keyboard shortcuts mapping in QWERTY keyboard order
const KEYBOARD_SHORTCUTS = {
  'q': 'in',
  'w': 'for',
  'e': 'context',
  'r': 'line',
  't': 'chimcontext',
  'y': 'prompt',
  'u': 'chimprompt',
  'i': 'spawn',
  'o': 'rare',
  'p': 'create',
  'a': 'from',
  's': 'makeit',
  'd': 'like',
  'f': 'but',
  'g': 'with',
  'h': 'without',
  'j': 'nextto',
  'k': 'blame',
  'l': 'animate',
  'z': 'background',
  'x': 'font',
  'c': 'maybe',
  'v': 'then',
  'b': 'forge',
  'n': 'mold',
  'm': 'jump'
} as const;

// Define jump options
const JUMP_OPTIONS = [
  { label: "Ascending", value: "ascending" },
  { label: "Descending", value: "descending" },
  { label: "Reset", value: "reset" }
];

// Element priority order from most to least important
const ELEMENT_PRIORITY = [
  "in",
  "for",
  "create",
  "from",
  "background",
  "animate",
  "font",
  "nextto",
  "blame",
  "maybe",
  "then",
  "forge",
  "mold"
];

// Add back the ELEMENT_CATEGORIES constant right after the ELEMENT_PRIORITY array
const ELEMENT_CATEGORIES = [
  {
    name: "Start",
    color: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-600",
    elements: ["in", "for"]
  },
  {
    name: "References",
    color: "bg-purple-500/20 hover:bg-purple-500/30 text-purple-600",
    elements: ["context", "line", "chimcontext", "prompt", "chimprompt"]
  },
  {
    name: "Generation",
    color: "bg-green-500/20 hover:bg-green-500/30 text-green-600",
    elements: ["spawn", "rare", "create"]
  },
  {
    name: "Attributes",
    color: "bg-orange-500/20 hover:bg-orange-500/30 text-orange-600",
    elements: ["from", "makeit", "like", "but", "with", "without"]
  },
  {
    name: "Position",
    color: "bg-red-500/20 hover:bg-red-500/30 text-red-600",
    elements: ["nextto", "blame"]
  },
  {
    name: "Styling",
    color: "bg-teal-500/20 hover:bg-teal-500/30 text-teal-600",
    elements: ["animate", "background", "font"]
  },
  {
    name: "Organization",
    color: "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-600",
    elements: ["maybe", "then", "forge", "mold", "jump"]
  }
];

// Update the ELEMENT_SUGGESTIONS object with all examples
const ELEMENT_SUGGESTIONS = {
  'in': ['swift', 'python', 'javascript', 'dart', 'react', 'flutter', 'kotlin'],
  'for': ['apple phone', 'web', 'iphone', 'android', 'tablet', 'desktop'],
  'context': ['39', '39; 45', '39 to 45'],
  'line': ['150', 'react; 150'],
  'chimcontext': ['4535hevne53354'],
  'prompt': ['saved1', '[homepage]'],
  'chimprompt': ['richardssearchbar'],
  'spawn': ['instagram/ home page; instagram.com'],
  'rare': ['search bar'],
  'create': ['search bar', 'button', 'navigation menu', 'profile card'],
  'from': ['instagram/ search page', 'twitter', 'whatsapp', 'snapchat'],
  'makeit': ['static', 'dynamic'],
  'like': ['snapchat/ explore page'],
  'but': ['fire edges that turn cold when inactive for 1 minute', 'top center', 'rectangle', '4:5', '35'],
  'with': ['fire edges'],
  'without': ['search icon on the end'],
  'nextto': ['left (search bar)', 'within left (loading screen)', 'within bottom right (checkout page)', 'above (share sheet)', 'within below (chat screen)'],
  'blame': ['instagram / search page'],
  'animate': ['start(3; appear); end(5, fade out)'],
  'background': ['ffffffff', 'light(ffffffff); dark(00000000)'],
  'font': ['aerial; center; ffffffff; 15', 'aerial; left; light(00000000); dark(ffffffff); 15'],
  'maybe': ['snapchat search bar with a bit of instagram feel'],
  'then': ['loading screen; checkout page'],
  'forge': ['instagram / search page; (ig bias)', '(ig bias)'],
  'mold': ['loading screen; checkout page; [home page]', '(home page)'],
  'jump': ['ascending', 'descending', 'reset']
};

interface CursorPosition {
  top: number;
  left: number;
}

interface PromptBuilderProps {
  onExecute: (prompt: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  onElementClick?: (elementType: string) => void;
  onComplete?: () => void;
}

const renderPromptWithColoredAsterisks = (prompt: string) => {
    // Split the prompt by asterisks to render them with appropriate colors
    const parts = prompt.split(/(\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        // Extract element name without asterisks
        const elementName = part.slice(1, -1);
        // Find the category for this element
        const category = ELEMENT_CATEGORIES.find(cat => cat.elements.includes(elementName));
        const colorMatch = category?.color.match(/text-(\w+)-\d+/);
        const color = colorMatch ? `text-${colorMatch[1]}-600` : 'text-foreground';

        return (
          <span key={index}>
            <span className={color}>*</span>
            {elementName}
            <span className={color}>*</span>
          </span>
        );
      }
      return part;
    });
  };

export default function PromptBuilder({ onExecute, value, onChange, onElementClick, onComplete }: PromptBuilderProps) {
  const [prompt, setPrompt] = useState(value || "");
  const { toast } = useToast();
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [currentToast, setCurrentToast] = useState<{ dismiss: () => void } | null>(null);
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [showJumpOptions, setShowJumpOptions] = useState(false);
  const [isTabPressed, setIsTabPressed] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
  const [currentElement, setCurrentElement] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setPrompt(value);
    }
  }, [value]);

  const updateCursorPosition = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];

    // Create a temporary div to measure text dimensions
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.font = window.getComputedStyle(textarea).font;
    div.textContent = currentLine;
    document.body.appendChild(div);

    const charWidth = div.offsetWidth / currentLine.length;
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
    document.body.removeChild(div);

    // Calculate position relative to textarea
    const top = textarea.offsetTop + (lines.length - 1) * lineHeight;
    const left = textarea.offsetLeft + (currentLine.length * charWidth);

    setCursorPosition({ top, left });
  };

  useEffect(() => {
    const newSelectedElements = new Set<string>();
    const regex = /\*(.*?)\*/g;
    let match;

    while ((match = regex.exec(prompt)) !== null) {
      const element = match[1];
      if (element !== 'jump' && element !== 'mold' && element !== 'forge') {
        newSelectedElements.add(element);
      }
    }

    setSelectedElements(newSelectedElements);
  }, [prompt]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setPrompt(newValue);
    onChange?.(newValue);
    setCurrentElement(null);
    setSuggestion('');
    updateCursorPosition();
    setShowShortcuts(false);
  };

  const hasElementContent = (element: string) => {
    const regex = new RegExp(`\\*${element}\\*\\s*([^|]*)`);
    const match = prompt.match(regex);
    return match && match[1].trim().length > 0;
  };

  const dismissCurrentToast = () => {
    if (currentToast) {
      currentToast.dismiss();
      setCurrentToast(null);
      setActiveElement(null);
    }
  };

  const getRandomSuggestion = (elementName: string) => {
    const suggestions = ELEMENT_SUGGESTIONS[elementName as keyof typeof ELEMENT_SUGGESTIONS];
    if (!suggestions) return '';
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const insertElement = (elementName: string) => {
    // If the element is already active, remove it
    if (activeElement === elementName) {
      setPrompt(prev => {
        // Remove the element and its content from the prompt
        const regex = new RegExp(`\\s*\\*${elementName}\\*\\s*[^|]*\\|?`);
        return prev.replace(regex, '').trim();
      });
      setActiveElement(null);
      setCurrentElement(null);
      setSuggestion('');
      return;
    }

    if (activeElement && !hasElementContent(activeElement)) {
      toast({
        title: "Input Required",
        description: `Please add content for the ${activeElement} element first`,
        duration: 3000,
      });
      return;
    }

    dismissCurrentToast();

    // Special handling for jump command
    if (elementName === 'jump') {
      setShowJumpOptions(true);
      setHint("Select a jump option...");
      return;
    }

    // Show hint based on element
    const element = elements.find(e => e.name === elementName);
    if (element) {
      setHint(element.example.replace(/\*/g, '').trim());
    }

    setPrompt(prev => {
      const separator = prev && !prev.endsWith(" | ") ? " | " : "";
      const newPrompt = prev + separator + `*${elementName}* `;
      return newPrompt;
    });

    // Set current element and generate suggestion
    setCurrentElement(elementName);
    setSuggestion(getRandomSuggestion(elementName));

    // Switch tab based on element type
    if (onElementClick) {
      onElementClick(elementName);
    }

    setActiveElement(elementName);
  };

  const toggleElement = (elementName: string) => {
    // Special handling for organization elements
    if (elementName === 'jump' || elementName === 'mold' || elementName === 'forge') {
      insertElement(elementName);
      return;
    }

    // Check if the element is already in the prompt
    const regex = new RegExp(`\\*${elementName}\\*\\s*[^|]*\\|?`);
    if (prompt.match(regex)) {
      // Remove the element and its content from the prompt
      setPrompt(prev => {
        let newPrompt = prev.replace(regex, '').trim();
        // Clean up any double separators that might be left
        newPrompt = newPrompt.replace(/\|\s*\|/g, '|').trim();
        // Remove trailing separator if it exists
        newPrompt = newPrompt.replace(/\|\s*$/, '').trim();
        return newPrompt;
      });

      const newSelected = new Set(selectedElements);
      newSelected.delete(elementName);
      setSelectedElements(newSelected);
      setActiveElement(null);
      setCurrentElement(null);
      setSuggestion('');
    } else {
      insertElement(elementName);
    }
  };


  const reorderPrompt = (order: 'ascending' | 'descending' | 'reset') => {
    const parts = prompt.split(' | ').filter(Boolean);

    if (order === 'reset') {
      setPrompt('');
      setHint(null);
      setShowJumpOptions(false);
      return;
    }

    const sortedParts = parts.sort((a, b) => {
      const getElementName = (part: string) => {
        const match = part.match(/\*(.*?)\*/);
        return match ? match[1] : '';
      };

      const aIndex = ELEMENT_PRIORITY.indexOf(getElementName(a));
      const bIndex = ELEMENT_PRIORITY.indexOf(getElementName(b));

      return order === 'ascending'
        ? aIndex - bIndex
        : bIndex - aIndex;
    });

    setPrompt(sortedParts.join(' | '));
    setShowJumpOptions(false);
    setHint(null);
  };

  const selectJumpOption = (option: typeof JUMP_OPTIONS[0]) => {
    switch (option.value) {
      case 'ascending':
      case 'descending':
        reorderPrompt(option.value);
        break;
      case 'reset':
        reorderPrompt('reset');
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onExecute(prompt);
      onComplete?.();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setIsTabPressed(true);
        setShowShortcuts(true);
        updateCursorPosition();
      } else if (isTabPressed && e.key in KEYBOARD_SHORTCUTS) {
        e.preventDefault();
        const elementName = KEYBOARD_SHORTCUTS[e.key as keyof typeof KEYBOARD_SHORTCUTS];
        toggleElement(elementName);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsTabPressed(false);
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isTabPressed, selectedElements]);

  const copyPrompt = async () => {
    if (!prompt.trim()) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      duration: 1000
    });
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={handlePromptChange}
          onKeyDown={handleKeyDown}
          onSelect={updateCursorPosition}
          onClick={updateCursorPosition}
          onFocus={() => {
            onElementClick?.('output');
            setHint(null);
            setShowJumpOptions(false);
            setCurrentElement(null);
            setSuggestion('');
            updateCursorPosition();
          }}
          placeholder="Start building your chim prompts using the elements below or chat page (tab + space)..."
          className="font-mono text-lg p-4 min-h-[100px] resize-none pr-12 bg-[#1B2330] text-foreground border border-[#FFFFFF] rounded-lg"
        />

        <div className="absolute inset-0 pointer-events-none">
          <div className="font-mono text-lg p-4 text-foreground/20">
            {renderPromptWithColoredAsterisks(prompt)}
          </div>
        </div>

        {currentElement && suggestion && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="font-mono text-lg p-4 text-foreground/20">
              {prompt + suggestion}
            </div>
          </div>
        )}
        {showShortcuts && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="font-mono text-lg p-4 text-foreground/20">
            </div>
          </div>
        )}
        {showJumpOptions && (
          <div className="absolute left-0 right-12 bottom-0 bg-[#3F5268] border rounded-b-lg p-2">
            <div className="flex gap-2">
              {JUMP_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-600"
                  onClick={() => selectJumpOption(option)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={copyPrompt}
          disabled={!prompt.trim()}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      <motion.div className="space-y-4">
        {ELEMENT_CATEGORIES.map((category) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-medium" style={{ color: "#B7D1E1" }}>
              {category.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.elements.map(name => {
                const element = elements.find(e => e.name === name);
                const shortcutKey = Object.entries(KEYBOARD_SHORTCUTS).find(([_, val]) => val === name)?.[0];
                const isSelected = selectedElements.has(name);
                const isDisabled = false;

                return (
                  <motion.button
                    key={name}
                    onClick={() => toggleElement(name)}
                    disabled={isDisabled}
                    className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isDisabled
                        ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
                        : isSelected
                          ? `${category.color} ring-2 ring-offset-2 ring-offset-background ring-${category.color.match(/text-(\w+)-\d+/)?.[1]}-600`
                          : category.color
                    }`}
                    whileHover={!isDisabled ? { scale: 1.05 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                  >
                    <span className={`text-${category.color.match(/text-(\w+)-\d+/)?.[1] || 'foreground'}`}>*</span>
                    {name}
                    <span className={`text-${category.color.match(/text-(\w+)-\d+/)?.[1] || 'foreground'}`}>*</span>
                    {showShortcuts && shortcutKey && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded shadow-sm">
                        {shortcutKey.toUpperCase()}
                      </span>
                    )}
                    {element && (
                      <span className="sr-only">{element.description}</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}