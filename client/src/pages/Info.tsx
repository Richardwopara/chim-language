import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInput,
} from "@/components/ui/sidebar";
import { useState, useEffect, useRef } from 'react';

const KEYWORDS = [
  { id: 'in', name: 'in', desc: 'For specifying the language you want the output to be in.', shortcut: 'Tab + Q' },
  { id: 'for', name: 'for', desc: 'For choosing the app platform you\'re building', shortcut: 'Tab + W' },
  { id: 'context', name: 'context', desc: 'Allows you to reference code using index number shortcut.', shortcut: 'Tab + E' },
  { id: 'line', name: 'line', desc: 'For specifying what line the code should be in', shortcut: 'Tab + R' },
  { id: 'chimcontext', name: 'chimcontext', desc: 'Allows you to reference code using code id', shortcut: 'Tab + T' },
  { id: 'prompt', name: 'prompt', desc: 'Load a local prompt name saved in library', shortcut: 'Tab + Y' },
  { id: 'chimprompt', name: 'chimprompt', desc: 'To load a public prompt name', shortcut: 'Tab + U' },
  { id: 'spawn', name: 'spawn', desc: 'To create visually similar entire page from program', shortcut: 'Tab + I' },
  { id: 'rare', name: 'rare', desc: 'Randomly creates a unique object', shortcut: 'Tab + O' },
  { id: 'create', name: 'create', desc: 'For specifying the object in particular you want to achieve', shortcut: 'Tab + P' },
  { id: 'from', name: 'from', desc: 'For mimicking the appearance of an object from an already existing app', shortcut: 'Tab + A' },
  { id: 'makeit', name: 'makeit', desc: 'For selecting if its gonna be auto hiding (dynamic) or static', shortcut: 'Tab + S' },
  { id: 'like', name: 'like', desc: 'For mimicking the functionality of a similar object', shortcut: 'Tab + D' },
  { id: 'but', name: 'but', desc: 'For replacing abstract attributes and adding exact dimensions', shortcut: 'Tab + F' },
  { id: 'with', name: 'with', desc: 'For adding abstract attributes', shortcut: 'Tab + G' },
  { id: 'without', name: 'without', desc: 'For removing abstract attributes', shortcut: 'Tab + H' },
  { id: 'nextto', name: 'nextto', desc: 'Reference position relative to an object', shortcut: 'Tab + J' },
  { id: 'blame', name: 'blame', desc: 'For specifying a problem you want to make sure doesn\'t occur', shortcut: 'Tab + K' },
  { id: 'animate', name: 'animate', desc: 'For adding an animation for when tapped and speed', shortcut: 'Tab + L' },
  { id: 'background', name: 'background', desc: 'For the background colour', shortcut: 'Tab + Z' },
  { id: 'font', name: 'font', desc: 'For specifying what the font will be if applicable', shortcut: 'Tab + X' },
  { id: 'maybe', name: 'maybe', desc: 'Allows you to describe what you want in your own words', shortcut: 'Tab + C' },
  { id: 'then', name: 'then', desc: 'For replicating the same edits and using it to create multiple codes', shortcut: 'Tab + V' },
  { id: 'forge', name: 'forge', desc: 'Save a configuration for a component', shortcut: 'Tab + B' },
  { id: 'mold', name: 'mold', desc: 'Make multiple objects be part of a single page', shortcut: 'Tab + N' },
  { id: 'jump', name: 'jump', desc: 'Auto arrange prompts in order of importance', shortcut: 'Tab + M' },
];

