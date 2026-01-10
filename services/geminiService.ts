
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

// Fix: Strictly follow initialization guidelines (named parameter, direct process.env.API_KEY)
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
    // Fix: Access .text property directly (not a method)
    return response.text || "Discipline is the bridge between goals and accomplishment.";
  } catch (error) {
    console.error("Error fetching motivation:", error);
    return "Discipline is the bridge between goals and accomplishment.";
  }
};

export const getWeeklyReview = async (state: AppState) => {
  try {
    const prompt = `Review my current progress and provide 3 actionable pieces of advice:
    - Income: $${state.incomeTotal}
    - Tasks Completed: ${state.tasks.filter(t => t.isCompleted).length}
    - Goals: ${JSON.stringify(state.goals.map(g => ({ title: g.title, progress: (g.currentValue / g.targetValue) * 100 + '%' })))}
    
    Provide the response in a structured, concise way focusing on discipline and consistency.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional business and growth coach. Provide concise, high-impact feedback. Focus on the 'Ihsan' (excellence) mindset.",
        temperature: 0.4,
      }
    });
    // Fix: Access .text property directly (not a method)
    return response.text || "Focus on your morning habits to win the day.";
  } catch (error) {
    console.error("Error fetching weekly review:", error);
    return "Focus on your morning habits to win the day.";
  }
};
