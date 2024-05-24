import OpenAI from "openai";
import * as dotenv from "dotenv";
import { Hamming, TracingMode } from "@hamming/hamming-sdk";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const hamming = new Hamming({
  apiKey: process.env.HAMMING_API_KEY ?? "",
});

hamming.monitoring.start();
const trace = hamming.tracing;

export async function POST(req: Request) {
  const { message } = await req.json();

  const response = await hamming.monitoring.runItem(async () => {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message },
      ],
    });

    const output = completion.choices[0].message.content;

    trace.logRetrieval({
      query: message,
      results: ["result 1", "result 2", "result 3"],
      metadata: {
        engine: "Pinecone",
      },
    });

    trace.logGeneration({
      input: message,
      output: output ?? "",
      metadata: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        stream: false,
        error: false,
      },
    });

    return output;
  });

  return Response.json({ response });
}
