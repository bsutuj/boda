export async function handler(event) {
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw1bXT1PsAcar8p8xtHEUDpwq5FW44Vw9LJAPAuhE8vptCWTeoW342z0Bsutcof5VmZ/exec";

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: event.body
    });

    const text = await response.text();

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      body: text
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: true,
        message: error.message
      })
    };
  }
}