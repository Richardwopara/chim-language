import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

interface CodeBlockProps {
  code: string;
}

export default function CodeBlock({ code }: CodeBlockProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      duration: 1000
    });
    setTimeout(() => setCopied(false), 1000);
  };

  const highlightedCode = Prism.highlight(
    code,
    Prism.languages.javascript,
    "javascript"
  );

  return (
    <div className="relative">
      <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
        <code
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={copyCode}
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}