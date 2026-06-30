// gemini.js 
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Parse free-form company text into structured company JSON
async function generateCompanyFromText(freeText, allowedCategoryCodes = [], allowedTags = []) {
  const systemPrompt = `
You are a JSON extractor. From the user's free-form company text, produce EXACTLY one JSON object named "company" with fields:
{
  "company": {
    "name": string,
    "homepage_url": string,
    "description": string,
    "category_code": string,
    "tag_list": string[]
  }
}
Rules:
- Return ONLY valid JSON (no explanations).
- If a field cannot be inferred, return empty string for strings and empty array for tag_list.
- If allowedCategoryCodes is non-empty, only use values from that list for category_code; otherwise allow any single string.
- For tag_list, prefer tags from allowedTags; if none apply return an empty array.
User text: ${freeText}
AllowedCategoryCodes: ${allowedCategoryCodes.join(', ')}
AllowedTags: ${allowedTags.join(', ')}
  `;

  const aiResponse = await ai.models.generateContent({
    model: MODEL,
    contents: systemPrompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        properties: {
          company: {
            type: "object",
            properties: {
              name: { type: "string" },
              homepage_url: { type: "string" },
              description: { type: "string" },
              category_code: { type: "string" },
              tag_list: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["name", "homepage_url", "description", "category_code", "tag_list"]
          }
        },
        required: ["company"]
      }
    }
  });

  // aiResponse.text should be valid JSON per schema
  return JSON.parse(aiResponse.text).company;
}

module.exports = { ai, MODEL, generateCompanyFromText };
