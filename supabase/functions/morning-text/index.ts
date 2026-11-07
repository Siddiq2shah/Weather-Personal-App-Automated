import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Cron-Secret",
};

const EDISON = { lat: 40.5187, lon: -74.4121 };
const MORNING_HOUR_ET = 8;
const SEND_DEDUPE_STATUS = "sent";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function getSecret(name: string): Promise<string> {
  const { data, error } = await supabase.rpc("get_app_secret", { secret_name: name });
  if (error || !data) throw new Error(`Missing setting: ${name}`);
  return data as string;
}

interface WeatherNow {
  temp: number;
  description: string;
  high: number;
  low: number;
  precipChance: number;
}

async function fetchWeather(apiKey: string): Promise<WeatherNow> {
  const params = `lat=${EDISON.lat}&lon=${EDISON.lon}&units=imperial&appid=${apiKey}`;
  const [currentRes, forecastRes] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}`),
  ]);
  if (!currentRes.ok || !forecastRes.ok) throw new Error("Weather service unavailable");

  const current = await currentRes.json();
  const forecast = await forecastRes.json();
  const todayKey = easternParts(new Date()).date;

  const todays = (forecast.list as any[]).filter(
    (item) => localDateKey(item.dt, forecast.city.timezone) === todayKey,
  );
  const source = todays.length > 0 ? todays : (forecast.list as any[]).slice(0, 8);

  return {
    temp: Math.round(current.main.temp),
    description: current.weather[0].description,
    high: Math.round(Math.max(...source.map((i) => i.main.temp_max))),
    low: Math.round(Math.min(...source.map((i) => i.main.temp_min))),
    precipChance: Math.round(Math.max(...source.map((i) => i.pop)) * 100),
  };
}

function localDateKey(unixSeconds: number, offsetSeconds: number): string {
  return new Date((unixSeconds + offsetSeconds) * 1000).toISOString().slice(0, 10);
}

function easternParts(date: Date): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) % 24 };
}

function outfitFor(temp: number): { name: string; top: string; bottom: string } {
  if (temp >= 85) return { name: "Breezy Linen", top: "flowy white linen blouse", bottom: "high-waisted denim shorts" };
  if (temp >= 72) return { name: "Smart Casual", top: "short-sleeve knit top", bottom: "dark straight-leg jeans" };
  if (temp >= 60) return { name: "Layered Classic", top: "long-sleeve blouse with a light cardigan", bottom: "dark jeans" };
  if (temp >= 45) return { name: "Warm Layers", top: "chunky knit sweater over a thermal top", bottom: "straight-leg jeans" };
  return { name: "Bundled Up", top: "thermal base layer under a heavy knit sweater", bottom: "lined trousers or thick jeans" };
}

function buildMessage(weather: WeatherNow, siteUrl: string): string {
  const outfit = outfitFor(weather.temp);
  return [
    "Good Morning :) Eshal Qazi",
    "",
    `Edison, NJ today: ${weather.temp}°F, ${weather.description}. High ${weather.high}°, low ${weather.low}°, rain chance ${weather.precipChance}%.`,
    "",
    `What to wear (${outfit.name}): ${outfit.top} with ${outfit.bottom}.`,
    "",
    `See the full forecast: ${siteUrl}`,
  ].join("\n");
}

async function sendSms(accountSid: string, authToken: string, from: string, to: string, body: string) {
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`Twilio error ${response.status}: ${payload.message ?? "unknown"}`);
  return payload.sid as string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const expectedSecret = await getSecret("MORNING_TEXT_SECRET");
    if (req.headers.get("x-cron-secret") !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const force = new URL(req.url).searchParams.get("force") === "1";
    const now = easternParts(new Date());
    if (!force && now.hour !== MORNING_HOUR_ET) {
      return new Response(JSON.stringify({ skipped: "not 8 AM Eastern" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: alreadySent, error: logError } = await supabase
      .from("sms_send_log")
      .select("id")
      .eq("send_date", now.date)
      .eq("status", SEND_DEDUPE_STATUS)
      .maybeSingle();
    if (logError) throw new Error("Could not read send log");
    if (alreadySent && !force) {
      return new Response(JSON.stringify({ skipped: "already sent today" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [accountSid, authToken, from, to, apiKey, siteUrl] = await Promise.all([
      getSecret("TWILIO_ACCOUNT_SID"),
      getSecret("TWILIO_AUTH_TOKEN"),
      getSecret("TWILIO_FROM_NUMBER"),
      getSecret("MORNING_TEXT_RECIPIENT"),
      getSecret("OPENWEATHER_API_KEY"),
      getSecret("SITE_URL"),
    ]);

    const weather = await fetchWeather(apiKey);
    const body = buildMessage(weather, siteUrl);
    const sid = await sendSms(accountSid, authToken, from, to, body);

    await supabase.from("sms_send_log").insert({ send_date: now.date, status: "sent", twilio_sid: sid, body });

    return new Response(JSON.stringify({ sent: true, sid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
