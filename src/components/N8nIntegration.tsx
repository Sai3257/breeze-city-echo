
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Webhook, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WeatherData } from '@/utils/weatherApi';

interface N8nIntegrationProps {
  weatherData: WeatherData;
}

const N8nIntegration = ({ weatherData }: N8nIntegrationProps) => {
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('n8n_webhook_url') || '');
  const [isConfigured, setIsConfigured] = useState(!!localStorage.getItem('n8n_webhook_url'));
  const [isSending, setIsSending] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<string | null>(localStorage.getItem('n8n_last_sent'));
  const { toast } = useToast();

  const saveWebhookUrl = () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid n8n webhook URL",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('n8n_webhook_url', webhookUrl);
    setIsConfigured(true);
    
    toast({
      title: "Success",
      description: "n8n webhook URL saved successfully!",
    });
  };

  const sendToN8n = async () => {
    if (!webhookUrl) {
      toast({
        title: "Error", 
        description: "Please configure n8n webhook URL first",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    try {
      const payload = {
        timestamp: new Date().toISOString(),
        source: "weather-automation-app",
        event_type: "weather_data",
        data: {
          city: weatherData.city,
          temperature: weatherData.temperature,
          condition: weatherData.condition,
          air_quality: weatherData.airQuality,
          air_quality_index: weatherData.airQualityIndex,
          report_time: new Date().toISOString()
        },
        metadata: {
          app_name: "Weather Automation System",
          version: "1.0.0"
        }
      };

      console.log('🌐 Sending weather data to n8n:', payload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`n8n webhook returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.text();
      console.log('✅ n8n webhook response:', result);

      const sentTime = new Date().toISOString();
      setLastSentAt(sentTime);
      localStorage.setItem('n8n_last_sent', sentTime);

      toast({
        title: "Success!",
        description: "Weather data sent to n8n workflow successfully",
      });

    } catch (error: any) {
      console.error('❌ Error sending to n8n:', error);
      toast({
        title: "Error",
        description: `Failed to send data to n8n: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const clearConfiguration = () => {
    localStorage.removeItem('n8n_webhook_url');
    localStorage.removeItem('n8n_last_sent');
    setWebhookUrl('');
    setIsConfigured(false);
    setLastSentAt(null);
    
    toast({
      title: "Configuration Cleared",
      description: "n8n webhook configuration has been reset",
    });
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
          <Webhook className="h-5 w-5 text-purple-600" />
          n8n Workflow Integration
        </CardTitle>
        <CardDescription>
          Send weather data to your n8n workflows for advanced automation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConfigured ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Configure your n8n webhook URL to start sending weather data to your workflows.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="webhook-url" className="text-sm font-medium">
                n8n Webhook URL
              </Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://your-n8n-instance.com/webhook/your-webhook-id"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Get this URL from your n8n workflow webhook trigger node
              </p>
            </div>
            
            <Button onClick={saveWebhookUrl} className="w-full">
              Save Configuration
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                n8n webhook is configured and ready to receive weather data.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-gray-700">Configured Webhook:</p>
              <p className="text-xs font-mono text-gray-600 break-all">{webhookUrl}</p>
              {lastSentAt && (
                <p className="text-xs text-gray-500">
                  Last sent: {new Date(lastSentAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={sendToN8n} 
                disabled={isSending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isSending ? "Sending..." : "Send to n8n"}
              </Button>
              <Button 
                onClick={clearConfiguration}
                variant="outline"
                size="sm"
              >
                Reset
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Data Structure Sent:</h4>
              <pre className="text-xs text-blue-800 overflow-x-auto">
{JSON.stringify({
  timestamp: "ISO timestamp",
  source: "weather-automation-app",
  event_type: "weather_data",
  data: {
    city: weatherData.city,
    temperature: weatherData.temperature,
    condition: weatherData.condition,
    air_quality: weatherData.airQuality,
    air_quality_index: weatherData.airQualityIndex,
    report_time: "ISO timestamp"
  }
}, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => window.open('https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/', '_blank')}
            className="text-xs text-gray-500 hover:text-purple-600"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Learn about n8n webhooks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default N8nIntegration;
