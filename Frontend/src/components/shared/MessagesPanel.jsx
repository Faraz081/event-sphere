import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { fetchContacts, fetchConversation, sendMessage, fetchUnreadCounts, markAsRead } from "@/store/slices/messageSlice";

const MessagesPanel = () => {
  const dispatch = useDispatch();
  const { contacts, conversation, unread, loading } = useSelector((state) => state.message);
  const { user } = useSelector((state) => state.auth);
  const [selectedContact, setSelectedContact] = useState(null);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    dispatch(fetchContacts());
    dispatch(fetchUnreadCounts());
    const interval = setInterval(() => dispatch(fetchUnreadCounts()), 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim()) return;
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
    <div className="rounded-3xl border border-border bg-surface overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[70vh]">
      <div className="border-r border-border overflow-y-auto">
        <h2 className="p-4 text-sm font-semibold text-foreground border-b border-border">Contacts</h2>
        {contacts.length === 0 && <p className="p-4 text-sm text-muted">No contacts yet.</p>}
        {contacts.map((contact) => {
          const count = unreadCountFor(contact._id);
          return (
            <button
              key={contact._id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full text-left p-4 border-b border-border hover:bg-background flex items-center justify-between ${selectedContact?._id === contact._id ? "bg-background" : ""}`}
            >
              <div>
                <p className="text-sm font-medium text-foreground">{contact.name}</p>
                <p className="text-xs text-muted">{contact.role} {contact.companyName ? `· ${contact.companyName}` : ""}</p>
              </div>
              {count > 0 && (
                <span className="ml-2 flex-shrink-0 rounded-full bg-gold text-background text-xs font-semibold w-5 h-5 flex items-center justify-center">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="md:col-span-2 flex flex-col min-h-0">
        {!selectedContact && (
          <div className="flex-1 flex items-center justify-center text-sm text-muted">Select a contact to start messaging</div>
        )}

        {selectedContact && (
          <>
            <div className="p-4 border-b border-border">
              <p className="text-sm font-semibold text-foreground">{selectedContact.name}</p>
              <p className="text-xs text-muted">{selectedContact.role}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {loading && messages.length === 0 && <p className="text-sm text-muted">Loading...</p>}
              {!loading && messages.length === 0 && <p className="text-sm text-muted">No messages yet. Say hello!</p>}
              {messages.map((msg) => (
                <div key={msg._id} className={`max-w-[70%] rounded-2xl p-3 text-sm ${msg.sender === user._id ? "ml-auto bg-gold text-background" : "bg-background text-foreground"}`}>
                  {msg.content}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-border flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-border bg-background p-2 text-sm text-foreground"
              />
              <button onClick={handleSend} className="rounded-lg bg-gold text-background px-4 py-2 text-sm font-medium">Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPanel;