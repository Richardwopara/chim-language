import { apiRequest } from "./queryClient";

interface ConversionResult {
  detectedInfo: {
    platform: string | null;
    device: string | null;
    element: string | null;
    reference: string | null;
    background: string | null;
  };
  prompt: string;
  missingFields: string[];
}

export async function convertToChimPrompt(naturalLanguage: string): Promise<ConversionResult> {
  // Simple pattern matching for key elements
  const platformMatch = naturalLanguage.match(/\b(javascript|react|swift|flutter|python)\b/i);
  const elementMatch = naturalLanguage.match(/(?:create|make|build|add)\s+(?:an?\s+)?([^.,\s]+(?:\s+[^.,\s]+)*)/i);
  const referenceMatch = naturalLanguage.match(/(?:like|similar\s+to|from)\s+([^.,\s]+)/i);
  const colorMatch = naturalLanguage.match(/(?:background|bg|color):\s*([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/i);

  let platform = platformMatch ? platformMatch[1].toLowerCase() : null;
  let device = null;

  // Infer device from platform
  if (platform === 'swift') {
    device = 'iphone';
  } else if (platform === 'javascript' || platform === 'react') {
    device = 'web';
  }

  const detectedInfo = {
    platform,
    device,
    element: elementMatch ? elementMatch[1].trim() : null,
    reference: referenceMatch ? referenceMatch[1].trim() : null,
    background: colorMatch ? colorMatch[1] : null
  };

  // Build the prompt
  let promptParts = [];
  const missingFields = [];

  if (!platform) missingFields.push('platform');
  else promptParts.push(`*in* ${platform}`);

  if (!device) missingFields.push('device');
  else promptParts.push(`*for* ${device}`);

  if (!detectedInfo.element) missingFields.push('element');
  else promptParts.push(`*create* ${detectedInfo.element}`);

  if (detectedInfo.reference) {
    promptParts.push(`*from* ${detectedInfo.reference}`);
  }

  if (detectedInfo.background) {
    promptParts.push(`*background* ${detectedInfo.background}`);
  }

  return {
    detectedInfo,
    prompt: promptParts.join(' | '),
    missingFields
  };
}