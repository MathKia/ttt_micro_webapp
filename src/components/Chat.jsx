import { useEffect, useState, useRef} from "react"

function Chat({socket, roomNumber, username}) {

  const [message, setMessage] = useState("")
  const [messageHistory, setMessageHistory] = useState([])
  const maxChars = 150;
  const messagesEndRef = useRef(null);

  function sendMessage (){
    if (message.trim() !== "") {
      socket.emit("send_message", {message: message, room: roomNumber});
      setMessage(""); // Clear input after sending
    }
  }

  function autoExpand(event) {
    event.target.style.height = "auto"; // Reset height
    event.target.style.height = event.target.scrollHeight + "px"; // Set new height
  }

  useEffect(() => {
    console.log("Setting up listener...");
    socket.on("updated_messages", (data) => {
      setMessageHistory((prevMessages) => [...prevMessages, data[data.length - 1]]); // Append only the new message
      console.log("Received:", data[data.length - 1]);
    });

  
    return () => {
      console.log("Removing listener...");
      socket.off("updated_messages");  // ✅ Prevents duplicate listeners
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageHistory]);
  

  return (
    <div className="chat-container">
      <div className="chat-messages">
      {messageHistory.map((msg, index) => {
        const [user, text, time] = msg;
        const isSender = user == username; // Check if message is from the logged-in user
        console.log(`is sender of message = ${isSender}, user = ${user}, username = ${username}`)
        return (
          <div 
            key={index} 
            className={`chat-bubble ${isSender ? "sent" : "received"}`}
          >
            <strong>{user}</strong>: {text} 
            <span className="chat-time">{time}</span>
            <div ref={messagesEndRef}></div>
          </div>
            );
          })}
      </div>

      <div className="chat-input">
        <textarea
          placeholder="Write message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onInput={autoExpand} 
          maxLength={maxChars}  // Limits input to 200 characters
        />
        <p>{message.length}/{maxChars}</p> {/* Show counter */}
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
