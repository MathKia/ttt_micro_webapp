// Join room component -> shows input to enter room and button to send room to server to create room and add user to it
// setRoom = props useState from APP, passes user input and sets the room state 
// joinRoom = props method from APP, when clicked triggers joinRoom APP func
// cancel = props method from APP, when clicked triggers cancel APP func
// isJoining = props useState from APP, joinRoom funct sets it to true
// logout = props method from APP, when clicked triggers logout APP func


function JoinRoom({ room, setRoom, joinRoom, isJoining, logout, cancel }) {
    return (
      <div className="join-room">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={room}
          onChange={(event) => setRoom(event.target.value)}
        />
        {!isJoining.state && ( // Only show if not joining
          <button onClick={joinRoom}>Join Room</button>
        )}
        <h2>{isJoining.statusMessage}</h2>
        {isJoining.state &&
        <>
        <button onClick={cancel}>Cancel</button>
        </>
        }
        <button onClick={logout}>Log Out</button>
      </div>
    );
  }
  
  export default JoinRoom;
  
