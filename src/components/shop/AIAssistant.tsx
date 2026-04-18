'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Sparkles, MinusCircle } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Bonjour ! Je suis votre assistant IA ShopCid. Comment puis-je vous aider aujourd\'hui ? Je peux vous aider à trouver des produits, répondre à vos questions sur les commandes, ou vous donner des conseils d\'achat.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/40 hover:bg-orange-600 hover:scale-110 transition-all duration-300 pulse-glow"
        >
          <Bot size={24} className="text-white" />
        </button>
      )}

      {/* Fenêtre de chat */}
      {open && (
        <div className={`fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] glass-dark rounded-2xl border border-white/10 shadow-2xl shadow-black/50 flex flex-col transition-all duration-300 ${minimized ? 'h-14' : 'h-[500px]'}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Sparkles size={16} className="text-orange-400" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">Assistant IA</div>
                <div className="text-white/40 text-xs">En ligne</div>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setMinimized(!minimized)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <MinusCircle size={16} className="text-white/40" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <X size={16} className="text-white/40" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-orange-500 text-white rounded-tr-sm'
                        : 'glass border border-white/10 text-white/80 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="glass border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder="Posez votre question..."
                    className="input-field text-sm py-2.5 flex-1"
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || loading}
                    className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-40"
                  >
                    <Send size={16} className="text-white" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
