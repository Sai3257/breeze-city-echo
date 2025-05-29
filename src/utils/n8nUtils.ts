
export interface N8nWebhookPayload {
  timestamp: string;
  source: string;
  event_type: string;
  data: {
    city: string;
    temperature: number;
    condition: string;
    air_quality: string;
    air_quality_index: number;
    report_time: string;
  };
  metadata: {
    app_name: string;
    version: string;
  };
}

export const sendWeatherToN8n = async (webhookUrl: string, weatherData: any): Promise<boolean> => {
  try {
    const payload: N8nWebhookPayload = {
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

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending to n8n:', error);
    return false;
  }
};

export const validateWebhookUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};
