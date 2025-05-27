
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

const formatToIST = () => {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5:30 hours for IST
  
  return istTime.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, city, temperature, condition, airQuality, airQualityIndex }: WeatherEmailRequest = await req.json();

    console.log(`Attempting to send weather email to ${email} for ${city}`);
    console.log(`Resend API Key configured: ${Deno.env.get("RESEND_API_KEY") ? "Yes" : "No"}`);

    if (!Deno.env.get("RESEND_API_KEY")) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    const istTime = formatToIST();

    const emailResponse = await resend.emails.send({
      from: "Weather Automation <onboarding@resend.dev>",
      to: [email],
      subject: `🌤️ Weather Update for ${city}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">🌤️ Weather Update for ${city}</h1>
            
            <p style="font-size: 18px; color: #374151;">Hi ${name},</p>
            
            <p style="font-size: 16px; color: #6b7280; margin-bottom: 30px;">Here's your personalized weather summary for <strong style="color: #1f2937;">${city}</strong>:</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; margin: 25px 0;">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px;">
                <div style="background-color: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 28px; font-weight: bold; color: #dc2626; margin-bottom: 5px;">🌡️ ${temperature}°C</div>
                  <div style="color: #6b7280; font-size: 14px; font-weight: 500;">Temperature</div>
                </div>
                
                <div style="background-color: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 20px; font-weight: bold; color: #2563eb; margin-bottom: 5px;">☁️ ${condition}</div>
                  <div style="color: #6b7280; font-size: 14px; font-weight: 500;">Condition</div>
                </div>
                
                <div style="background-color: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 18px; font-weight: bold; color: #059669; margin-bottom: 5px;">💨 ${airQuality}</div>
                  <div style="color: #6b7280; font-size: 14px; font-weight: 500;">Air Quality (${airQualityIndex}/6)</div>
                </div>
              </div>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #374151; margin-top: 0;">📍 Location Details</h3>
              <p style="color: #6b7280; margin: 10px 0;"><strong>City:</strong> ${city}</p>
              <p style="color: #6b7280; margin: 10px 0;"><strong>Report Time (IST):</strong> ${istTime}</p>
            </div>
            
            <p style="font-size: 16px; color: #374151; text-align: center; margin: 30px 0;">Thank you for using our Weather Automation System! 🚀</p>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 14px; color: #9ca3af; margin: 0;">
                Best regards,<br>
                <strong style="color: #374151;">Weather Automation Team</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("✅ Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      message: "Weather email sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in send-weather-email function:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: "Check the function logs for more information"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
