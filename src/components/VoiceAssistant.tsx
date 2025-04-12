
import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import VoiceVisualizer from "./VoiceVisualizer";
import { processCommand } from "@/utils/commandProcessor";

type Message = {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

const VoiceAssistant = () => {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm EchoNova, your AI assistant. How can I help you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [volume, setVolume] = useState(0);
  const recognition = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = "en-US";

      recognition.current.onstart = () => {
        setListening(true);
      };

      recognition.current.onend = () => {
        setListening(false);
      };

      recognition.current.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            handleUserMessage(transcript);
          } else {
            interimTranscript += transcript;
          }
        }
        setTranscript(interimTranscript);
        // Simulate voice activity with random values
        setVolume(Math.random() * 100);
      };

      recognition.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive",
        });
        setListening(false);
      };
    } else {
      toast({
        title: "Browser Not Supported",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [toast]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    if (listening && recognition.current) {
      recognition.current.stop();
    } else if (recognition.current) {
      recognition.current.start();
    }
  };

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setTranscript("");
    setProcessing(true);

    try {
      // Process the command
      const response = await processCommand(text.trim());
      
      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "assistant",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Text-to-speech (would be implemented in a production app)
      // speakResponse(response);
    } catch (error) {
      console.error("Error processing command:", error);
      toast({
        title: "Processing Error",
        description: "Sorry, I had trouble processing that request.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInputRef.current?.value) {
      handleUserMessage(messageInputRef.current.value);
      messageInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full max-w-2xl mx-auto h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-nova-primary animate-pulse"></div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-nova-primary to-nova-secondary bg-clip-text text-transparent">
            EchoNova
          </h1>
        </div>
        <div className="text-sm text-gray-500">
          {listening ? "Listening..." : processing ? "Processing..." : "Ready"}
        </div>
      </div>
      
      <Separator />
      
      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 rounded-md bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <Card
                className={`max-w-[80%] p-3 ${
                  message.sender === "user"
                    ? "bg-nova-primary text-white"
                    : "bg-white border-nova-light"
                }`}
              >
                <p>{message.text}</p>
                <div
                  className={`text-xs mt-1 ${
                    message.sender === "user" ? "text-nova-light" : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Voice Activity */}
      {listening && (
        <div className="relative p-4 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-fadeIn">
          <div className="flex justify-center items-center h-20">
            <VoiceVisualizer active={listening} />
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            {transcript || "Listening..."}
          </div>
          <Progress value={volume} className="mt-2" />
        </div>
      )}
      
      {/* Input Area */}
      <div className="flex space-x-2">
        <Button
          onClick={toggleListening}
          variant={listening ? "destructive" : "default"}
          size="icon"
          className={`rounded-full ${listening ? "bg-red-500 hover:bg-red-600" : "bg-nova-primary hover:bg-nova-secondary"}`}
        >
          {listening ? <MicOff /> : <Mic />}
        </Button>
        
        <form onSubmit={handleTextSubmit} className="flex-1 flex">
          <input
            ref={messageInputRef}
            type="text"
            placeholder="Type a message..."
            className="flex-1 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-nova-primary px-4 py-2"
          />
          <Button 
            type="submit" 
            className="rounded-l-none bg-nova-primary hover:bg-nova-secondary"
          >
            <Send size={18} />
          </Button>
        </form>
        
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-gray-300 dark:border-gray-700"
        >
          <Volume2 />
        </Button>
      </div>
    </div>
  );
};

export default VoiceAssistant;
