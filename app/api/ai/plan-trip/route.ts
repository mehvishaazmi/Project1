import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo-mode";

function createDemoPlan(
  destination: string,
  days: number,
  budget: string,
) {
  const dayCount = Math.max(1, Number(days) || 1);
  const totalBudget = Number(budget) || 0;

  return {
    itinerary: Array.from({ length: dayCount }, (_, index) => ({
      day: index + 1,
      title: `${destination} highlights`,
      activities: [
        `Explore a popular neighborhood in ${destination}`,
        `Visit a local landmark or viewpoint`,
        `Try a well-rated local food spot`,
      ],
    })),
    budget: {
      hotel: `₹${Math.round(totalBudget * 0.4).toLocaleString("en-IN")}`,
      food: `₹${Math.round(totalBudget * 0.25).toLocaleString("en-IN")}`,
      transport: `₹${Math.round(totalBudget * 0.2).toLocaleString("en-IN")}`,
      activities: `₹${Math.round(totalBudget * 0.15).toLocaleString("en-IN")}`,
    },
    places: [
      `${destination} city center`,
      `${destination} old town`,
      `${destination} viewpoint`,
      `${destination} market`,
      `${destination} museum`,
    ],
    tips: [
      "Book stays near public transport.",
      "Keep a small daily cash buffer.",
      "Start sightseeing early to avoid crowds.",
      "Save offline maps before leaving.",
    ],
  };
}

export async function POST(req: Request) {
  try {

    const { destination, days, budget } =
      await req.json();

    if (!destination || !days || !budget) {
      return NextResponse.json(
        {
          error:
            "Missing destination, days or budget",
        },
        { status: 400 }
      );
    }

    if (isDemoMode || !process.env.GROQ_API_KEY) {
      return NextResponse.json({
        plan: createDemoPlan(destination, Number(days), budget),
      });
    }

    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      const { ratelimit } = await import("@/lib/ratelimit");
      const ip =
        req.headers.get("x-forwarded-for") ??
        "anonymous";

      const { success } = await ratelimit.limit(ip);

      if (!success) {
        return NextResponse.json(
          {
            error: "Too many requests. Please try again later.",
          },
          { status: 429 }
        );
      }
    }

    const { default: Groq } = await import("groq-sdk");
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const prompt = `You are a travel planning assistant. Create a detailed ${days}-day trip plan for ${destination} with a total budget of ₹${budget}.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": ["activity 1", "activity 2", "activity 3"]
    }
  ],
  "budget": {
    "hotel": "₹XXXX",
    "food": "₹XXXX",
    "transport": "₹XXXX",
    "activities": "₹XXXX"
  },
  "places": ["place 1", "place 2", "place 3", "place 4", "place 5"],
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4"]
}

Rules:
- Budget values must add up to roughly ₹${budget}
- Activities should be specific to ${destination}
- Places should be real attractions in ${destination}
- Tips should be practical and specific to ${destination}
- Return ONLY the JSON, nothing else`;

    const completion =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

    const text =
      completion.choices[0]?.message?.content ??
      "";

    const cleaned = text
      .replace(/```json|```/g, "")
      .trim();

    let plan;

    try {
      plan = JSON.parse(cleaned);
    } catch {
      console.error(
        "Groq JSON parse failed:",
        cleaned
      );

      return NextResponse.json(
        {
          error:
            "AI returned invalid JSON. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ plan });

  } catch (err: any) {
    console.error("Groq API error:", err);

    return NextResponse.json(
      {
        error:
          err?.message ?? "AI request failed",
      },
      { status: 500 }
    );
  }
}
