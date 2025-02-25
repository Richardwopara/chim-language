import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MessageSquare, ChevronLeft, ChevronRight, Book, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import Header from "@/components/Header";
import PromptBuilder from "@/components/PromptBuilder";
import CodeBlock from "@/components/CodeBlock";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { SavedCode, SavedPrompt } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const QUESTIONS = [
  {
    id: 'platform',
    question: "What programming language or framework are you using? (e.g., JavaScript, Swift, React)",
    required: true
  },
  {
    id: 'device',
    question: "What device or platform are you targeting? (e.g., web, iPhone, Android)",
    required: true
  },
  {
    id: 'element',
    question: "What UI element do you want to create? (e.g., search bar, button, card)",
    required: true
  },
  {
    id: 'reference',
    question: "Which app would you like to reference for styling? (e.g., Instagram, WhatsApp)",
    required: true
  },
  {
    id: 'background',
    question: "Would you like a specific background color? (optional, in hex)",
    required: false
  }
];

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export default function Playground() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [output, setOutput] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [showAddCodeDialog, setShowAddCodeDialog] = useState(false);
  const [showAddPromptDialog, setShowAddPromptDialog] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: QUESTIONS[0].question
  }]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [userInput, setUserInput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>("chat");
  const [isTyping, setIsTyping] = useState(false);
  const [isTabPressed, setIsTabPressed] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<string>('');
  const { toast } = useToast();
  const [editMode, setEditMode] = useState<{ id: number; type: string } | null>(null);
  const [itemComment, setItemComment] = useState("");

  const { data: savedCodes = [] } = useQuery<SavedCode[]>({
    queryKey: ['/api/saved-codes'],
  });

  const { data: savedPrompts = [] } = useQuery<SavedPrompt[]>({
    queryKey: ['/api/saved-prompts'],
  });

  const createCodeMutation = useMutation({
    mutationFn: async (content: string, comment?: string) => {
      await apiRequest('POST', '/api/saved-codes', {
        name: `Code ${savedCodes.length + 1}`,
        content,
        isPublic: false,
        comment
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-codes'] });
      setShowAddCodeDialog(false);
      setNewCode("");
      setItemComment("");
      toast({
        title: "Code Saved",
        description: "Your code has been saved successfully",
      });
    },
  });

  const deleteCodeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/saved-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-codes'] });
      toast({
        title: "Code Deleted",
        description: "Your code has been deleted successfully",
      });
    },
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: async ({ id, isPublic }: { id: number; isPublic: boolean }) => {
      await apiRequest('PATCH', `/api/saved-codes/${id}/visibility`, { isPublic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-codes'] });
    },
  });

  const createPromptMutation = useMutation({
    mutationFn: async ({ content, type }: { content: string; type: string }) => {
      const typeCount = savedPrompts.filter(p => p.type === type).length + 1;
      const name = `${type.charAt(0).toUpperCase() + type.slice(1)} ${typeCount}`;

      await apiRequest('POST', '/api/saved-prompts', {
        name,
        content,
        type,
        isPublic: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-prompts'] });
      setShowAddPromptDialog(false);
      setNewPrompt("");
      setItemComment("");
      toast({
        title: "Saved Successfully",
        description: "Your content has been saved",
      });
    },
  });

  const deletePromptMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/saved-prompts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-prompts'] });
      toast({
        title: "Prompt Deleted",
        description: "Your prompt has been deleted successfully",
      });
    },
  });

  const updatePromptVisibilityMutation = useMutation({
    mutationFn: async ({ id, isPublic }: { id: number; isPublic: boolean }) => {
      await apiRequest('PATCH', `/api/saved-prompts/${id}/visibility`, { isPublic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-prompts'] });
    },
  });

  const updateCodeMutation = useMutation({
    mutationFn: async ({ id, content, comment }: { id: number; content: string; comment?: string }) => {
      await apiRequest('PATCH', `/api/saved-codes/${id}`, { content, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-codes'] });
      setEditMode(null);
      setNewCode("");
      setItemComment("");
      toast({
        title: "Code Updated",
        description: "Your code has been updated successfully",
      });
    },
  });

  const updatePromptMutation = useMutation({
    mutationFn: async ({ id, content, comment }: { id: number; content: string; comment?: string }) => {
      await apiRequest('PATCH', `/api/saved-prompts/${id}`, { content, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-prompts'] });
      setEditMode(null);
      setNewPrompt("");
      setItemComment("");
      toast({
        title: "Prompt Updated",
        description: "Your prompt has been updated successfully",
      });
    },
  });

  const handleSaveCode = async () => {
    if (!newCode.trim()) {
      toast({
        title: "Error",
        description: "Please provide code content",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCodeMutation.mutateAsync(newCode, itemComment);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save code",
        variant: "destructive",
      });
    }
  };

  const handleSavePrompt = async () => {
    if (!newPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please provide content",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPromptMutation.mutateAsync({
        content: newPrompt,
        type: activeSubTab
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save",
        variant: "destructive",
      });
    }
  };

  const handleVisibilityChange = async (code: SavedCode, isPublic: boolean) => {
    try {
      await updateVisibilityMutation.mutateAsync({ id: code.id, isPublic: isPublic });
      toast({
        title: "Visibility Updated",
        description: `Code is now ${isPublic ? 'public' : 'private'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update code visibility",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCode = async (code: SavedCode) => {
    try {
      await deleteCodeMutation.mutateAsync(code.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete code",
        variant: "destructive",
      });
    }
  };

  const handleDeletePrompt = async (prompt: SavedPrompt) => {
    try {
      await deletePromptMutation.mutateAsync(prompt.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive",
      });
    }
  };

  const handlePromptVisibilityChange = async (prompt: SavedPrompt, isPublic: boolean) => {
    try {
      await updatePromptVisibilityMutation.mutateAsync({ id: prompt.id, isPublic });
      toast({
        title: "Visibility Updated",
        description: `Prompt is now ${isPublic ? 'public' : 'private'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update prompt visibility",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1;
      setCurrentQuestion(prevQuestion);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: QUESTIONS[prevQuestion].question
      }]);
    }
  };

  const handleSkip = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      setAnswers(prev => ({
        ...prev,
        [QUESTIONS[currentQuestion].id]: "skipped"
      }));
      setMessages(prev => [
        ...prev,
        { role: 'user', content: 'Skipped' },
        { role: 'assistant', content: QUESTIONS[nextQuestion].question }
      ]);
    }
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    setMessages(prev => [...prev, {
      role: 'user',
      content: userInput
    }]);

    const currentQ = QUESTIONS[currentQuestion];
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: userInput
    }));

    if (currentQuestion < QUESTIONS.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: QUESTIONS[nextQuestion].question
      }]);
    } else {
      const prompt = constructPrompt(answers);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Here's your ChimPrompt:\n${prompt}`
      }]);
      setOutput(prompt);
      setPrompt(prompt);
      setTimeout(() => {
        setMessages([{
          role: 'assistant',
          content: QUESTIONS[0].question
        }]);
        setCurrentQuestion(0);
        setAnswers({});
      }, 5000);
    }

    setUserInput("");
  };

  const constructPrompt = (data: Record<string, string>) => {
    let promptParts = [];

    if (data.platform) promptParts.push(`*in* ${data.platform.toLowerCase()}`);
    if (data.device) promptParts.push(`*for* ${data.device.toLowerCase()}`);
    if (data.element) promptParts.push(`*create* ${data.element.toLowerCase()}`);
    if (data.reference) promptParts.push(`*from* ${data.reference.toLowerCase()}`);
    if (data.background) promptParts.push(`*background* ${data.background}`);

    return promptParts.join(' | ');
  };

  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    const hasContent = !!newPrompt.trim();
    setIsTyping(hasContent);
    setActiveTab(hasContent ? null : "chat");
  };

  const handlePromptComplete = () => {
    setIsTyping(false);
    if (!prompt.trim()) {
      setActiveTab("chat");
    }
  };

  const handleTabChange = (tab: string) => {
    // Allow tab changes if there's no content or if we're not typing
    if (!prompt.trim() || !isTyping) {
      setActiveTab(tab);
      // Set default sub-tab value based on the main tab
      if (tab === 'codes') {
        setActiveSubTab('mine');
      } else if (tab === 'prompts') {
        setActiveSubTab('prompts');
      } else {
        setActiveSubTab('');
      }
    }
  };

  const switchToTab = (elementType: string) => {
    // Always allow switching if there's no content
    if (!prompt.trim()) {
      switch (elementType) {
        case 'context':
        case 'chimcontext':
          setActiveTab('codes');
          break;
        case 'prompt':
        case 'chimprompt':
          setActiveTab('prompts');
          break;
        default:
          setActiveTab('chat');
      }
      return;
    }

    // Only block switching if we're actively typing with content
    if (!isTyping) {
      switch (elementType) {
        case 'context':
        case 'chimcontext':
          setActiveTab('codes');
          break;
        case 'prompt':
        case 'chimprompt':
          setActiveTab('prompts');
          break;
        default:
          setActiveTab('chat');
      }
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setIsTabPressed(true);
      } else if (isTabPressed) {
        e.preventDefault();
        switch (e.key) {
          case '1':
            setActiveTab('chat');
            setActiveSubTab('');
            break;
          case '2':
            setActiveTab('codes');
            setActiveSubTab('mine');
            break;
          case '3':
            setActiveTab('prompts');
            setActiveSubTab('prompts');
            break;
          case '4':
          case '5':
            const codesValue = e.key === '4' ? 'mine' : 'community';
            setActiveTab('codes');
            setActiveSubTab(codesValue);
            break;
          case '6':
          case '7':
          case '8':
          case '9':
            const promptsValueMap: Record<string, string> = {
              '6': 'prompts',
              '7': 'forges',
              '8': 'molds',
              '9': 'explore'
            };
            const promptsValue = promptsValueMap[e.key];
            setActiveTab('prompts');
            setActiveSubTab(promptsValue);
            break;
          case '-':
            handleBack();
            break;
          case '+':
          case '=':
            handleSkip();
            break;
          case ' ':
            const input = document.querySelector('input[placeholder="Type your answer..."]') as HTMLInputElement;
            if (input) input.focus();
            break;
          case '/':
            const infoLink = document.querySelector('a[href="/info"]') as HTMLAnchorElement;
            if (infoLink) infoLink.click();
            break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsTabPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isTabPressed, handleBack, handleSkip, activeSubTab]);

  const handleSaveEdit = async () => {
    if (!editMode) return;

    try {
      if (editMode.type === 'code') {
        await updateCodeMutation.mutateAsync({
          id: editMode.id,
          content: newCode,
          comment: itemComment
        });
      } else {
        await updatePromptMutation.mutateAsync({
          id: editMode.id,
          content: newPrompt,
          comment: itemComment
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${editMode.type}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#1B2330]">
      <main className="container mx-auto p-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex gap-4">
            <div className="w-1/2 bg-[#1B2330] rounded-lg">
              <PromptBuilder
                onExecute={setOutput}
                value={prompt}
                onChange={handlePromptChange}
                onComplete={handlePromptComplete}
                onElementClick={switchToTab}
              />
            </div>

            <div className="w-1/2">
              <Card className="h-full bg-[#1B2330] border-none">
                <CardContent className="pt-0">
                  <Tabs value={activeTab || undefined} onValueChange={handleTabChange}>
                    <TabsList className="w-full bg-[#1B2330] border border-[#FFFFFF] rounded-lg mb-4">
                      <TabsTrigger value="chat" className="flex-1 relative data-[state=active]:bg-[#1B2330]">
                        Chat
                        {isTabPressed && (
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded shadow-sm">
                            1
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="codes" className="flex-1 relative data-[state=active]:bg-[#1B2330]">
                        Contexts
                        {isTabPressed && (
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded shadow-sm">
                            2
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="prompts" className="flex-1 relative data-[state=active]:bg-[#1B2330]">
                        Prompts
                        {isTabPressed && (
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded shadow-sm">
                            3
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="chat" className="mt-4">
                      <div className="relative h-[calc(100vh-18rem)] bg-[#1B2330] rounded-2xl border border-white overflow-hidden">
                        <div className="flex flex-col h-full">
                          <div
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto space-y-4 p-4 mb-16"
                          >
                            {messages.map((message, index) => (
                              <div
                                key={index}
                                className={`flex ${
                                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                    message.role === 'assistant'
                                      ? 'bg-[#3F5268] text-foreground'
                                      : 'bg-[#B7D1E1] text-[#3F5268]'
                                  }`}
                                >
                                  {message.content}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#1B2330] backdrop-blur supports-[backdrop-filter]:bg-[#1B2330]/60">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1 mr-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleBack}
                                  disabled={currentQuestion === 0}
                                  title="Go back to previous question"
                                  className="relative h-7 w-7 bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0"
                                >
                                  <ChevronLeft className="h-3 w-3 text-muted-foreground/40" />
                                  {isTabPressed && (
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded shadow-sm">
                                      -
                                    </span>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleSkip}
                                  disabled={currentQuestion === QUESTIONS.length - 1}
                                  title="Skip this question"
                                  className="relative h-7 w-7 bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0"
                                >
                                  <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                                  {isTabPressed && (
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded shadow-sm">
                                      +
                                    </span>
                                  )}
                                </Button>
                              </div>
                              <div className="relative flex-1">
                                <Input
                                  value={userInput}
                                  onChange={(e) => setUserInput(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                  placeholder="Type your answer..."
                                  className="w-full bg-[#3F5268] text-foreground border-none"
                                />
                                {isTabPressed && (
                                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded shadow-sm">
                                    space
                                  </span>
                                )}
                              </div>
                              <Link href="/info">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="relative gap-1 h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                  <Book className="h-3 w-3" />
                                  Info
                                  {isTabPressed && (
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded shadow-sm">
                                      /
                                    </span>
                                  )}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="codes" className="mt-4 bg-[#1B2330] rounded-lg border border-[#FFFFFF] p-4">
                      <div className="space-y-4">
                        <Tabs
                          value={activeSubTab || "mine"}
                          onValueChange={(value) => setActiveSubTab(value)}
                          className="w-full"
                        >
                          <TabsList className="grid w-full grid-cols-2 bg-[#1B2330] border border-[#FFFFFF] rounded-lg">
                            <TabsTrigger value="mine" className="relative data-[state=active]:bg-[#1B2330]">
                              Mine
                              {isTabPressed && activeTab === 'codes' && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded shadow-sm">
                                  4
                                </span>
                              )}
                            </TabsTrigger>
                            <TabsTrigger value="community" className="relative data-[state=active]:bg-[#1B2330]">
                              Community
                              {isTabPressed && activeTab === 'codes' && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded shadow-sm">
                                  5
                                </span>
                              )}
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="mine" className="mt-4">
                            <div className="space-y-4">
                              {savedCodes.map((code, index) => (
                                <Card key={code.id}>
                                  <div className="p-6 bg-[#3F5268] text-foreground rounded-lg">
                                    <div className="flex justify-between items-center mb-4">
                                      <h3 className="font-medium">Context {index + 1}</h3>
                                      <div className="flex items-center gap-4">
                                        <code className="text-sm text-muted-foreground">
                                          {code.isPublic && code.chimContextId ? code.chimContextId : `context:${index + 1}`}
                                        </code>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-muted-foreground">
                                            {code.isPublic ? 'Public' : 'Private'}
                                          </span>
                                          <Switch
                                            checked={code.isPublic || false}
                                            onCheckedChange={(checked) => handleVisibilityChange(code, checked)}
                                            className="data-[state=checked]:bg-white"
                                          />
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => {
                                              setEditMode({ id: code.id, type: 'code' });
                                              setNewCode(code.content);
                                              setItemComment(code.comment || "");
                                            }}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => handleDeleteCode(code)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                      {editMode?.id === code.id ? (
                                        <div className="space-y-4">
                                          <Textarea
                                            value={newCode || code.content}
                                            onChange={(e) => setNewCode(e.target.value)}
                                            className="min-h-[100px] bg-[#1B2330] text-foreground border-none"
                                          />
                                          <Input
                                            value={itemComment}
                                            onChange={(e) => setItemComment(e.target.value)}
                                            placeholder="Add a comment (optional)"
                                            className="bg-[#1B2330] text-foreground border-none"
                                          />
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              variant="ghost"
                                              onClick={() => {
                                                setEditMode(null);
                                                setNewCode("");
                                                setItemComment("");
                                              }}
                                              className="bg-[#1B2330] text-foreground hover:bg-[#1B2330]/90"
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              onClick={handleSaveEdit}
                                              className="bg-[#1B2330] text-foreground hover:bg-[#1B2330]/90"
                                            >
                                              Save
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <CodeBlock code={code.content} />
                                      )}
                                      {code.comment && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                          <span className="font-mono">*maybe*</span> {code.comment}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </Card>
                              ))}
                              <Button
                                variant="outline"
                                className="w-full mt-4 bg-[#3F5268] text-foreground hover:bg-[#3F5268]/90"
                                onClick={() => setShowAddCodeDialog(true)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Context
                              </Button>
                            </div>
                          </TabsContent>

                          <TabsContent value="community" className="mt-4">
                            <div className="space-y-4">
                              {savedCodes
                                .filter(code => code.isPublic)
                                .map((code, index) => (
                                  <Card key={code.id}>
                                    <div className="p-6 bg-[#3F5268] text-foreground rounded-lg">
                                      <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                          <h3 className="font-medium">Code {code.chimContextId}</h3>
                                        </div>
                                        <code className="text-sm text-muted-foreground">
                                          {code.chimContextId}
                                        </code>
                                      </div>
                                      <CodeBlock code={code.content} />
                                      {code.comment && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                          <span className="font-mono">*maybe*</span> {code.comment}
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </TabsContent>

                    <TabsContent value="prompts" className="mt-4 bg-[#1B2330] rounded-lg border border-[#FFFFFF] p-4">
                      <div className="space-y-4">
                        <Tabs
                          value={activeSubTab || "prompts"}
                          onValueChange={(value) => setActiveSubTab(value)}
                          className="w-full"
                        >
                          <TabsList className="grid w-full grid-cols-4 bg-[#1B2330] border border-[#FFFFFF] rounded-lg">
                            <TabsTrigger value="prompts" className="relative data-[state=active]:bg-[#1B2330]">
                              Prompts
                              {isTabPressed && activeTab === 'prompts' && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black text-whitepx-1.5 py-0.5 rounded shadow-sm">
                                  6
                                </span>
                              )}
                            </TabsTrigger>
                            <TabsTrigger value="forges" className="relative data-[state=active]:bg-[#1B2330]">
                              Forges
                              {isTabPressed && activeTab === 'prompts' && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded shadow-sm">
                                  7
                                </span>
                              )}
                            </TabsTrigger>
                            <TabsTrigger value="molds" className="relative data-[state=active]:bg-[#1B2330]">
                              Molds
                              {isTabPressed && activeTab === 'prompts' && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded shadow-sm">
                                  8
                                </span>
                              )}
                            </TabsTrigger>
                            <TabsTrigger value="explore" className="relative data-[state=active]:bg-[#1B2330]">
                              Explore
                              {isTabPressed && activeTab === 'prompts' && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded shadow-sm">
                                  9
                                </span>
                              )}
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="prompts" className="mt-4">
                            <div className="space-y-4">
                              {savedPrompts
                                .filter(prompt => !prompt.type || prompt.type === activeSubTab)
                                .map((item, index) => (
                                  <Card key={item.id}>
                                    <div className="p-6 bg-[#3F5268] text-foreground rounded-lg">
                                      <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-medium">{item.name}</h3>
                                        <div className="flex items-center gap-4">
                                          <code className="text-sm text-muted-foreground">
                                            {item.isPublic ? item.chimPromptId : `${item.type}:${index + 1}`}
                                          </code>
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                              {item.isPublic ? 'Public' : 'Private'}
                                            </span>
                                            <Switch
                                              checked={item.isPublic}
                                              onCheckedChange={(checked) => handlePromptVisibilityChange(item, checked)}
                                              className="data-[state=checked]:bg-white"
                                            />
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() => {
                                                setEditMode({ id: item.id, type: item.type });
                                                setNewPrompt(item.content);
                                                setItemComment(item.comment || "");
                                              }}
                                            >
                                              <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 text-destructive hover:text-destructive"
                                              onClick={() => handleDeletePrompt(item)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                      {editMode?.id === item.id ? (
                                        <div className="space-y-4">
                                          <Textarea
                                            value={newPrompt || item.content}
                                            onChange={(e) => setNewPrompt(e.target.value)}
                                            className="min-h-[100px] bg-[#1B2330] text-foreground border-none"
                                          />
                                          <Input
                                            value={itemComment}
                                            onChange={(e) => setItemComment(e.target.value)}
                                            placeholder="Add a comment (optional)"
                                            className="bg-[#1B2330] text-foreground border-none"
                                          />
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              variant="ghost"
                                              onClick={() => {
                                                setEditMode(null);
                                                setNewPrompt("");
                                                setItemComment("");
                                              }}
                                              className="bg-[#1B2330] text-foreground hover:bg-[#1B2330]/90"
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              onClick={handleSaveEdit}
                                              className="bg-[#1B2330] text-foreground hover:bg-[#1B2330]/90"
                                            >
                                              Save
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="bg-[#1B2330] p-4 rounded-lg">
                                          <code className="text-sm whitespace-pre-wrap">{item.content}</code>
                                        </div>
                                      )}
                                      {item.comment && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                          <span className="font-mono">*maybe*</span> {item.comment}
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                ))}
                              <Button
                                variant="outline"
                                className="w-full mt-4 bg-[#3F5268] text-foreground hover:bg-[#3F5268]/90"
                                onClick={() => setShowAddPromptDialog(true)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New {activeSubTab === 'prompts' ? 'Prompt' : activeSubTab === 'forges' ? 'Forge' : 'Mold'}
                              </Button>
                            </div>
                          </TabsContent>

                          <TabsContent value="forges" className="mt-4">
                            <div className="space-y-4">
                              {savedPrompts
                                .filter(prompt => prompt.type === 'forge')
                                .map((forge, index) => (
                                  <Card key={forge.id}>
                                    <div className="p-6 bg-[#3F5268] text-foreground rounded-lg">
                                      <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => handleDeletePrompt(forge)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => {
                                              setEditMode({ id: forge.id, type: 'forge' });
                                              setNewPrompt(forge.content);
                                              setItemComment(forge.comment || "");
                                            }}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <h3 className="font-medium">Forge {index + 1}</h3>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <code className="text-sm text-muted-foreground">
                                            {forge.isPublic ? forge.chimPromptId : `forge:${index + 1}`}
                                          </code>
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                              {forge.isPublic ? 'Public' : 'Private'}
                                            </span>
                                            <Switch
                                              checked={forge.isPublic}
                                              onCheckedChange={(checked) => handlePromptVisibilityChange(forge, checked)}
                                              className="data-[state=checked]:bg-white"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      {editMode?.id === forge.id ? (
                                        <div className="space-y-4">
                                          <Textarea
                                            value={newPrompt || forge.content}
                                            onChange={(e) => setNewPrompt(e.target.value)}
                                            className="min-h-[100px] bg-[#1B2330] text-foreground border-none"
                                          />
                                          <Input
                                            value={itemComment}
                                            onChange={(e) => setItemComment(e.target.value)}
                                            placeholder="Add a comment (optional)"
                                            className="bg-[#1B2330] text-foreground border-none"
                                          />
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              variant="ghost"
                                              onClick={() => {
                                                setEditMode(null);
                                                setNewPrompt("");
                                                setItemComment("");
                                              }}
                                              className="bg-[#1B2330] text-foreground hover:bg-[#1B2330]/90"
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              onClick={handleSaveEdit}
                                              className="bg-[#1B2330] text-foreground hover:bg-[#1B2330]/90"
                                            >
                                              Save
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="bg-[#1B2330] p-4 rounded-lg">
                                          <code className="text-sm whitespace-pre-wrap">{forge.content}</code>
                                        </div>
                                      )}
                                      {forge.comment && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                          <span className="font-mono">*maybe*</span> {forge.comment}
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                ))}
                              <Button
                                variant="outline"
                                className="w-full mt-4 bg-[#3F5268] text-foreground hover:bg-[#3F5268]/90"
                                onClick={() => setShowAddPromptDialog(true)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Forge
                              </Button>
                            </div>
                          </TabsContent>

                          <TabsContent value="molds" className="mt-4">
                            <div className="space-y-4">
                              {savedPrompts
                                .filter(prompt => prompt.type === 'mold')
                                .map((mold, index) => (
                                  <Card key={mold.id}>
                                    <div className="p-6 bg-[#3F5268] text-foreground rounded-lg">
                                      <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => handleDeletePrompt(mold)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => {
                                              setEditMode({ id: mold.id, type: 'mold' });
                                              setNewPrompt(mold.content);
                                              setItemComment(mold.comment || "");
                                            }}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <h3 className="font-medium">Mold {index + 1}</h3>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <code className="text-sm text-muted-foreground">
                                            {mold.isPublic ? mold.chimPromptId : `mold:${index + 1}`}
                                          </code>
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                              {mold.isPublic ? 'Public' : 'Private'}
                                            </span>
                                            <Switch
                                              checked={mold.isPublic}
                                              onCheckedChange={(checked) => handlePromptVisibilityChange(mold, checked)}
                                              className="data-[state=checked]:bg-white"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      {editMode?.id === mold.id ? (
                                        <div className="space-y-4">
                                          <Textarea
                                            value={newPrompt || mold.content}
                                            onChange={(e) => setNewPrompt(e.target.value)}
                                            className="min-h-[100px] bg-[#1B2330] text-foreground border-none"
                                          />
                                          <Input
                                            value={itemComment}
                                            onChange={(e) => setItemComment(e.target.value)}
                                            placeholder="Add a comment (optional)"
                                            className="bg-[#1B2330] text-foreground border-none"
                                          />
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              variant="ghost"
                                              onClick={() => {
                                                setEditMode(null);
                                                setNewPrompt("");
                                                setItemComment("");
                                              }}
                                              className="bg-[#1B2330] text-foreground hover:bg-[#1B2330]/90"
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              onClick={handleSaveEdit}
                                              className="bg-[#1B2330] text-foreground hover:bg-[#1B2330]/90"
                                            >
                                              Save
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="bg-[#1B2330] p-4 rounded-lg">
                                          <code className="text-sm whitespace-pre-wrap">{mold.content}</code>
                                        </div>
                                      )}
                                      {mold.comment && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                          <span className="font-mono">*maybe*</span> {mold.comment}
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                ))}
                              <Button
                                variant="outline"
                                className="w-full mt-4 bg-[#3F5268] text-foreground hover:bg-[#3F5268]/90"
                                onClick={() => setShowAddPromptDialog(true)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Mold
                              </Button>
                            </div>
                          </TabsContent>

                          <TabsContent value="explore" className="mt-4">
                            <div className="space-y-4">
                              {savedPrompts
                                .filter(prompt => prompt.isPublic)
                                .map((prompt, index) => (
                                  <Card key={prompt.id}>
                                    <div className="p-6 bg-[#3F5268] text-foreground rounded-lg">
                                      <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-medium">{prompt.name}</h3>
                                        <code className="text-sm text-muted-foreground">
                                          {prompt.chimPromptId}
                                        </code>
                                      </div>
                                      <div className="bg-[#1B2330] p-4 rounded-lg">
                                        <code className="text-sm whitespace-pre-wrap">{prompt.content}</code>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </TabsContent>


                    <Dialog open={showAddPromptDialog} onOpenChange={setShowAddPromptDialog}>
                      <DialogContent className="bg-[#1B2330] text-foreground border border-[#FFFFFF]">
                        <DialogHeader>
                          <DialogTitle>Add New {activeSubTab === 'prompts' ? 'Prompt' : activeSubTab === 'forges' ? 'Forge' : 'Mold'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Textarea
                            value={newPrompt}
                            onChange={(e) => setNewPrompt(e.target.value)}
                            placeholder={`Enter your ${activeSubTab === 'prompts' ? 'prompt' : activeSubTab === 'forges' ? 'forge' : 'mold'} here...`}
                            className="min-h-[200px] bg-[#3F5268] text-foreground border-none"
                          />
                          <Input
                            value={itemComment}
                            onChange={(e) => setItemComment(e.target.value)}
                            placeholder="Add a comment (optional)"
                            className="bg-[#3F5268] text-foreground border-none"
                          />
                          <div className="flex justify-end gap-4">
                            <Button
                              variant="ghost"
                              onClick={() => setShowAddPromptDialog(false)}
                              className="bg-[#1B2330] text-foreground hover:bg-[#1B2330]/90"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSavePrompt}
                              className="bg-[#1B2330] text-foreground hover:bg-[#1B2330]/90"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
        <Dialog open={showAddCodeDialog} onOpenChange={setShowAddCodeDialog}>
          <DialogContent className="bg-[#3F5268] text-foreground border-none">
            <DialogHeader>
              <DialogTitle>Add New Context</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Enter your code here..."
                className="min-h-[200px]"
              />
              <Input
                value={itemComment}
                onChange={(e) => setItemComment(e.target.value)}
                placeholder="Add a comment (optional)"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddCodeDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCode}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}