import { Hamming, ScoreType } from "@hamming/hamming-sdk";
import { OpenAI } from "openai";

const openai = new OpenAI();

const hamming = new Hamming({
  apiKey: process.env.HAMMING_API_KEY ?? "",
});

const trace = hamming.tracing;

export async function POST() {
  await hamming.experiments.run(
    {
      dataset: process.env.HAMMING_DATASET_ID ?? "",
      name: "test-endpoint",
      scoring: [ScoreType.AccuracyAI, ScoreType.Refusal],
    },

    async ({ referenceQuestion }) => {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: referenceQuestion },
        ],
      });
      const answer = completion.choices[0].message.content;

      trace.logRetrieval({
        query: referenceQuestion,
        results: ["result 1", "result 2", "result 3"],
        metadata: {
          engine: "Pinecone",
        },
      });

      trace.logGeneration({
        input: referenceQuestion,
        output: answer ?? "",
        metadata: {
          model: "gpt-3.5-turbo",
        },
      });
      return { answer };
    }
  );

  return Response.json({ ok: true });
}
