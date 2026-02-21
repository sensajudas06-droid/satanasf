import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  email: string;
  verificationUrl: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, verificationUrl }: RequestBody = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "E-posta adresi gerekli" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!profileData) {
      return new Response(
        JSON.stringify({ error: "Kullanıcı bulunamadı" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { error: dbError } = await supabase
      .from("email_verification_codes")
      .insert({
        email,
        code: token,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      throw dbError;
    }

    const verificationLink = `${verificationUrl}?token=${token}&email=${encodeURIComponent(email)}`;

    if (resendApiKey) {
      try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Satanas Fidelis <onboarding@resend.dev>",
            to: [email],
            subject: "Satanas Fidelis - E-posta Adresinizi Doğrulayın",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000; color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #dc2626; margin: 0; font-size: 28px;">Satanas Fidelis</h1>
                </div>

                <div style="background-color: #1a1a1a; border: 2px solid #dc2626; border-radius: 8px; padding: 30px;">
                  <h2 style="color: #dc2626; margin-top: 0;">E-posta Adresinizi Doğrulayın</h2>
                  <p style="color: #cccccc; line-height: 1.6;">Merhaba,</p>
                  <p style="color: #cccccc; line-height: 1.6;">
                    Satanas Fidelis platformuna hoş geldiniz. E-posta adresinizi doğrulamak için aşağıdaki butona tıklayın:
                  </p>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}"
                       style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      E-postamı Doğrula
                    </a>
                  </div>

                  <p style="color: #999999; font-size: 14px; line-height: 1.6;">
                    Eğer buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayıp yapıştırın:
                  </p>
                  <p style="color: #666666; font-size: 12px; word-break: break-all; background-color: #0a0a0a; padding: 10px; border-radius: 4px;">
                    ${verificationLink}
                  </p>

                  <p style="color: #999999; font-size: 12px; margin-top: 30px;">
                    Bu doğrulama linki 24 saat içinde geçerliliğini yitirecektir.
                  </p>
                  <p style="color: #666666; font-size: 12px; margin-top: 10px;">
                    Bu e-postayı siz talep etmediyseniz, lütfen göz ardı edin.
                  </p>
                </div>
              </div>
            `,
          }),
        });

        if (!resendResponse.ok) {
          const errorData = await resendResponse.json();
          console.error("Resend API Error:", errorData);
          throw new Error(`E-posta gönderilemedi: ${errorData.message || resendResponse.statusText}`);
        }

        const resendData = await resendResponse.json();
        console.log("E-posta başarıyla gönderildi:", resendData);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Doğrulama e-postası gönderildi",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (emailError) {
        console.error("E-posta gönderme hatası:", emailError);
        return new Response(
          JSON.stringify({
            success: false,
            error: "E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.",
            details: emailError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      console.log(`Doğrulama linki: ${verificationLink}`);
      console.log("RESEND_API_KEY bulunamadı, e-posta gönderilmedi");

      return new Response(
        JSON.stringify({
          success: true,
          message: "Doğrulama linki oluşturuldu (E-posta servisi yapılandırılmamış)",
          verificationLink,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Bir hata oluştu",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
