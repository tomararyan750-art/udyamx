import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCopilotResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an AI business mentor for MSMEs (Micro, Small, and Medium Enterprises) in India. A user asked: "${prompt}". Provide a concise, actionable, and encouraging answer. Keep it simple and easy to understand.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I'm having trouble connecting to the AI service right now. Please check your connection and try again.";
  }
};


export const parseItemsFromText = async (text: string): Promise<{ 
  add?: { description: string, quantity: number, price: number }[],
  remove?: { description: string }[],
  update?: { description: string, quantity: number }[],
}> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `As an invoice processing expert, analyze the following text to extract a list of actions to perform on an invoice. The actions can be adding new items, removing existing items, or updating the quantity of existing items. For each item being added, identify its description, quantity, and a price of 0. For items being removed, just identify the description. For items being updated, identify the description and the new quantity. The user might speak conversationally, possibly in Hindi or a mix of languages. Here is the text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            add: {
              type: Type.ARRAY,
              description: 'List of new items to add to the invoice.',
              items: {
                type: Type.OBJECT,
                properties: {
                  description: {
                    type: Type.STRING,
                    description: 'Name or description of the item.',
                  },
                  quantity: {
                    type: Type.NUMBER,
                    description: 'The quantity of the item.',
                  },
                  price: {
                    type: Type.NUMBER,
                    description: 'Default this to 0. The system will look it up.',
                  },
                },
                required: ['description', 'quantity', 'price'],
              },
            },
            remove: {
              type: Type.ARRAY,
              description: 'List of items to remove from the invoice by name.',
              items: {
                type: Type.OBJECT,
                properties: {
                  description: {
                    type: Type.STRING,
                    description: 'Name or description of the item to remove.',
                  }
                },
                required: ['description'],
              }
            },
            update: {
              type: Type.ARRAY,
              description: 'List of items to update the quantity of.',
              items: {
                type: Type.OBJECT,
                properties: {
                  description: {
                    type: Type.STRING,
                    description: 'Name or description of the item to update.',
                  },
                  quantity: {
                    type: Type.NUMBER,
                    description: 'The new quantity for the item.',
                  }
                },
                required: ['description', 'quantity'],
              }
            }
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API for parsing invoice items:", error);
    return {};
  }
};