
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, Task } from "../types";

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

export const analyzeDailyPerformance = async (tasks: Task[], focusMinutes: number, sleepHours: number, phoneHours: number) => {
  try {
    const completed = tasks.filter(t => t.isCompleted).length;
    const total = tasks.length;
    const completionRate = Math.round((completed / total) * 100);
    
    const prompt = `Perform an objective audit of today's execution:
    - Task Completion: ${completed} out of ${total} tasks finished (${completionRate}%).
    - Deep Work (Focus Minutes): ${focusMinutes} minutes.
    - Recovery (Sleep): ${sleepHours} hours.
    - Digital Leakage (Phone Usage): ${phoneHours} hours.
    - Protocol Details: ${tasks.map(t => `${t.title}: ${t.isCompleted ? 'EXECUTED' : 'FAILED'}`).join(', ')}
    
    SCORING RULES:
    1. Score is 0-100.
    2. Weight: 60% based on completion rate, 20% based on Deep Work, 10% based on Sleep (Target 7-8H), 10% based on Phone Usage (Target < 3H).
    3. High Phone Usage (> 5H) should result in a penalty to the score.
    4. Poor sleep (< 5H) should result in a warning about long-term velocity sustainability.
    5. If completion rate is 100%, score must be at least 90 even if metrics are sub-optimal.
    
    Provide the verdict: 'Diligent', 'Lazy', or 'Neutral'.
    Provide a one-sentence critique that is sharp, professional, and encourages a better tomorrow. Mention specific metric failures if they occurred (e.g. phone or sleep).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a Chief Performance Officer and Mentor. You analyze data with mathematical precision. You are stoic, fair, and results-oriented. You prioritize high-output execution but recognize that biology (sleep) and distraction (phone) are variables in long-term ROI.",
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, description: "Must be 'Diligent', 'Lazy', or 'Neutral'" },
            reflection: { type: Type.STRING, description: "One sentence honest critique" },
            score: { type: Type.NUMBER, description: "Calculated score 0-100" }
          },
          required: ["verdict", "reflection", "score"]
        }
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    // Safety check to ensure the score isn't hallucinated as too low
    if (completionRate >= 80 && result.score < 70) result.score = 85; 
    if (completionRate >= 100 && result.verdict === 'Lazy') result.verdict = 'Diligent';
    
    return result;
  } catch (error) {
    return { verdict: 'Neutral', reflection: "System synchronization error. Re-evaluate manually.", score: 50 };
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
