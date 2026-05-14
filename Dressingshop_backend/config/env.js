const PLACEHOLDER_VALUES = new Set([
  "replace-with-your-own-local-development-secret",
  "your_groq_api_key_here",
]);

const hasValue = (value) => typeof value === "string" && value.trim().length > 0;

const isPlaceholder = (value) => PLACEHOLDER_VALUES.has(String(value || "").trim());

export const validateEnv = () => {
  const missing = [];

  if (!hasValue(process.env.MONGODB_URI)) missing.push("MONGODB_URI");
  if (!hasValue(process.env.JWT_SECRET) || isPlaceholder(process.env.JWT_SECRET)) missing.push("JWT_SECRET");

  if (missing.length) {
    console.error(`Missing or unsafe required environment variable(s): ${missing.join(", ")}`);
    process.exit(1);
  }
};

export const getAllowedOrigins = () => {
  const defaults = ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"];
  const configured = String(process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...defaults, ...configured])];
};
