const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Models to try in order (each has separate rate limits)
const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

async function callGroq(systemPrompt, userPrompt) {
  for (const model of MODELS) {
    try {
      console.log(`🤖 Calling Groq (${model})...`);

      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1024,
          response_format: { type: 'json_object' },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const status = res.status;
        console.log(`⚠️ Groq ${model} returned ${status}`);

        if (status === 429) {
          console.log(`⏳ Rate limited on ${model}, trying next...`);
          continue;
        }
        throw new Error(err.error?.message || `Groq API error: ${status}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      console.log(`✅ Groq (${model}) responded successfully`);
      return content;
    } catch (error) {
      if (error.message?.includes('429')) continue;
      throw error;
    }
  }
  throw new Error('All models are rate-limited. Please wait a minute and try again.');
}

/**
 * Generate an inshort (bite-sized summary) for a topic
 */
export async function generateInshort(topicTitle, topicContent) {
  if (!GROQ_API_KEY) {
    throw new Error('Please set GROQ_API_KEY in .env.local');
  }

  const systemPrompt = `You are a learning assistant that creates concise, memorable revision summaries called "inshorts".
You MUST respond with valid JSON only, no extra text.

JSON format:
{
  "bullets": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "keyTakeaway": "The single most important thing to remember",
  "oneLiner": "A catchy one-liner that makes this topic memorable"
}

Rules:
- 3-5 concise, factual bullet points
- keyTakeaway = the #1 thing to remember
- oneLiner = witty or uses a mnemonic to make it stick
- Keep everything concise — this is for quick revision`;

  const userPrompt = `Create a revision inshort for:

**Topic:** ${topicTitle}

**Content:**
${topicContent}`;

  try {
    const text = await callGroq(systemPrompt, userPrompt);

    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const parsed = JSON.parse(cleanText);

    return {
      bullets: parsed.bullets || [],
      keyTakeaway: parsed.keyTakeaway || '',
      oneLiner: parsed.oneLiner || '',
    };
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error(error.message || 'Failed to generate inshort. Please try again.');
  }
}

/**
 * Generate quiz questions for a topic
 */
export async function generateQuiz(topicTitle, inshort) {
  if (!GROQ_API_KEY) {
    throw new Error('Please set GROQ_API_KEY in .env.local');
  }

  const systemPrompt = `Create revision quiz questions. Respond with valid JSON only — an array of question objects.

Format:
[
  {
    "question": "Question text?",
    "options": ["A) option", "B) option", "C) option", "D) option"],
    "correctIndex": 0,
    "explanation": "Why this is correct"
  }
]

Rules: exactly 3 questions, 4 options each, mix of easy/medium/hard.`;

  const userPrompt = `Create quiz for "${topicTitle}":
Key points: ${inshort.bullets?.join('; ')}
Takeaway: ${inshort.keyTakeaway}`;

  try {
    const text = await callGroq(systemPrompt, userPrompt);

    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw new Error('Failed to generate quiz. Please try again.');
  }
}
