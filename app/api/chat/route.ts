// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Verificar que la API key existe, agregada en .env.local y en vercel project
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

// Configuración de OpenAI con timeout
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 10000, // 10 segundos
});

// Interfaz para los mensajes
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Interfaz para las FAQs
interface FAQs {
  [key: string]: string;
}

// Preguntas frecuentes (FAQs) y sus respuestas
const faqs: FAQs = {
  "¿De qué se trata referenciales.cl?": "Referenciales.cl es una base de datos colaborativa para peritos tasadores.",
  "¿Cómo puedo registrarme?": "Al iniciar sesión con Google te registras automáticamente en nuestra aplicación.",
  "¿Cuáles son los servicios que ofrecen?": "Ofrecemos acceso a una base de datos colaborativa, incluyendo consultas personalizadas, vista por mapa y más.",
  "¿Cuál es el correo o teléfono de contacto?": "El canal oficial de comunicación es el WhatsApp: +56 9 3176 9472."
};

// Prompt inicial para orientar al asistente
const promptInitial = `
Eres un asistente virtual para referenciales.cl. Responde a las preguntas de los usuarios de manera clara y concisa, y limita tus respuestas a temas relacionados con las tasaciones inmobiliarias. Aquí hay algunas preguntas frecuentes y sus respuestas:
${Object.entries(faqs).map(([question, answer]) => `- "${question}": "${answer}"`).join('\n')}
`;

export async function POST(req: NextRequest) {
  try {
    // Validar el cuerpo de la solicitud
    const body = await req.json();
    
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const messages: ChatMessage[] = body.messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: String(msg.content || ''),
    }));

    // Validar que hay al menos un mensaje
    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Check if the last user message matches any FAQ
    const lastMessage = messages[messages.length - 1].content;
    if (faqs.hasOwnProperty(lastMessage)) {
      return NextResponse.json({ message: faqs[lastMessage] });
    }

    // Crear el prompt completo con el prompt inicial y los mensajes del usuario
    const prompt = `${promptInitial}\n${messages.map((msg: any) => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`).join('\n')}\nAsistente:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const message = completion.choices[0]?.message?.content;

    if (!message) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json({ message });

  } catch (error) {
    console.error('OpenAI API Error:', error);

    // Manejar diferentes tipos de errores
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: 'OpenAI API error', details: error.message },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}