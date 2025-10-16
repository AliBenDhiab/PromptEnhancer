import { GoogleGenAI, Type } from "@google/genai";
import { PromptOptimizationResult, PdfSummaryResult, SummaryLength } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const optimizePrompt = async (prompt: string): Promise<PromptOptimizationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `بصفتك خبيرًا في هندسة الأوامر (Prompt Engineering)، قم بتحليل الأمر التالي من المستخدم واقترح ثلاث نسخ محسنة: نسخة قصيرة ومباشرة، ونسخة معيارية ومتوازنة، ونسخة موسعة ومفصلة للحصول على أفضل النتائج من نماذج الذكاء الاصطناعي. الأمر هو: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            short: { type: Type.STRING, description: 'نسخة قصيرة ومباشرة من الأمر.' },
            standard: { type: Type.STRING, description: 'نسخة معيارية ومتوازنة من الأمر.' },
            expanded: { type: Type.STRING, description: 'نسخة موسعة ومفصلة من الأمر.' },
          },
          required: ["short", "standard", "expanded"],
        },
        temperature: 0.5,
      },
    });

    const jsonString = response.text;
    return JSON.parse(jsonString) as PromptOptimizationResult;
  } catch (error) {
    console.error("Error optimizing prompt:", error);
    throw new Error("فشل في تحسين الأمر. يرجى المحاولة مرة أخرى.");
  }
};

const CHUNK_SIZE = 14000; // Character limit, slightly under token limits for safety

export const summarizePdfText = async (
  text: string,
  summaryLength: SummaryLength,
  onProgress: (message: string) => void,
  onStream: (chunk: string) => void
): Promise<PdfSummaryResult> => {
  try {
    // Step 1: Chunk the text
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      chunks.push(text.substring(i, i + CHUNK_SIZE));
    }
    onProgress(`تقسيم النص إلى ${chunks.length} أجزاء...`);

    // Step 2: Summarize each chunk
    const chunkSummaries = await Promise.all(
      chunks.map(async (chunk, index) => {
        onProgress(`تلخيص الجزء ${index + 1} من ${chunks.length}...`);
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `لخص النص التالي مع التركيز على المعلومات الأساسية: "${chunk}"`,
          config: { temperature: 0.2 },
        });
        return response.text;
      })
    );
    onProgress("دمج التلخيصات النهائية...");
    const combinedSummaries = chunkSummaries.join("\n---\n");

    // Step 3: Stream the final text summary
    const summaryPrompt = `بناءً على الملخصات الجزئية التالية، قم بإنشاء ملخص نصي شامل. يجب أن يكون طول الملخص ${summaryLength}. الملخصات الجزئية هي: "${combinedSummaries}"`;
    const summaryStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: summaryPrompt,
      config: { temperature: 0.2 },
    });
    
    let fullSummaryText = "";
    onProgress("توليد الملخص النهائي...");
    for await (const chunk of summaryStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullSummaryText += chunkText;
        onStream(fullSummaryText);
      }
    }

    // Step 4: Generate structured data from the final summary
    onProgress("استخراج النقاط الرئيسية والبيانات المنظمة...");
    const structuredDataResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `بناءً على الملخص التالي، قم باستخراج: 1. قائمة بالنقاط الرئيسية (keyPoints). 2. كائن JSON منظم يحتوي على عنوان مقترح (title)، والمواضيع الرئيسية (main_topics)، وأي إجراءات مقترحة (action_items). الملخص هو: "${fullSummaryText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'قائمة بالنقاط الرئيسية المستخرجة من النص.'
            },
            structured: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'عنوان مقترح للمستند.' },
                main_topics: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'قائمة بالمواضيع الرئيسية التي يغطيها المستند.' },
                action_items: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'قائمة بالإجراءات أو الخطوات المقترحة المذكورة في المستند.' },
              },
              required: ["title", "main_topics", "action_items"]
            }
          },
          required: ["keyPoints", "structured"]
        },
        temperature: 0.1,
      },
    });

    const structuredData = JSON.parse(structuredDataResponse.text);

    return {
      summary: fullSummaryText,
      keyPoints: structuredData.keyPoints,
      structured: structuredData.structured,
    };

  } catch (error) {
    console.error("Error summarizing PDF text:", error);
    throw new Error("فشل في تلخيص الملف. قد يكون الملف كبيراً جداً أو غير مدعوم.");
  }
};
