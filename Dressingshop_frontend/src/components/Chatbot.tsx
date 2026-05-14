import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Loader } from "lucide-react";
import { apiRequest } from "@/services/api";

const quickActions = [
  "Tell me about Sri Pothys",
  "Show sarees on this website",
  "Suggest festival outfits",
  "What can I ask here?",
];

interface Message {
  from: "user" | "bot";
  text: string;
}

interface ChatbotResponse {
  reply?: string;
}

const getLocalResponse = (question: string) => {
  const normalized = question.toLowerCase();
  const trimmed = normalized.trim();

  if (/^(hi|hello|hey|vanakkam|hai)$/i.test(question.trim())) {
    return "Hi! I can help with outfit suggestions, sizing, product choices, cart, wishlist, orders, checkout, and the AI Stylist on this website.";
  }

  if (normalized.includes("what can i ask") || normalized.includes("about webpage") || normalized.includes("about website")) {
    return "You can ask about Sri Pothys Silks & Readymades, products on this website, sarees, lehengas, men's wear, women's wear, sizes, prices, wishlist, cart, orders, checkout, and the AI Stylist page.";
  }

  if (normalized.includes("address") || normalized.includes("location") || normalized.includes("shop address") || normalized.includes("where is the shop")) {
    return "Sri Pothys Silks & Readymades is located at 62, North St, Swamimalai, Kumbakonam, Alavandipuram, Tamil Nadu 612302.";
  }

  if (normalized.includes("tell me about sri pothys") || normalized.includes("about sri pothys") || normalized.includes("when started") || normalized.includes("started in")) {
    return "Sri Pothys Silks & Readymades shop was started in 2000. The shop address is 62, North St, Swamimalai, Kumbakonam, Alavandipuram, Tamil Nadu 612302, and this website lets customers explore ethnic wear, festive outfits, cart, wishlist, orders, and AI Stylist features.";
  }

  if (trimmed === "help" || normalized.includes("how to use")) {
    return "Ask a question naturally, like “suggest a festival saree,” “which shirt size fits 180 cm and 75 kg,” or “how do I view my orders?”";
  }

  if (normalized.includes("order")) {
    return "You can place an order by opening a product, selecting size and quantity, then using Buy Now or Add to Cart. After checkout, order details can be viewed from the Orders page.";
  }

  if (normalized.includes("wishlist") || normalized.includes("love icon") || normalized.includes("heart icon")) {
    return "The heart icon saves products to your wishlist after login, so you can revisit favorite items from the Wishlist page.";
  }

  if (normalized.includes("cart") || normalized.includes("buy now") || normalized.includes("checkout")) {
    return "Use Add to Cart to collect multiple items, or Buy Now for a faster checkout flow.";
  }

  if (normalized.includes("ai stylist") || normalized.includes("ai")) {
    return "The AI Stylist page helps analyze an uploaded image and suggest matching outfits based on your style.";
  }

  return null;
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text: "Hi! I’m the Sri Pothys shopping assistant. Ask me about outfits, sizing, sarees, shirts, wishlist, cart, orders, checkout, or the AI Stylist.",
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

    setLoading(true);

    try {
      const data = await apiRequest<ChatbotResponse>("/chatbot/message", {
        method: "POST",
        body: JSON.stringify({
          messages: [
            ...nextMessages.map((message) => ({
              role: message.from === "user" ? "user" : "assistant",
              content: message.text,
            })),
          ],
        }),
      });

      const botResponse =
        data.reply ||
        "I could not process that properly. Please ask me about products, prices, collections, sizing, or shopping help on this website.";

      setMessages((prev) => [...prev, { from: "bot", text: botResponse }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "I am having trouble connecting to the AI service right now. I can still help with basic cart, wishlist, checkout, orders, store address, and AI Stylist questions.",
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
