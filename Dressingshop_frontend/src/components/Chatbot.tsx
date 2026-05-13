import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Loader } from "lucide-react";
import { products } from "@/data/products";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY?.trim();

const quickActions = [
  "Tell me about Sri Pothys",
  "Show sarees on this website",
  "Suggest festival outfits",
  "What can I ask here?",
];

const featuredProducts = products
  .slice(0, 12)
  .map((product) => `- ${product.name}: Rs.${product.price.toLocaleString()} | ${product.category} | ${product.occasion}`)
  .join("\n");

const categorySummary = Array.from(new Set(products.map((product) => product.category))).join(", ");
const occasionSummary = Array.from(new Set(products.map((product) => product.occasion))).join(", ");

const SYSTEM_PROMPT = `You are the friendly shopping assistant for the Sri Pothys Silks & Readymades website.

Important store background:
- Sri Pothys Silks & Readymades shop was started in 2000
- Shop address: 62, North St, Swamimalai, Kumbakonam, Alavandipuram, Tamil Nadu 612302
- The shop focuses on sarees, lehengas, suits, men's wear, women's wear, kids wear, kurtis, dresses, shirts, T-shirts, cargo pants, jeans, chinos, jackets, jumpsuits, and festive outfits
- This chatbot should answer questions about the website, the clothes shown on the website, shopping help, wishlist, cart, orders, checkout, AI stylist, and size selection

Website catalog summary:
- Main categories on this website: ${categorySummary}
- Main occasions on this website: ${occasionSummary}

Sample products from the current website catalog:
${featuredProducts}

Website shopping details:
- Free shipping on orders above Rs.999
- 7-day return policy
- Genuine product promise
- Users can browse products, add to cart, buy now, place orders, view orders, use wishlist, and use the AI stylist page

Response style:
- Start naturally with "Vanakkam" when greeting
- Be helpful, warm, and specific to this website
- Mention actual product names, categories, colors, and occasions from the website when useful
- Keep replies concise, usually 2 to 4 sentences
- If asked about the store, clearly say Sri Pothys Silks & Readymades shop was started in 2000
- If asked about the address or location, clearly give this exact address: 62, North St, Swamimalai, Kumbakonam, Alavandipuram, Tamil Nadu 612302
- If asked what the user can ask, say they can ask about products, collections, prices, categories, sizes, orders, cart, wishlist, and AI stylist
- Do not invent unsupported policies, store branches, or payment details beyond the information above`;

const FALLBACK_BOT_REPLY =
  "Vanakkam! I can still help you explore sarees, lehengas, kurtis, dresses, men's wear, wishlist, cart, and orders on this website.";

interface Message {
  from: "user" | "bot";
  text: string;
}

