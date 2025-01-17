import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
    });

    const message = completion.choices[0].message.content;
    return NextResponse.json({ message });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json({ message: 'Error generating response' }, { status: 500 });
  }
}