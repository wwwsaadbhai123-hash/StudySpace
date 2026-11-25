
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { io } from "socket.io-client";
import api, { API_BASE_URL } from "../services/api";
import { useAuth } from "../context/AuthContext";

function GroupChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Fetch previous messages
  useEffect(() => {
    let active = true;

    const fetchMessages = async () => {
      try {
        const response = await api.get(`/messages/${id}`);

        if (active) {
          setMessages(response.data.messages || []);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load messages"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    setLoading(true);
    fetchMessages();

    return () => {
      active = false;
    };
  }, [id]);

  // Real-time Socket.IO connection
  useEffect(() => {
    const socket = io(API_BASE_URL);

    socket.on("connect", () => {
      console.log("Connected to StudySpace chat:", socket.id);
      socket.emit("joinGroup", id);
    });

    socket.on("newMessage", (newMessage) => {
      if (String(newMessage.group) !== String(id)) return;

      setMessages((prev) => {
        const alreadyExists = prev.some(
          (item) => item._id === newMessage._id
        );

        if (alreadyExists) return prev;

        return [...prev, newMessage];
      });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socket.emit("leaveGroup", id);
      socket.disconnect();
    };
  }, [id]);

  // Send Message
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      setSending(true);
      setError("");

      const response = await api.post(`/messages/${id}`, {
        message: message.trim(),
      });

      const newMessage = response.data.newMessage;

      setMessages((prev) => {
        const alreadyExists = prev.some(
          (item) => item._id === newMessage._id
        );

        if (alreadyExists) return prev;

        return [...prev, newMessage];
      });

      setMessage("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send message"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate(`/study-groups/${id}`)}
          className="mb-5 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Group
        </button>

        <div className="rounded-xl border p-5">
          <div className="mb-5 flex items-center gap-3">
            <MessageCircle size={26} />

            <div>
              <h1 className="text-2xl font-bold">
                Group Chat
              </h1>

              <p className="text-sm text-gray-500">
                Chat with your study group members
              </p>
            </div>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="mb-5 h-[450px] space-y-3 overflow-y-auto rounded-lg border p-4">
            {loading ? (
              <p>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-500">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((item) => {
                const senderId =
                  item.sender?._id || item.sender;

                const isMine =
                  String(senderId) ===
                  String(user?._id || user?.id);

                return (
                  <div
                    key={item._id}
                    className={`flex ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-[75%] rounded-xl border p-3">
                      <p className="mb-1 text-xs font-semibold text-gray-500">
                        {isMine
                          ? "You"
                          : item.sender?.name || "Member"}
                      </p>

                      <p className="break-words">
                        {item.message}
                      </p>

                      <p className="mt-1 text-right text-xs text-gray-400">
                        {new Date(
                          item.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={sendMessage}
            className="flex gap-3"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message..."
              className="min-w-0 flex-1 rounded-lg border px-4 py-3"
            />

            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="flex items-center gap-2 rounded-lg border px-5 py-3"
            >
              <Send size={18} />
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GroupChat;
