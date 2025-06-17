// Join room component -> shows input to enter room and button to send room to server to create room and add user to it
// setRoom = props useState from APP, passes user input and sets the room state 
// joinRoom = props method from APP, when clicked triggers joinRoom APP func
// cancel = props method from APP, when clicked triggers cancel APP func
// isJoining = props useState from APP, joinRoom funct sets it to true
// logout = props method from APP, when clicked triggers logout APP func
import { useState } from "react";

function JoinRoom({ room, setRoom, joinRoom, isJoining, logout, cancel, returnToMenu, countdown }) {

  
  const [info, setInfo] = useState(false)

    return (
      <div className="join-room">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={room}
          onChange={(event) => setRoom(event.target.value)}
        />

        {info ? (
          <div className="info-overlay">
            <div className="info-box">
              <p className="info-text">
                🎮 <strong>How to Use the Game Room:</strong><br/><br/>
                <strong>1. Create a Room</strong><br/>
                Type a unique room name and press 'Join Room'. This books a private room for you and your friend.<br/><br/>

                <strong>2. Invite a Friend</strong><br/>
                Share the exact room name with your friend. They must enter the same name and press 'Join Room' within 3 minutes.<br/><br/>

                <strong>3. Wait for Your Friend</strong><br/>
                Once both of you join using the same room name, the game will start automatically.<br/><br/>

                <strong>4. Room Expiry</strong><br/>
                If no one joins within 3 minutes, the room will be canceled.<br/><br/>

                💡 <strong>Notes:</strong><br/>
                - You must invite someone you know manually, there is no auto-matchmaking.<br/>
                - Room names are case-sensitive.<br/>
                - Each room is temporary and expires if unused.
              </p>
              <button className="info-exit-button" onClick={() => setInfo(false)}>X</button>
            </div>
          </div>
        ) : (
          <button className="info-help-button" onClick={() => setInfo(true)}>Help</button>
        )}
        
        <h2>{isJoining.statusMessage}</h2>
        {!isJoining.state && ( // Only show if not joining
          <button class="join-btn btn1" onClick={joinRoom}>Join Room</button>
        )}
        
        {isJoining.state &&
        <>
        <h2>{`Cancellation of room if no opponent joins in : ${countdown} seconds `}</h2>
        <button class="join-btn btn1" onClick={cancel}>Cancel This Room</button>
        </>
        }
        <button class="join-btn btn2" onClick={returnToMenu}>Return To Menu</button>
        <button class="join-btn btn3" onClick={logout}>Log Out</button>   
      </div>
    );
  }
  
  export default JoinRoom;
  