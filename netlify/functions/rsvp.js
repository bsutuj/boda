export async function handler(event) {

  const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzb4Eh6NvAp2LPuRAwsUjg0jiLUGHA9Z6uZ8zxM6cMHzA4OUVB3Y2w3o_bOh9Qpu-iW/exec";

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

    const data = await response.text();

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      body: data
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
