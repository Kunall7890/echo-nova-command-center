
import React from "react";
import VoiceAssistant from "@/components/VoiceAssistant";
import { Card, CardContent } from "@/components/ui/card";
import { Command, Clock, FileText, VolumeX, Volume2, Cloud } from "lucide-react";

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
            EchoNova is a voice assistant prototype. Try interacting with it using your voice or typing in the input field.
          </p>
          <p className="mt-2">
            Note: Voice recognition requires microphone permission in your browser.
          </p>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full">
          <FeatureCard 
            icon={<Command className="h-5 w-5 text-nova-primary" />}
            title="Commands"
            description="Ask for a joke, get the time, or search for information."
          />
          <FeatureCard 
            icon={<Clock className="h-5 w-5 text-nova-primary" />}
            title="Reminders"
            description="Create and manage reminders with simple voice commands."
          />
          <FeatureCard 
            icon={<FileText className="h-5 w-5 text-nova-primary" />}
            title="Notes"
            description="Take quick notes and access them later."
          />
          <FeatureCard 
            icon={<Volume2 className="h-5 w-5 text-nova-primary" />}
            title="System Control"
            description="Control volume and launch applications."
          />
          <FeatureCard 
            icon={<Cloud className="h-5 w-5 text-nova-primary" />}
            title="Weather"
            description="Check weather forecasts (requires API integration)."
          />
          <FeatureCard 
            icon={<VolumeX className="h-5 w-5 text-nova-primary" />}
            title="Voice Commands"
            description="Just say 'Hello' to get started."
          />
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>EchoNova AI Assistant &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <Card className="border-nova-light">
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
          {icon}
        </div>
        <h3 className="text-sm font-medium mb-1">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
};

export default Index;
