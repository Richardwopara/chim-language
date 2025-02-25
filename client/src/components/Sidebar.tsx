import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LanguageElement } from "@shared/schema";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  elements: LanguageElement[];
}

export default function Sidebar({ isOpen, onClose, elements }: SidebarProps) {
  const categories = [...new Set(elements.map(el => el.category))];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed top-16 bottom-0 left-0 w-[280px] bg-sidebar border-r z-50 
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <ScrollArea className="h-full py-6">
          {categories.map((category) => (
            <div key={category} className="px-4 mb-6">
              <h3 className="text-sm font-semibold text-sidebar-foreground mb-2">
                {category}
              </h3>
              <ul className="space-y-1">
                {elements
                  .filter(el => el.category === category)
                  .map(element => (
                    <li key={element.name}>
                      <a
                        href={`#${element.name}`}
                        className="block px-2 py-1.5 text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md hover:bg-sidebar-accent/50 transition-colors"
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                      >
                        {element.name}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </ScrollArea>
      </motion.aside>
    </>
  );
}