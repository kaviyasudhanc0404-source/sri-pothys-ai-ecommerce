import express from "express";
import { Product } from "../models/Product.js";

const router = express.Router();

const SYSTEM_PROMPT = `You are the friendly shopping assistant for the Sri Pothys Silks & Readymades website.

Important store background:
- Sri Pothys Silks & Readymades shop was started in 2000
- Shop address: 62, North St, Swamimalai, Kumbakonam, Alavandipuram, Tamil Nadu 612302
- The shop focuses on sarees, lehengas, suits, men's wear, women's wear, kids wear, kurtis, dresses, shirts, T-shirts, cargo pants, jeans, chinos, jackets, jumpsuits, and festive outfits
- This chatbot should answer questions about the website, the clothes shown on the website, shopping help, wishlist, cart, orders, checkout, AI stylist, and size selection

Website shopping details:
- Free shipping on orders above Rs.999
- 7-day return policy
- Genuine product promise
- Users can browse products, add to cart, buy now, place orders, view orders, use wishlist, and use the AI stylist page

Response style:
- Sound like a real shopping assistant, not a repeated script
- Use "Vanakkam" only for greetings or the first welcome-style reply; do not start every answer with it
- Be helpful, warm, and specific to this website and the customer's exact question
- Keep replies concise, usually 2 to 4 sentences
- For size questions, reason from the user's measurements, product type, and fit preference. Give a practical recommendation, mention if it is approximate, and ask for missing details only when needed
- For product suggestions, recommend relevant categories or products from the current catalog when available
- For unclear questions, ask one short clarifying question instead of giving a generic product list
- If asked about the store, clearly say Sri Pothys Silks & Readymades shop was started in 2000
- If asked about the address or location, clearly give this exact address: 62, North St, Swamimalai, Kumbakonam, Alavandipuram, Tamil Nadu 612302
- If asked what the user can ask, say they can ask about products, collections, prices, categories, sizes, orders, cart, wishlist, and AI stylist
- Do not invent unsupported policies, store branches, or payment details beyond the information above`;

const FALLBACK_REPLY =
  "I could not process that properly. Please ask me about products, prices, collections, sizing, or shopping help on this website.";

const buildCatalogContext = async () => {
  const products = await Product.find({})
    .sort({ reviews: -1, rating: -1 })
    .limit(12)
    .select("name price category occasion color size")
    .lean();

  if (!products.length) return "";

  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].join(", ");
  const occasions = [...new Set(products.map((product) => product.occasion).filter(Boolean))].join(", ");
  const productLines = products
    .map((product) => {
      const sizes = Array.isArray(product.size) && product.size.length ? ` | sizes: ${product.size.join(", ")}` : "";
      return `- ${product.name}: Rs.${Number(product.price || 0).toLocaleString("en-IN")} | ${product.category} | ${product.occasion} | ${product.color}${sizes}`;
    })
    .join("\n");

  return `\n\nCurrent website catalog summary:\n- Main categories: ${categories}\n- Main occasions: ${occasions}\n\nSample products from the website catalog:\n${productLines}`;
};

const sanitizeMessages = (messages = []) =>
  messages
    .filter((message) => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string")
    .slice(-12)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, 1000),
    }));

const isGreetingMessage = (message = "") => /^(hi|hello|hey|hai|vanakkam|good morning|good evening)\b/i.test(message.trim());

const cleanReply = (reply, latestUserMessage) => {
  const text = String(reply || FALLBACK_REPLY).trim();

  if (isGreetingMessage(latestUserMessage)) {
    return text;
  }

  const withoutRepeatedGreeting = text.replace(/^vanakkam[!,.:\-\s]*/i, "").trim();
  return withoutRepeatedGreeting || FALLBACK_REPLY;
};

router.post("/message", async (req, res, next) => {
  try {
    const groqApiKey = process.env.GROQ_API_KEY?.trim();

    if (!groqApiKey) {
      return res.status(503).json({ error: "Chatbot API key is not configured on the backend." });
    }

    const messages = sanitizeMessages(req.body?.messages);

    if (!messages.length) {
      return res.status(400).json({ error: "At least one chatbot message is required." });
    }

    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content || "";
    const catalogContext = await buildCatalogContext();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: `${SYSTEM_PROMPT}${catalogContext}` }, ...messages],
        max_tokens: 300,
        temperature: 0.5,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(response.status).json({
        error: payload?.error?.message || payload?.message || "Chatbot request failed.",
      });
    }

    const reply = payload?.choices?.[0]?.message?.content;

    return res.json({
      reply: cleanReply(reply, latestUserMessage),
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
