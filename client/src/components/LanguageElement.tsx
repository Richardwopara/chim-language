import { motion } from "framer-motion";
import CodeBlock from "./CodeBlock";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface ElementProps {
  element: {
    name: string;
    description: string;
    example: string;
  };
}

export default function LanguageElement({ element }: ElementProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card id={element.name} className="border-accent/20">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-primary">
            {element.name}
          </h2>
          <p className="text-muted-foreground">
            {element.description}
          </p>
        </CardHeader>
        <CardContent>
          <CodeBlock code={element.example} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
