import { Link } from "wouter";
import { Book } from "lucide-react";

interface HeaderProps {
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  onMenuClick?: () => void;
}

export default function Header({ showSearch, onSearch, onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur z-50">
      <div className="flex items-center justify-center h-full px-4 max-w-7xl mx-auto">
        <Link href="/">
          <span className="text-xl font-bold text-primary hover:text-primary/90 cursor-pointer">
            Chim Language
          </span>
        </Link>
      </div>
    </header>
  );
}