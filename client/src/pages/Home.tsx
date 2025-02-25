import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LanguageElement from "@/components/LanguageElement";
import type { LanguageElement as LanguageElementType } from "@shared/schema";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: elements = [], isLoading, error } = useQuery<LanguageElementType[]>({
    queryKey: ['/api/language-elements'],
  });

  const filteredElements = elements.filter((element: LanguageElementType) => 
    element.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    element.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch onSearch={setSearchQuery} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} elements={elements} />

        <motion.main 
          className="flex-1 p-6 lg:pl-[300px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto space-y-12 py-16">
            <div className="text-center px-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Chim Reference Prompt Language
              </h1>

              <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
                Start building your chim prompts using the elements below or chat page (tab + space). Master the elements below to create sophisticated prompt patterns.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4 px-4">
                <div className="h-32 bg-muted/50 animate-pulse rounded-lg"></div>
                <div className="h-32 bg-muted/50 animate-pulse rounded-lg"></div>
                <div className="h-32 bg-muted/50 animate-pulse rounded-lg"></div>
              </div>
            ) : error ? (
              <div className="text-destructive text-center px-4">
                Error loading language elements. Please try again later.
              </div>
            ) : (
              <div className="space-y-8 px-4">
                {filteredElements.map((element: LanguageElementType) => (
                  <LanguageElement key={element.name} element={element} />
                ))}
              </div>
            )}
          </div>
        </motion.main>
      </div>
    </div>
  );
}