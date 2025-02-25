import { languageElements, savedCodes, savedPrompts, type LanguageElement, type InsertLanguageElement, type SavedCode, type InsertSavedCode, type SavedPrompt, type InsertSavedPrompt } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  getAllLanguageElements(): Promise<LanguageElement[]>;
  getLanguageElementByName(name: string): Promise<LanguageElement | undefined>;
  createLanguageElement(element: InsertLanguageElement): Promise<LanguageElement>;
  bulkCreateLanguageElements(elements: InsertLanguageElement[]): Promise<LanguageElement[]>;

  // Saved codes methods
  getAllSavedCodes(): Promise<SavedCode[]>;
  getSavedCodeById(id: number): Promise<SavedCode | undefined>;
  getSavedCodeByContextId(contextId: string): Promise<SavedCode | undefined>;
  getSavedCodeByChimContextId(chimContextId: string): Promise<SavedCode | undefined>;
  createSavedCode(code: InsertSavedCode): Promise<SavedCode>;
  updateSavedCodeVisibility(id: number, isPublic: boolean): Promise<SavedCode>;
  deleteSavedCode(id: number): Promise<void>;

  // Saved prompts methods
  getAllSavedPrompts(): Promise<SavedPrompt[]>;
  getSavedPromptById(id: number): Promise<SavedPrompt | undefined>;
  createSavedPrompt(prompt: InsertSavedPrompt): Promise<SavedPrompt>;
  updateSavedPromptVisibility(id: number, isPublic: boolean): Promise<SavedPrompt>;
  deleteSavedPrompt(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAllLanguageElements(): Promise<LanguageElement[]> {
    return await db.select().from(languageElements);
  }

  async getLanguageElementByName(name: string): Promise<LanguageElement | undefined> {
    const [element] = await db
      .select()
      .from(languageElements)
      .where(eq(languageElements.name, name));
    return element;
  }

  async createLanguageElement(element: InsertLanguageElement): Promise<LanguageElement> {
    const [createdElement] = await db
      .insert(languageElements)
      .values(element)
      .returning();
    return createdElement;
  }

  async bulkCreateLanguageElements(elements: InsertLanguageElement[]): Promise<LanguageElement[]> {
    return await db
      .insert(languageElements)
      .values(elements)
      .returning();
  }

  async getAllSavedCodes(): Promise<SavedCode[]> {
    return await db
      .select()
      .from(savedCodes)
      .orderBy(savedCodes.id);
  }

  async getSavedCodeById(id: number): Promise<SavedCode | undefined> {
    const [code] = await db
      .select()
      .from(savedCodes)
      .where(eq(savedCodes.id, id));
    return code;
  }

  async getSavedCodeByContextId(contextId: string): Promise<SavedCode | undefined> {
    const [code] = await db
      .select()
      .from(savedCodes)
      .where(eq(savedCodes.contextId, contextId));
    return code;
  }

  async getSavedCodeByChimContextId(chimContextId: string): Promise<SavedCode | undefined> {
    const [code] = await db
      .select()
      .from(savedCodes)
      .where(eq(savedCodes.chimContextId, chimContextId));
    return code;
  }

  async createSavedCode(code: InsertSavedCode): Promise<SavedCode> {
    const contextId = (await db.select().from(savedCodes).execute()).length + 1;
    const chimContextId = code.isPublic ? `A${contextId}` : null;

    const [createdCode] = await db
      .insert(savedCodes)
      .values({
        ...code,
        contextId: `context:${contextId}`,
        chimContextId: chimContextId ? `chimcontext:${chimContextId}` : null,
      })
      .returning();
    return createdCode;
  }

  async updateSavedCodeVisibility(id: number, isPublic: boolean): Promise<SavedCode> {
    const [code] = await db
      .select()
      .from(savedCodes)
      .where(eq(savedCodes.id, id));

    if (!code) {
      throw new Error("Code not found");
    }

    // Extract the numeric part from contextId for the public ID
    const contextNumber = code.contextId.split(':')[1];
    const chimContextId = isPublic ? `chimcontext:A${contextNumber}` : null;

    const [updatedCode] = await db
      .update(savedCodes)
      .set({ 
        isPublic,
        chimContextId
      })
      .where(eq(savedCodes.id, id))
      .returning();

    return updatedCode;
  }

  async deleteSavedCode(id: number): Promise<void> {
    // First get all codes ordered by ID
    const codes = await this.getAllSavedCodes();
    const deletedCodeIndex = codes.findIndex(code => code.id === id);

    if (deletedCodeIndex === -1) {
      throw new Error("Code not found");
    }

    // Delete the code
    await db.delete(savedCodes).where(eq(savedCodes.id, id));

    // Update the contextIds and chimContextIds for all codes after the deleted one
    for (let i = deletedCodeIndex + 1; i < codes.length; i++) {
      const code = codes[i];
      const newIndex = i;
      await db
        .update(savedCodes)
        .set({
          contextId: `context:${newIndex}`,
          chimContextId: code.isPublic ? `chimcontext:A${newIndex}` : null
        })
        .where(eq(savedCodes.id, code.id));
    }
  }

  async getAllSavedPrompts(): Promise<SavedPrompt[]> {
    return await db
      .select()
      .from(savedPrompts)
      .orderBy(savedPrompts.id);
  }

  async getSavedPromptById(id: number): Promise<SavedPrompt | undefined> {
    const [prompt] = await db
      .select()
      .from(savedPrompts)
      .where(eq(savedPrompts.id, id));
    return prompt;
  }

  async createSavedPrompt(prompt: InsertSavedPrompt): Promise<SavedPrompt> {
    const promptNumber = (await db.select().from(savedPrompts).execute()).length + 1;
    const chimPromptId = prompt.isPublic ? `A${promptNumber}` : null;

    const [createdPrompt] = await db
      .insert(savedPrompts)
      .values({
        ...prompt,
        promptId: `prompt:${promptNumber}`,
        chimPromptId: chimPromptId ? `chimprompt:${chimPromptId}` : null,
      })
      .returning();
    return createdPrompt;
  }

  async updateSavedPromptVisibility(id: number, isPublic: boolean): Promise<SavedPrompt> {
    const [prompt] = await db
      .select()
      .from(savedPrompts)
      .where(eq(savedPrompts.id, id));

    if (!prompt) {
      throw new Error("Prompt not found");
    }

    const promptNumber = prompt.promptId.split(':')[1];
    const chimPromptId = isPublic ? `chimprompt:A${promptNumber}` : null;

    const [updatedPrompt] = await db
      .update(savedPrompts)
      .set({ 
        isPublic,
        chimPromptId
      })
      .where(eq(savedPrompts.id, id))
      .returning();

    return updatedPrompt;
  }

  async deleteSavedPrompt(id: number): Promise<void> {
    const prompts = await this.getAllSavedPrompts();
    const deletedPromptIndex = prompts.findIndex(prompt => prompt.id === id);

    if (deletedPromptIndex === -1) {
      throw new Error("Prompt not found");
    }

    await db.delete(savedPrompts).where(eq(savedPrompts.id, id));

    for (let i = deletedPromptIndex + 1; i < prompts.length; i++) {
      const prompt = prompts[i];
      const newIndex = i;
      await db
        .update(savedPrompts)
        .set({
          promptId: `prompt:${newIndex}`,
          chimPromptId: prompt.isPublic ? `chimprompt:A${newIndex}` : null
        })
        .where(eq(savedPrompts.id, prompt.id));
    }
  }
}

export const storage = new DatabaseStorage();