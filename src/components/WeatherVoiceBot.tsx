
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WeatherVoiceBot = ({ weatherData }: { weatherData: any }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        console.log('Voice recognition started');
      };

      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        console.log('Recognized speech:', transcript);
        
        // Process the voice command
        handleVoiceCommand(transcript.toLowerCase());
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive"
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        console.log('Voice recognition ended');
      };

      setRecognition(recognitionInstance);
    } else {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive"
      });
    }
  }, []);

  const handleVoiceCommand = (command: string) => {
    if (command.includes('weather') || command.includes('temperature') || command.includes('report')) {
      speakWeatherReport();
    } else if (command.includes('hello') || command.includes('hi')) {
      speak("Hello! I'm your weather assistant. Ask me about the weather!");
    } else {
      speak("I can help you with weather information. Try saying 'tell me the weather' or 'weather report'.");
    }
  };

  const speakWeatherReport = () => {
    if (!weatherData) {
      speak("No weather data available. Please check a city's weather first.");
      return;
    }

    const report = `Current weather for ${weatherData.location}: 
    Temperature is ${weatherData.temperature}°C, 
    feels like ${weatherData.feelsLike}°C. 
    Humidity is ${weatherData.humidity}%. 
    Weather condition: ${weatherData.condition}. 
    Air quality index is ${weatherData.airQuality}.`;

    speak(report);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast({
          title: "Speech Error",
          description: "Could not speak the text. Please try again.",
          variant: "destructive"
        });
      };

      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in this browser.",
        variant: "destructive"
      });
    }
  };

  const startListening = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          AI Voice Assistant
        </CardTitle>
        <CardDescription>
          Click the microphone to ask about weather or get a voice report
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking}
            variant={isListening ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Start Listening
              </>
            )}
          </Button>

          <Button
            onClick={speakWeatherReport}
            disabled={isListening || !weatherData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Volume2 className="h-4 w-4" />
            Speak Weather
          </Button>

          {isSpeaking && (
            <Button
              onClick={stopSpeaking}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <VolumeX className="h-4 w-4" />
              Stop Speaking
            </Button>
          )}
        </div>

        {transcript && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">You said:</p>
            <p className="font-medium">{transcript}</p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Try saying: "Tell me the weather", "Weather report", or "Hello"
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherVoiceBot;
