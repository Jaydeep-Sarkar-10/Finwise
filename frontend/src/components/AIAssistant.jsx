import { useState } from "react";
import { Send, Sparkles, User } from "lucide-react";
import { apiFetch } from "../utils/api";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text = message) => {
    const userMessage = text.trim();

    if (!userMessage || loading) {
      return;
    }

    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first.");
      return;
    }

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await apiFetch(
  "/api/ai/chat/",
  {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      message: userMessage,
    }),
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "AI request failed."
        );
      }

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error("AI error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: error.message || "Sorry, I couldn't process your request right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const suggestedQuestions = [
    "How much did I spend this month?",
    "Where am I spending the most?",
    "How much have I saved?",
    "Am I within my budgets?",
  ];

  return (
    <div className="ai-page">

      {/* Header */}

      <div className="ai-header">

        <div className="ai-title-section">

          <div className="ai-icon">
            <Sparkles size={24} />
          </div>

          <div>
            <h1>AI Assistant</h1>

            <p>
              Your personal financial assistant
            </p>
          </div>

        </div>

      </div>


      {/* Chat Area */}

      <div className="ai-chat-container">

        {/* Empty State */}

        {messages.length === 0 && (

          <div className="ai-empty-state">

            <div className="ai-empty-icon">
              <Sparkles size={32} />
            </div>

            <h2>
              How can I help you?
            </h2>

            <p>
              Ask me anything about your finances,
              spending, savings, budgets, or goals.
            </p>


            {/* Suggestions */}

            <div className="ai-suggestions">

              {suggestedQuestions.map(
                (question, index) => (

                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      sendMessage(question)
                    }
                  >
                    {question}
                  </button>

                )
              )}

            </div>

          </div>

        )}


        {/* Messages */}

        {messages.length > 0 && (

          <div className="ai-messages">

            {messages.map((msg, index) => (

              <div
                key={index}
                className={`ai-message ${
                  msg.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >

                {/* Avatar */}

                <div className="ai-message-avatar">

                  {msg.role === "user" ? (
                    <User size={17} />
                  ) : (
                    <Sparkles size={17} />
                  )}

                </div>


                {/* Message */}

                <div className="ai-message-content">
                  {msg.content}
                </div>

              </div>

            ))}


            {/* Loading */}

            {loading && (

              <div className="ai-message assistant-message">

                <div className="ai-message-avatar">
                  <Sparkles size={17} />
                </div>

                <div className="ai-message-content ai-loading">
                  Thinking...
                </div>

              </div>

            )}

          </div>

        )}

      </div>


      {/* Input Area */}

      <div className="ai-input-container">

        <form
          className="ai-input-wrapper"
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            placeholder="Ask about your finances..."
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            disabled={loading}
          />

          <button
            type="submit"
            disabled={
              !message.trim() || loading
            }
          >
            <Send size={18} />
          </button>

        </form>

        <p className="ai-disclaimer">
          Finwise AI uses your financial data to provide
          personalized insights.
        </p>

      </div>

    </div>
  );
}

export default AIAssistant;