

// --- Secure Backend API Service ---
// This service now contains a direct call to the Google GenAI service for intel generation.
// This is secure in this environment, as the API key is handled by the platform.

import { GoogleGenAI, Type } from "@google/genai";
import { MissionCategory, MissionSubcategory, SongClueMatrix } from "../types";
import * as db from './database';

/**
 * Generates the entire deep clue matrix for a song by making a live call to the Gemini API.
 * @param title The title of the song to generate clues for.
 * @param duration The duration of the song in seconds.
 * @returns A promise that resolves with the AI-generated clue matrix.
 */
export async function generateClueMatrixForSong(title: string, duration: number): Promise<{ clueMatrix: SongClueMatrix }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const timeSegments = ['0:00-0:59', '1:00-1:59', '2:00-2:59', '3:00-3:59', '4:00+'];
    const numSegments = Math.min(5, Math.floor(duration / 60) + 1);

    // Define the schema for a single clue/mission
    const clueMissionSchema = {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING, description: "A unique, creative, and compelling mission objective (15-30 words). Must be a clear call to action or a provocative question." },
            points: { type: Type.INTEGER, description: "Assign Peace Points based on difficulty: KNOW=10, SHARE=20, ACTION=50, ALTERNATIVE=30." }
        },
        required: ["description", "points"]
    };

    // Define the schema for the entire matrix
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            [MissionCategory.KNOW]: {
                type: Type.OBJECT,
                properties: Object.fromEntries(Object.values(MissionSubcategory).map(sub => [sub, { type: Type.ARRAY, items: clueMissionSchema }]))
            },
            [MissionCategory.ACTION]: {
                type: Type.OBJECT,
                properties: Object.fromEntries(Object.values(MissionSubcategory).map(sub => [sub, { type: Type.ARRAY, items: clueMissionSchema }]))
            },
            [MissionCategory.SHARE]: {
                type: Type.OBJECT,
                properties: Object.fromEntries(Object.values(MissionSubcategory).map(sub => [sub, { type: Type.ARRAY, items: clueMissionSchema }]))
            },
            [MissionCategory.ALTERNATIVE]: {
                type: Type.OBJECT,
                properties: Object.fromEntries(Object.values(MissionSubcategory).map(sub => [sub, { type: Type.ARRAY, items: clueMissionSchema }]))
            }
        }
    };

    const prompt = `You are the Mission Intel Generator for a cyberpunk ARG, "Raybot Spider Resistance".
Your task is to generate a complete mission matrix for a song titled "${title}".
You must generate a unique mission for EVERY combination of category, subcategory, and time segment.

RULES:
1.  **Time Segments:** Generate missions for the first ${numSegments} one-minute time segments of the song.
2.  **Categories:** For each time segment, create a mission for all 4 main categories: ${Object.values(MissionCategory).join(', ')}.
3.  **Subcategories:** For each main category, create a mission for all 5 subcategories: ${Object.values(MissionSubcategory).join(', ')}.
4.  **Points:** Assign points STRICTLY as follows: KNOW=10, SHARE=20, ACTION=50, ALTERNATIVE=30.
5.  **Content:** Missions must be creative, thematic, and directly related to their subcategory. "ACTION" missions must involve a real-world or online task. "KNOW" missions should be intriguing questions. "SHARE" missions involve social media. "ALTERNATIVE" missions are eccentric and artistic.
6.  **Format:** Return a single JSON object matching the provided schema. Each subcategory array must have exactly ${numSegments} items, corresponding to each time segment.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
        },
    });
    
    const jsonString = response.text;
    const clueMatrix = JSON.parse(jsonString) as SongClueMatrix;

    return { clueMatrix };
}