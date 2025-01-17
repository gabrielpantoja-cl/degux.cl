'use client';

import { useState } from 'react';

// Definir interface para los mensajes
interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages([...messages, userMessage]);

    setInput('');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: [...messages, userMessage] }),
    });

    if (!response.ok) {
      console.error('Error al generar respuesta:', await response.text());
      return;
    }

    const data = await response.json();
    const botMessage: Message = { role: 'bot', content: data.message };
    setMessages([...messages, userMessage, botMessage]);
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-lg p-4">
      <div className="h-64 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`my-2 p-2 rounded ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 border rounded-l-lg"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white p-2 rounded-r-lg"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}