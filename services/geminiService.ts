
// This is a mock service. In a real application, you would import and use @google/genai.
// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCopilotResponse = async (prompt: string): Promise<string> => {
  console.log("Sending prompt to mock Gemini API:", prompt);

  // Mock API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (prompt.toLowerCase().includes("increase sales")) {
    return "To increase sales, consider these strategies: 1) Offer promotions or discounts to attract new customers. 2) Implement a loyalty program to retain existing customers. 3) Use social media marketing to reach a wider audience. We can analyze your Firestore data to give more specific advice.";
  } else if (prompt.toLowerCase().includes("bakery")) {
    return "For a bakery, top marketing strategies include: 1) High-quality photos on Instagram and Pinterest. 2) Collaborating with local coffee shops. 3) Offering daily specials and promoting them on a chalkboard sign or social media. 4) Running a 'Baker's Dozen' loyalty card.";
  } else {
    return "I'm UdyamX Co-Pilot, your digital mentor. Ask me anything about growing your business, marketing strategies, or financial planning. For example, 'How can I improve my inventory management?'";
  }

  /*
  // Real implementation example:
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an AI business mentor for MSMEs. A user asked: "${prompt}". Provide a concise, actionable answer.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I'm having trouble connecting to the AI service right now. Please check your connection and try again.";
  }
  */
};
