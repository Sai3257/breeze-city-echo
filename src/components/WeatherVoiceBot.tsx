
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeatherVoiceBotProps {
  weatherData: {
    temperature: number;
    condition: string;
    airQuality: string;
    city: string;
  } | null;
}

const WeatherVoiceBot: React.FC<WeatherVoiceBotProps> = ({ weatherData }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const speakWeatherReport = () => {
    if (!weatherData) {
      speak("No weather data available. Please submit a weather request first.");
      return;
    }

    const report = `Current weather report for ${weatherData.city}: 
      The temperature is ${weatherData.temperature} degrees Celsius. 
      Weather condition is ${weatherData.condition}. 
      Air quality is ${weatherData.airQuality}. 
      Have a great day!`;
    
    speak(report);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast({
          title: "Speech Error",
          description: "Unable to speak the weather report.",
          variant: "destructive"
        });
      };

      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Not Supported",
        description: "Speech synthesis is not supported in your browser.",
        variant: "destructive"
      });
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        
        if (transcript.includes('weather') || transcript.includes('report') || transcript.includes('temperature')) {
          speakWeatherReport();
        } else {
          speak("I can help you with weather reports. Try saying 'weather report' or 'tell me the weather'.");
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Unable to recognize speech. Please try again.",
          variant: "destructive"
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="mt-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
          🤖 AI Weather Voice Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Ask me about the weather or click "Speak Weather" to hear the current report!
        </p>
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "outline"}
            className="flex items-center gap-2"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isListening ? "Stop Listening" : "Start Listening"}
          </Button>

          <Button
            onClick={isSpeaking ? stopSpeaking : speakWeatherReport}
            variant={isSpeaking ? "destructive" : "default"}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            disabled={!weatherData && !isSpeaking}
          >
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {isSpeaking ? "Stop Speaking" : "Speak Weather"}
          </Button>
        </div>

        {isListening && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-blue-600">
              <div className="animate-pulse h-2 w-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm">Listening for voice commands...</span>
            </div>
          </div>
        )}

        {isSpeaking && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-green-600">
              <div className="animate-bounce h-2 w-2 bg-green-600 rounded-full"></div>
              <span className="text-sm">Speaking weather report...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherVoiceBot;
