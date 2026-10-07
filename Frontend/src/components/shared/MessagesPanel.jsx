import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { fetchContacts, fetchConversation, sendMessage, fetchUnreadCounts, markAsRead } from "@/store/slices/messageSlice";

const MessagesPanel = ({ attendee = false }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { contacts, conversation, unread, loading } = useSelector((state) => state.message);
  const { user } = useSelector((state) => state.auth);
  const [selectedContact, setSelectedContact] = useState(null);
  const [text, setText] = useState("");
  const messagesContainerRef = useRef(null);
  const contactId = searchParams.get("user");

  useEffect(() => {
    dispatch(fetchContacts());
    dispatch(fetchUnreadCounts());
    const interval = setInterval(() => dispatch(fetchUnreadCounts()), 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (!contactId || !contacts.length) return;

    const contact = contacts.find((item) => item._id === contactId);

    if (contact) {
      setSelectedContact(contact);
    }
  }, [contactId, contacts]);

  useEffect(() => {
    if (!selectedContact) return;

    dispatch(fetchConversation(selectedContact._id));
    dispatch(markAsRead(selectedContact._id));

    const interval = setInterval(() => {
      dispatch(fetchConversation(selectedContact._id));
      dispatch(markAsRead(selectedContact._id));
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedContact, dispatch]);

  const messages = selectedContact
    ? conversation.filter((m) => [m.sender, m.receiver].includes(selectedContact._id))
    : [];

 useEffect(() => {
  if (messagesContainerRef.current) {
    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
  }
}, [messages.length]);

  const handleSend = async () => {
    if (!text.trim() || !selectedContact) return;

    const result = await dispatch(sendMessage({ receiver: selectedContact._id, content: text }));

    if (sendMessage.fulfilled.match(result)) {
      setText("");
    } else {
      toast.error(result.payload?.error || "Could not send message");
    }
  };

  const unreadCountFor = (contactId) => {
    if (selectedContact?._id === contactId) return 0;
    const entry = unread.find((u) => u._id === contactId);
    return entry ? entry.count : 0;
  };

  return (
    <div className={`rounded-2xl border overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[70vh] ${attendee ? "border-[#eadfc9] bg-white shadow-sm" : "border-border bg-surface"}`}>
      <div className={`border-r overflow-y-auto ${attendee ? "border-[#eadfc9] bg-[#fffdf9]" : "border-border"}`}>
        <h2 className={`p-4 text-sm font-semibold border-b ${attendee ? "text-[#2f2a24] border-[#eadfc9]" : "text-foreground border-border"}`}>Contacts</h2>

        {contacts.length === 0 && (
          <p className={`p-4 text-sm ${attendee ? "text-[#8a8379]" : "text-muted"}`}>No contacts yet.</p>
        )}

        {contacts.map((contact) => {
          const count = unreadCountFor(contact._id);

          return (
            <button
              key={contact._id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full text-left p-4 border-b flex items-center justify-between ${attendee ? `border-[#eadfc9] hover:bg-[#fff4d9] ${selectedContact?._id === contact._id ? "bg-[#fff4d9]" : ""}` : `border-border hover:bg-background ${selectedContact?._id === contact._id ? "bg-background" : ""}`}`}
            >
              <div>
                <p className={`text-sm font-medium ${attendee ? "text-[#2f2a24]" : "text-foreground"}`}>{contact.name}</p>
                <p className={`text-xs ${attendee ? "text-[#8a8379]" : "text-muted"}`}>
                  {contact.role} {contact.companyName ? `· ${contact.companyName}` : ""}
                </p>
              </div>

              {count > 0 && (
                <span className="ml-2 flex-shrink-0 rounded-full bg-[#c49424] text-white text-xs font-semibold w-5 h-5 flex items-center justify-center">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="md:col-span-2 flex flex-col min-h-0">
        {!selectedContact && (
          <div className={`flex-1 flex items-center justify-center text-sm ${attendee ? "text-[#8a8379]" : "text-muted"}`}>
            Select a contact to start messaging
          </div>
        )}

        {selectedContact && (
          <>
            <div className={`p-4 border-b ${attendee ? "border-[#eadfc9]" : "border-border"}`}>
              <p className={`text-sm font-semibold ${attendee ? "text-[#2f2a24]" : "text-foreground"}`}>{selectedContact.name}</p>
              <p className={`text-xs ${attendee ? "text-[#8a8379]" : "text-muted"}`}>{selectedContact.role}</p>
            </div>

            <div ref={messagesContainerRef} className={`flex-1 overflow-y-auto p-4 space-y-3 min-h-0 ${attendee ? "bg-[#fffdf9]" : ""}`}>
              {loading && messages.length === 0 && (
                <p className={`text-sm ${attendee ? "text-[#8a8379]" : "text-muted"}`}>Loading...</p>
              )}

              {!loading && messages.length === 0 && (
                <p className={`text-sm ${attendee ? "text-[#8a8379]" : "text-muted"}`}>No messages yet. Say hello!</p>
              )}

              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`max-w-[70%] rounded-2xl p-3 text-sm ${msg.sender === user._id
                    ? attendee
                      ? "ml-auto bg-[#c49424] text-white"
                      : "ml-auto bg-gold text-background"
                    : attendee
                      ? "bg-white border border-[#eadfc9] text-[#2f2a24]"
                      : "bg-background text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            <div className={`p-4 border-t flex gap-2 ${attendee ? "border-[#eadfc9] bg-white" : "border-border"}`}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className={`flex-1 rounded-lg border p-2 text-sm outline-none ${attendee ? "border-[#eadfc9] bg-[#fffdf9] text-[#2f2a24] placeholder:text-[#a39b90] focus:border-[#c49424] focus:ring-1 focus:ring-[#c49424]" : "border-border bg-background text-foreground"}`}
              />

              <button onClick={handleSend} className={`rounded-lg px-4 py-2 text-sm font-medium ${attendee ? "bg-[#c49424] text-white hover:bg-[#b48620]" : "bg-gold text-background"}`}>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPanel;