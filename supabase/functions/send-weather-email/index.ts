
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeatherEmailRequest {
  name: string;
  email: string;
  city: string;
  temperature: number;
  condition: string;
  airQuality: string;
  airQualityIndex: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, city, temperature, condition, airQuality, airQualityIndex }: WeatherEmailRequest = await req.json();

    console.log(`Sending weather email to ${email} for ${city}`);

    const emailResponse = await resend.emails.send({
      from: "Weather Automation <onboarding@resend.dev>",
      to: [email],
      subject: `Weather Update for ${city}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">🌤️ Weather Update for ${city}</h1>
          
          <p style="font-size: 16px;">Hi ${name},</p>
          
          <p style="font-size: 16px;">Here's your personalized weather summary for <strong>${city}</strong>:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: grid; gap: 15px;">
              <div style="background-color: white; padding: 15px; border-radius: 6px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #dc2626;">🌡️ ${temperature}°C</div>
                <div style="color: #6b7280; font-size: 14px;">Temperature</div>
              </div>
              
              <div style="background-color: white; padding: 15px; border-radius: 6px; text-align: center;">
                <div style="font-size: 18px; font-weight: bold; color: #2563eb;">☁️ ${condition}</div>
                <div style="color: #6b7280; font-size: 14px;">Condition</div>
              </div>
              
              <div style="background-color: white; padding: 15px; border-radius: 6px; text-align: center;">
                <div style="font-size: 18px; font-weight: bold; color: #059669;">💨 ${airQuality}</div>
                <div style="color: #6b7280; font-size: 14px;">Air Quality (Index: ${airQualityIndex})</div>
              </div>
            </div>
          </div>
          
          <p style="font-size: 16px;">Thank you for using our Weather Automation System!</p>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
            Best regards,<br>
            Weather Automation Team
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-weather-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