const getLocalResponse = (question: string) => {
  const normalized = question.toLowerCase();

  if (normalized.includes("what can i ask") || normalized.includes("about webpage") || normalized.includes("about website")) {
    return "Vanakkam! You can ask me about Sri Pothys Silks & Readymades, the clothes shown on this website, sarees, lehengas, men's wear, women's wear, sizes, prices, wishlist, cart, orders, checkout, and the AI Stylist page.";
  }

  if (normalized.includes("address") || normalized.includes("location") || normalized.includes("shop address") || normalized.includes("where is the shop")) {
    return "Vanakkam! Sri Pothys Silks & Readymades is located at 62, North St, Swamimalai, Kumbakonam, Alavandipuram, Tamil Nadu 612302.";
  }

  if (normalized.includes("tell me about sri pothys") || normalized.includes("about sri pothys") || normalized.includes("when started") || normalized.includes("started in")) {
    return "Vanakkam! Sri Pothys Silks & Readymades shop was started in 2000. The shop address is 62, North St, Swamimalai, Kumbakonam, Alavandipuram, Tamil Nadu 612302, and on this website you can explore sarees, lehengas, suits, kurtis, dresses, men's wear, kids wear, and festive collections.";
  }

  if (normalized.includes("saree")) {
    const sarees = products.filter((product) => product.category === "Sarees").slice(0, 4);
    const sareeText = sarees.map((product) => `${product.name} for Rs.${product.price.toLocaleString()}`).join(", ");
    return `Vanakkam! We have beautiful sarees on this website like ${sareeText}. You can also check wedding, festival, and party sarees based on your occasion.`;
  }

  if (normalized.includes("festival")) {
    const festivalItems = products.filter((product) => product.occasion === "Festival").slice(0, 4);
    const festivalText = festivalItems.map((product) => `${product.name} for Rs.${product.price.toLocaleString()}`).join(", ");
    return `Vanakkam! For festival wear on this website, good options include ${festivalText}. These are suitable for festive celebrations and traditional styling.`;
  }

  if (normalized.includes("men") || normalized.includes("shirt") || normalized.includes("t-shirt") || normalized.includes("cargo") || normalized.includes("jeans")) {
    const menItems = products.filter((product) => product.gender === "male").slice(0, 5);
    const menText = menItems.map((product) => `${product.name} at Rs.${product.price.toLocaleString()}`).join(", ");
    return `Vanakkam! The men's collection on this website includes ${menText}. You can explore casual, formal, wedding, and festival options.`;
  }

  if (normalized.includes("women") || normalized.includes("kurti") || normalized.includes("dress") || normalized.includes("lehenga")) {
    const womenItems = products.filter((product) => product.gender === "female").slice(0, 5);
    const womenText = womenItems.map((product) => `${product.name} at Rs.${product.price.toLocaleString()}`).join(", ");
    return `Vanakkam! The women's collection on this website includes ${womenText}. You can browse casual, party, festival, and wedding styles.`;
  }

  if (normalized.includes("size")) {
    return "Vanakkam! Sizes on this website depend on the product. Sarees usually come in Free Size, while kurtis, tops, dresses, shirts, and men's wear commonly include sizes like S, M, L, XL, and sometimes XXL.";
  }

  if (normalized.includes("order")) {
    return "Vanakkam! You can place an order by opening a product, selecting the size and quantity, then using Buy Now or Add to Cart. After checkout, your order is stored and can be viewed in the Orders page.";
  }

  if (normalized.includes("wishlist") || normalized.includes("love icon") || normalized.includes("heart icon")) {
    return "Vanakkam! The heart icon opens your wishlist after login. You can save products you like there and revisit them anytime from the wishlist page.";
  }

  if (normalized.includes("cart") || normalized.includes("buy now") || normalized.includes("checkout")) {
    return "Vanakkam! You can add items to cart or use Buy Now for direct checkout. This website also stores your shopping cart and order details so your shopping flow works properly.";
  }

  if (normalized.includes("ai stylist") || normalized.includes("ai")) {
    return "Vanakkam! The AI Stylist page on this website helps analyze your uploaded image and suggest matching outfits based on your style.";
  }

  return null;
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text: "Vanakkam! Welcome to Sri Pothys Silks & Readymades. Our shop was started in 2000, and I can help you with the clothes, collections, wishlist, cart, orders, and AI Stylist features on this website.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (loading) return;

    const userMessage: Message = { from: "user", text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");

    const localResponse = getLocalResponse(text);
    if (localResponse) {
      setMessages((prev) => [...prev, { from: "bot", text: localResponse }]);
      return;
    }

    if (!GROQ_API_KEY) {
      setMessages((prev) => [...prev, { from: "bot", text: FALLBACK_BOT_REPLY }]);
      return;
    }

    setLoading(true);

    const controller = new AbortController();

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...nextMessages.map((message) => ({
              role: message.from === "user" ? "user" : "assistant",
              content: message.text,
            })),
          ],
          max_tokens: 300,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json().catch(() => null);
      const botResponse =
        data?.choices?.[0]?.message?.content ||
        "Vanakkam! I could not process that properly. Please ask me about products, prices, collections, or shopping help on this website.";

      setMessages((prev) => [...prev, { from: "bot", text: botResponse }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Vanakkam! I am having trouble connecting right now, but I can still help you explore sarees, lehengas, kurtis, dresses, men's wear, wishlist, cart, and orders on this website.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-full gradient-festive shadow-lg flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform ${open ? "hidden" : ""}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-[360px] h-[min(74svh,560px)] sm:h-[500px] max-h-[calc(100svh-1.5rem)] sm:max-h-[calc(100vh-4rem)] glass-card-strong rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="gradient-maroon p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <div>
                  <h3 className="font-display font-bold text-sm text-primary-foreground">Sri Pothys Assistant</h3>
                  <p className="text-[10px] text-primary-foreground/70">Website shopping help and clothing guidance</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.from === "user"
                        ? "gradient-maroon text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.text.split("\n").map((line, lineIndex) => (
                      <p key={lineIndex} className={lineIndex > 0 ? "mt-1" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1 items-center">
                    <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground ml-1">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => !loading && sendMessage(action)}
                  disabled={loading}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground disabled:opacity-50"
                >
                  {action}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2 bg-muted rounded-2xl px-3 py-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && input.trim() && !loading && sendMessage(input.trim())}
                  placeholder="Ask about this website..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  disabled={loading}
                />
                <button
                  onClick={() => input.trim() && !loading && sendMessage(input.trim())}
                  disabled={loading}
                  className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-maroon-dark" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
