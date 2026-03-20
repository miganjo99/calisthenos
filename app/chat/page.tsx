// @ts-nocheck
'use client';

import { useChat } from '@ai-sdk/react';

export default function ChatBotPage() {

  const hookData = useChat({
    api: '/api/chat',
    maxSteps: 5,
    onError: (err) => console.error("🚨 ERROR:", err),
  });

  // 👇 Esto nos dice exactamente qué devuelve tu versión del hook
  console.log("🔍 useChat devuelve:", Object.keys(hookData));

  const { messages, input, handleInputChange, handleSubmit, status, error } = hookData;

  const isThinking = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 bg-gray-50 text-gray-900">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-start">
          <div className="bg-blue-100 text-blue-900 p-3 rounded-2xl rounded-tl-none max-w-[80%]">
            ¡Hola! Soy el asistente virtual de Calisthenos 💪. ¿En qué puedo ayudarte?
          </div>
        </div>

        {messages?.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[80%] ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 p-3 rounded-2xl rounded-tl-none text-sm animate-pulse">
              Procesando...
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            Error: {error.message}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input ?? ''}
          onChange={handleInputChange}
          placeholder="Escribe un mensaje..."
          disabled={isThinking}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
           disabled={isThinking || !(input ?? '').trim()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}