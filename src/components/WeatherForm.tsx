
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Cloud, Thermometer, Wind, Mail, MapPin, User } from "lucide-react";
import { validateEmail } from "@/utils/validation";
import { getWeatherData, WeatherData } from "@/utils/weatherApi";
import { useToast } from "@/hooks/use-toast";

const WeatherForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: ""
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    city: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Real-time email validation
    if (field === "email" && value) {
      const emailError = validateEmail(value);
      setErrors(prev => ({ ...prev, email: emailError }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: formData.name.trim() ? "" : "Name is required",
      email: validateEmail(formData.email),
      city: formData.city.trim() ? "" : "City is required"
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Form submitted with data:", formData);
      
      // Get weather data
      const weather = await getWeatherData(formData.city);
      setWeatherData(weather);
      
      // Simulate storing in database
      const userData = {
        ...formData,
        weather,
        timestamp: new Date().toISOString()
      };
      console.log("Data stored to database:", userData);
      
      // Simulate sending confirmation email
      console.log(`
        📧 CONFIRMATION EMAIL SENT TO: ${formData.email}
        
        Subject: Weather Update for ${formData.city}
        
        Hi ${formData.name},
        
        Here's your personalized weather summary for ${formData.city}:
        
        🌡️ Temperature: ${weather.temperature}°C
        ☁️ Condition: ${weather.condition}
        💨 Air Quality: ${weather.airQuality} (${weather.airQualityIndex})
        
        Thank you for using our Weather Automation System!
        
        Best regards,
        Weather Team
      `);
      
      setIsSubmitted(true);
      toast({
        title: "Success!",
        description: "Weather data retrieved and confirmation email sent.",
      });
      
    } catch (error) {
      console.error("Error processing form:", error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted && weatherData) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl text-green-700 flex items-center justify-center gap-2">
            <Mail className="h-6 w-6" />
            Automation Complete!
          </CardTitle>
          <CardDescription className="text-base">
            Your weather summary has been processed and emailed to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-600" />
              Weather Summary for {formData.city}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg text-center">
                <Thermometer className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{weatherData.temperature}°C</div>
                <div className="text-sm text-gray-600">Temperature</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg text-center">
                <Cloud className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900">{weatherData.condition}</div>
                <div className="text-sm text-gray-600">Condition</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg text-center">
                <Wind className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900">{weatherData.airQuality}</div>
                <div className="text-sm text-gray-600">Air Quality</div>
              </div>
            </div>
          </div>
          
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              A detailed weather summary has been sent to <strong>{formData.email}</strong>
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={() => {
              setIsSubmitted(false);
              setWeatherData(null);
              setFormData({ name: "", email: "", city: "" });
            }}
            className="w-full"
            variant="outline"
          >
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-900">Weather Information Request</CardTitle>
        <CardDescription className="text-base">
          Enter your details to receive personalized weather and air quality data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`transition-all duration-200 ${errors.name ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`transition-all duration-200 ${errors.email ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              City
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="Enter your city name"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className={`transition-all duration-200 ${errors.city ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
            />
            {errors.city && (
              <p className="text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-105"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Get Weather Update"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeatherForm;
