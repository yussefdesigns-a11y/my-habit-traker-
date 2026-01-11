
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyMotivation = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a short, powerful, and respectful motivational quote for a young Muslim entrepreneur focused on discipline, Fajr prayer, fitness, and building a business. Keep it minimal and profound. No emojis.",
      config: {
        systemInstruction: "You are a wise, stoic, and supportive mentor with an Islamic-friendly perspective. Your tone is calm and encouraging.",
        temperature: 0.7,
      }
    });
    return response.text || "Discipline is the bridge between goals and accomplishment.";
  } catch (error) {
    return "Discipline is the bridge between goals and accomplishment.";
  }
};

export const getStrategicPerformanceReport = async (state: AppState) => {
  try {
    const prompt = `Analyze my recent execution data and provide a high-level strategic audit:
    - Focus Minutes (Total): ${state.focusMinutesToday} today
    - Sessions History: ${JSON.stringify(state.sessionHistory.slice(-10))}
    - Tasks Efficiency: ${state.tasks.filter(t => t.isCompleted).length} completed vs ${state.tasks.filter(t => t.isSkipped).length} skipped.
    
    Format:
    1. CURRENT VELOCITY (One sentence)
    2. THE BOTTLENECK (One tactical observation)
    3. STRATEGIC ADJUSTMENT (One high-level pivot)
    
    Tone: Extremely professional, data-driven, entrepreneurial, stoic.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a Chief Performance Officer. Your job is to analyze data and give blunt, actionable, and elite-level feedback to a high-achieving founder.",
        temperature: 0.4,
      }
    });
    return response.text || "Continue executing with precision. Data suggests focus is currently stable.";
  } catch (error) {
    return "Focus on your morning habits to win the day.";
  }
};
