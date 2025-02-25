import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLanguageElementSchema, insertSavedCodeSchema, insertSavedPromptSchema } from "@shared/schema";
import { elements } from "../client/src/lib/data";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Language Elements Routes
  app.get("/api/language-elements", async (_req, res) => {
    try {
      const elements = await storage.getAllLanguageElements();
      console.log('Fetched elements:', elements.length);
      res.json(elements);
    } catch (error) {
      console.error('Error fetching language elements:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add new convert endpoint
  app.post("/api/convert-prompt", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        res.status(400).json({ message: "Text is required" });
        return;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert in converting natural language into ChimPrompt format. ChimPrompt is a specialized language for describing UI components and interface elements.

Key Formatting Rules:
1. Each element is wrapped in asterisks: *element*
2. Elements are separated by vertical bars with spaces: " | "
3. Always start with platform (*in*) and device (*for*) if known
4. For web technologies, automatically set device to "web"
5. For iOS/Swift, set device to "iphone"
6. For Android/Kotlin, set device to "android"

Core Elements (in order of importance):
1. *in* - specifies the programming language (e.g. *in* swift)
2. *for* - specifies the platform (e.g. *for* apple phone)
3. *create* - specifies the UI element to create
4. *from* - references styling from existing apps
5. *background* - specifies background color in hex
6. *makeit* - specifies if element is static or dynamic
7. *with* - adds attributes
8. *without* - removes attributes

Example Conversions:
"Create a search bar like Instagram's":
*in* javascript | *for* web | *create* search bar | *from* instagram

"Build an iOS chat bubble with animations":
*in* swift | *for* iphone | *create* chat bubble | *makeit* dynamic | *with* animations

"Add a dark mode toggle button":
*in* javascript | *for* web | *create* toggle button | *with* dark mode switching

Return a JSON object with this structure:
{
  "detectedInfo": {
    "platform": string or null,
    "device": string or null,
    "element": string or null,
    "reference": string or null,
    "background": string or null
  },
  "prompt": string,
  "missingFields": string[]
}`
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content);
      res.json(result);
    } catch (error: any) {
      console.error('Error converting prompt:', error);

      // Handle rate limit specifically
      if (error.status === 429) {
        res.status(429).json({ 
          message: "API rate limit exceeded. Please try again later.",
          isRateLimit: true
        });
        return;
      }

      res.status(500).json({ 
        message: "Failed to convert text",
        isRateLimit: error.status === 429
      });
    }
  });

  app.get("/api/language-elements/:name", async (req, res) => {
    try {
      const element = await storage.getLanguageElementByName(req.params.name);
      if (!element) {
        res.status(404).json({ message: "Language element not found" });
        return;
      }
      res.json(element);
    } catch (error) {
      console.error('Error fetching language element:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Saved Codes Routes
  app.get("/api/saved-codes", async (_req, res) => {
    try {
      const codes = await storage.getAllSavedCodes();
      res.json(codes);
    } catch (error) {
      console.error('Error fetching saved codes:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/saved-codes", async (req, res) => {
    try {
      const validatedData = insertSavedCodeSchema.parse(req.body);
      const code = await storage.createSavedCode(validatedData);
      res.status(201).json(code);
    } catch (error) {
      console.error('Error creating saved code:', error);
      res.status(400).json({ message: "Invalid saved code data" });
    }
  });

  app.delete("/api/saved-codes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSavedCode(id);
      res.json({ message: "Code deleted successfully" });
    } catch (error) {
      console.error('Error deleting code:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/saved-codes/:id/visibility", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isPublic } = req.body;

      if (typeof isPublic !== 'boolean') {
        res.status(400).json({ message: "isPublic must be a boolean" });
        return;
      }

      const code = await storage.updateSavedCodeVisibility(id, isPublic);
      res.json(code);
    } catch (error) {
      console.error('Error updating code visibility:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Saved Prompts Routes
  app.get("/api/saved-prompts", async (_req, res) => {
    try {
      const prompts = await storage.getAllSavedPrompts();
      res.json(prompts);
    } catch (error) {
      console.error('Error fetching saved prompts:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/saved-prompts", async (req, res) => {
    try {
      const validatedData = insertSavedPromptSchema.parse(req.body);
      const prompt = await storage.createSavedPrompt(validatedData);
      res.status(201).json(prompt);
    } catch (error) {
      console.error('Error creating saved prompt:', error);
      res.status(400).json({ message: "Invalid saved prompt data" });
    }
  });

  app.delete("/api/saved-prompts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSavedPrompt(id);
      res.json({ message: "Prompt deleted successfully" });
    } catch (error) {
      console.error('Error deleting prompt:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/saved-prompts/:id/visibility", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isPublic } = req.body;

      if (typeof isPublic !== 'boolean') {
        res.status(400).json({ message: "isPublic must be a boolean" });
        return;
      }

      const prompt = await storage.updateSavedPromptVisibility(id, isPublic);
      res.json(prompt);
    } catch (error) {
      console.error('Error updating prompt visibility:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/seed", async (_req, res) => {
    try {
      console.log('Starting database seeding...');
      const existingElements = await storage.getAllLanguageElements();
      console.log('Current elements in database:', existingElements.length);

      if (existingElements.length === 0) {
        console.log('Seeding database with elements:', elements.length);
        const createdElements = await storage.bulkCreateLanguageElements(elements);
        console.log('Successfully created elements:', createdElements.length);
        res.json({ message: "Database seeded successfully", count: createdElements.length });
      } else {
        console.log('Database already contains elements');
        res.json({ message: "Database already seeded", count: existingElements.length });
      }
    } catch (error: any) {
      console.error('Error seeding database:', error);
      res.status(500).json({ message: "Error seeding database", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}