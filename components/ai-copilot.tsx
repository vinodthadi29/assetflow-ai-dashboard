'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Cpu, Send, X } from 'lucide-react'

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AssetFlow AI assistant. I can help you with asset queries, maintenance schedules, allocations, and analytics. What would you like to know?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Based on the current inventory, you have 45 assets in maintenance. Would you like to see the detailed maintenance schedule?',
        'The average asset age is 4.2 years. I recommend scheduling preventive maintenance for assets over 8 years old.',
        'You have 12 pending allocations awaiting approval. The average approval time is 2 days. Should I prioritize any?',
        'Asset utilization is at 78%, which is optimal. Your most utilized asset is the forklift in Warehouse A.',
        'I found 3 critical alerts: 2 assets need immediate maintenance and 1 allocation is overdue approval.',
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      setMessages((prev) => [...prev, { role: 'assistant', content: randomResponse }])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg hover:shadow-xl transition flex items-center justify-center group"
        >
          <Cpu className="w-6 h-6 text-primary-foreground group-hover:scale-110 transition" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 z-50 w-96 h-[600px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary-foreground" />
              <span className="font-semibold text-primary-foreground">AssetFlow AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-4 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about your assets..."
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none text-sm"
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Try: "Show assets in maintenance" or "What's my utilization rate?"
            </p>
          </div>
        </div>
      )}
    </>
  )
}
