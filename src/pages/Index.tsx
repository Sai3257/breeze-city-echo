
import { Cloud } from "lucide-react";
import WeatherForm from "@/components/WeatherForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Cloud className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Weather Automation</h1>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Weather Automation System
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Get personalized weather updates and air quality information for your city. 
              Just enter your details below and we'll handle the rest.
            </p>
          </div>
          <WeatherForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
