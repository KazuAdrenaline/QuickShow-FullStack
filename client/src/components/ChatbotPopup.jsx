import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import axios from "axios";

const ChatbotPopup = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  // Hàm thêm tin nhắn vào khung chat
  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  // Gửi tin nhắn
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    addMessage(userMsg);

    const textToSend = input;
    setInput("");

    const { data } = await axios.post("/api/chatbot/ask", {
      message: textToSend,
    });

    addMessage({ sender: "bot", text: data.reply });
  };

  // Auto greeting khi OPEN popup
  useEffect(() => {
    if (!open) return; // chỉ chạy khi popup mở

    const loadGreeting = async () => {
      const { data } = await axios.get("/api/chatbot/welcome");
      addMessage({ sender: "bot", text: data.reply });
    };

    // Clear chat mỗi lần mở lại
    setMessages([]);

    loadGreeting();
  }, [open]);

  return (
    <>
      {/* Nút bật popup */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-primary p-4 rounded-full shadow-xl text-black hover:scale-110 transition"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Popup Chatbot */}
      {open && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white w-80 h-96 rounded-xl shadow-lg border border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <p className="font-semibold">🎬 QuickShow Assistant</p>
            <button onClick={() => setOpen(false)}>
              <X size={22} className="text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.sender === "user"
                    ? "ml-auto bg-primary text-black"
                    : "mr-auto bg-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700 flex gap-2">
            <input
              className="flex-1 bg-gray-800 text-white p-2 rounded-lg outline-none"
              placeholder="Hỏi tôi về phim..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-primary text-black px-4 rounded-lg"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotPopup;