export default function Info() {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(KEYWORDS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const mainContentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const filteredKeywords = KEYWORDS.filter(keyword =>
    keyword.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    keyword.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    KEYWORDS.forEach(keyword => {
      sectionRefs.current[keyword.id] = document.getElementById(keyword.id);
    });

    const handleScroll = () => {
      if (!mainContentRef.current) return;

      let mostVisibleSection = null;
      let maxVisibility = 0;

      Object.entries(sectionRefs.current).forEach(([id, element]) => {
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const visibility = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);

        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          mostVisibleSection = id;
        }
      });

      if (mostVisibleSection && mostVisibleSection !== selectedKeyword) {
        setSelectedKeyword(mostVisibleSection);
      }
    };

    mainContentRef.current?.addEventListener('scroll', handleScroll);
    return () => mainContentRef.current?.removeEventListener('scroll', handleScroll);
  }, [selectedKeyword]);

  const getExampleForKeyword = (keyword: string | null) => {
    if(keyword === null) return ""; 
    switch (keyword) {
      case 'in':
        return '*in* swift';
      case 'for':
        return '*for* apple phone';
      case 'context':
        return ['*context* 39 //39th code file in your library', '*context* 39; 45', '*context* 39 to 45'];
      case 'line':
        return ['*line* 150', '*line* react; 150'];
      case 'chimcontext':
        return '*chimcontext* 4535hevne53354 //public code id';
      case 'prompt':
        return ['*prompt* saved1', '*prompt* [homepage] //assuming a mold called homepage exists'];
      case 'chimprompt':
        return '*chimprompt* richardssearchbar';
      case 'spawn':
        return '*spawn* instagram/ home page; instagram.com';
      case 'rare':
        return '*rare* search bar';
      case 'create':
        return '*create* search bar';
      case 'from':
        return '*from* instagram/ search page';
      case 'makeit':
        return '*makeit* static';
      case 'like':
        return '*like* snapchat/ explore page';
      case 'but':
        return '*but* fire edges that turn cold when inactive for 1 minute; top center; rectangle; 4:5; 35';
      case 'with':
        return '*with* fire edges';
      case 'without':
        return '*without* search icon on the end';
      case 'nextto':
        return [
          '*nextto* left (search bar)',
          '*nextto* within left (loading screen)',
          '*nextto* within bottom right (checkout page)',
          '*nextto* above (share sheet)',
          '*nextto* within below (chat screen)'
        ];
      case 'blame':
        return '*blame* instagram / search page';
      case 'animate':
        return '*animate* start(3; appear); end(5, fade out)';
      case 'background':
        return ['*background* ffffffff', '*background* light(ffffffff); dark(00000000)'];
      case 'font':
        return [
          '*font* aerial; center; ffffffff; 15',
          '*font* aerial; left; light(00000000); dark(ffffffff); 15'
        ];
      case 'maybe':
        return '*maybe* snapchat search bar with a bit of instagram feel';
      case 'then':
        return '*then* loading screen; checkout page';
      case 'forge':
        return ['*blame* instagram / search page;  (ig bias)', '*blame* (ig bias)'];
      case 'mold':
        return ['*mold* loading screen; checkout page; [home page]', '*mold* (home page)'];
      case 'jump':
        return ['*jump* descending', '*jump* ascending', '*jump* reset'];
      default:
        return '';
    }
  };

  const scrollToKeyword = (keywordId: string) => {
    setSelectedKeyword(keywordId);
    const element = document.getElementById(keywordId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider defaultOpen>
        <div className="flex">
          <Sidebar>
            <SidebarHeader className="p-4 border-b">
              <div className="flex items-center gap-2 mb-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Home className="h-4 w-4" />
                  </Button>
                </Link>
                <SidebarInput
                  placeholder="Search keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {filteredKeywords.map((keyword) => (
                  <SidebarMenuItem key={keyword.id} className="px-1">
                    <SidebarMenuButton
                      onClick={() => scrollToKeyword(keyword.id)}
                      isActive={selectedKeyword === keyword.id}
                      className="w-full px-3 py-2 hover:bg-accent rounded-md transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-primary">*</span>
                          <span className="font-medium">{keyword.name}</span>
                          <span className="font-mono text-sm text-primary">*</span>
                        </div>
                        <code className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-mono text-muted-foreground">
                          {keyword.shortcut}
                        </code>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          <main 
            ref={mainContentRef}
            className="flex-1 p-6 lg:pl-[300px] overflow-y-auto h-screen"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <div className="mb-12 text-left">
                <h1 className="text-4xl font-bold mb-4">
                  Chim Prompt Standard v1
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  Created by Chim Wopara in 2025 as a concise and universal way for prompt engineers to represent prompts, 
                  forge shortcuts, share prompt designs and create contexts that can be universally referenced.
                </p>
                <p className="text-sm text-muted-foreground">
                  Contact: <a href="mailto:chim@chimwopara.com" className="hover:underline">chim@chimwopara.com</a>
                </p>
              </div>

              <div className="space-y-16">
                {KEYWORDS.map((keyword) => (
                  <section
                    key={keyword.id}
                    id={keyword.id}
                    className="scroll-mt-16"
                  >
                    <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-4">
                      <h2 className="text-3xl font-bold mb-2 text-left">*{keyword.name}*</h2>
                      <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-left">{keyword.desc}</p>
                        <code className="text-sm bg-muted px-2 py-1 rounded ml-4">
                          {keyword.shortcut}
                        </code>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      {Array.isArray(getExampleForKeyword(keyword.id)) ? (
                        getExampleForKeyword(keyword.id).map((example: string, index: number) => (
                          <div key={index} className="bg-muted p-4 rounded-lg">
                            <p className="font-mono text-sm text-left">{example}</p>
                          </div>
                        ))
                      ) : (
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="font-mono text-sm text-left">{getExampleForKeyword(keyword.id)}</p>
                        </div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </motion.div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}