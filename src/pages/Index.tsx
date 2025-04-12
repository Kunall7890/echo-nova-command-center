
import React from "react";
import VoiceAssistant from "@/components/VoiceAssistant";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-nova-primary to-nova-secondary bg-clip-text text-transparent">
          EchoNova Command Center
        </h1>
        
        <Card className="w-full max-w-2xl shadow-lg border-nova-light">
          <CardContent className="p-6">
            <VoiceAssistant />
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center text-sm text-gray-500 max-w-lg">
          <p>
            EchoNova is a voice assistant prototype. Try saying "Hello", asking for a joke, 
            or asking for the time. In a full implementation, it would connect to various APIs 
            for weather, news, and more.
          </p>
          <p className="mt-2">
            Note: Voice recognition requires microphone permission in your browser.
          </p>
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>EchoNova AI Assistant &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;
