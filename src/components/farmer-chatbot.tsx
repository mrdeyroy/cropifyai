'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bot, Send, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { farmerChatbot } from '@/ai/flows/farmer-chatbot';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Textarea from 'react-textarea-autosize';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export function FarmerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      try {
        const result = await farmerChatbot({
          history: [...messages, userMessage],
        });
        const modelMessage: Message = {
          role: 'model',
          content: result.response,
        };
        setMessages((prev) => [...prev, modelMessage]);
      } catch (error) {
        console.error('Chatbot error:', error);
        toast({
          variant: 'destructive',
          title: 'Chatbot Error',
          description:
            'Could not get a response from the AI. Please try again.',
        });
        // Remove the user message if AI fails
        setMessages((prev) => prev.slice(0, -1));
      }
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="primary"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 text-primary-foreground"
          aria-label="Open Farmer Chatbot"
        >
          <Bot className="h-7 w-7" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-[380px] h-[500px] p-0 flex flex-col"
        sideOffset={16}
      >
        <div className="p-4 border-b bg-primary text-primary-foreground rounded-t-md">
          <h3 className="font-semibold text-lg">AgriBot Assistant</h3>
          <p className="text-sm opacity-90">Your AI farming expert</p>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : ''
                )}
              >
                {message.role === 'model' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'p-3 rounded-lg max-w-[80%] text-sm',
                    message.role === 'user'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-card border'
                  )}
                >
                  {message.content}
                </div>
                 {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot />
                  </AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-card border">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            {messages.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    <Bot className="h-10 w-10 mx-auto mb-2"/>
                    <p>Ask me anything about farming!</p>
                </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-background rounded-b-md">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crops, soil, pests..."
              className="flex-1 resize-none bg-background border rounded-md px-3 py-2 text-sm max-h-24"
              minRows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isThinking}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isThinking || !input.trim()}
            >
              {isThinking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
