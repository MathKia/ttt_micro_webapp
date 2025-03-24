import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Header from "./Header";
import Login from "./Login";
import JoinRoom from "./JoinRoom";
import GameGrid from "./GameGrid";
import axios from "axios";

//client socket object
const socket = io("https://api.kiaramathuraportfolio.com");
const URL = "https://api.kiaramathuraportfolio.com/api/auth"

function App() {

  //user logged in ? -> show JOIN ROOM else LOGIN 
  const [isLoggedIn, setLoggedIn] = useState(false);
  // username -> set from LOGIN used in HEADER
  const [username, setUsername] = useState("");
  // room user chose in JOIN ROOM 
  const [room, setRoom] = useState("");
  // did user select room to join and waiting -> set from JOIN ROOM
  const [isJoining, setIsJoining] = useState({state: false, statusMessage:""});

  // state of 9 grid blocks -> recieved from SERVER sent to GAME GRID
  const [blocks, setBlocks] = useState([]);
  // is it users turn -> recieved from SERVER sent to GAME GRID + used in HEADER
  const [turn, setTurn] = useState();
  // user is X or O -> recieved from SERVER sent to GAME GRID + HEADER
  const [player, setPlayer] = useState("");
  // out of 9 possible rounds in match -> recieved from SERVER sent to GAME GRID
  const [round, setRound] = useState();
  // is there 2 players in the game room ? if false prompts user to exit -> recieved from SERVER sent to GAME GRID
  const [full, setFull] = useState();
  // the usernames of players -> recieved from SERVER sent to GAME GRID + used in HEADER
  const [players, setPlayers] = useState([]);
  // the player has successfully initalised and signaled back to server from APP
  const hasEmittedSetup = useRef(false);
  // both players set up so game ready to start ? GAME GRID show -> recieved from SERVER sent to GAME GRID
  const [isGameOn, setGameOn] = useState(false);
  // state of winning block streak -> recieved from SERVER sent to GAME GRID + used in HEADER
  const [winningBlocks, setWinningBlocks] = useState([]);
  // match is finished (draw/win) -> prompts rematch/exit -> recieved from SERVER sent to GAME GRID
  const [isFinished, setIsFinished] = useState(false);
  // text message on rematch state -> recieved from SERVER sent to GAME GRID
  const [rematchState, setRematchState] = useState("");

  // reset necessary variables in GAME GRID -> clean game grid, persist chat and persistroom session
  function reset() {
    hasEmittedSetup.current = false;
    setBlocks([]);
    setTurn();
    setWinningBlocks([]);
    setIsFinished(false);
    setPlayer("");
    setRound();
    setRematchState("");
  }

  //get user inputted room in JOIN ROOM, emit to server, do not allow user to join another room
  // for first ever join room after login, creates connection to server and persist till user logs out
  function joinRoom() {
    if (room !== "") {
      socket.emit("join_room", { room: room, username: username });
    }
  }


  //cancel user from joining the room they selected, clean the input and set isJoining to false so they can input new room to join
  //server will remove the user from the room, delete the room if no users in it
  //user still remains in JOIN ROOM 
  function cancel() {
    if (room !== "") {
      socket.emit("exit", { room: room });
      setIsJoining({state:false, statusMessage:""});
      setRoom("")
    }
  }

  // logs user out from JOIN ROOM, returns them to LOGIN and disconnects from server
  // full reset -> GAME GRID reset, JOIN ROOM reset, LOGIN  reset
  async function logout() {
    try {
        const res = await axios.post(`${URL}/logout?mode=browser`, {}, { withCredentials: true });
        console.log(res.data.message)
        reset();
        setUsername("");
        setGameOn(false);
        setLoggedIn(false);
        setIsJoining(false);
        setRoom("");
        setPlayers([]);
    } catch (err) {
        console.error("Logout failed:", err);
    }
  }

  // updated when user is Logged In or no Longer Logged in
  useEffect(() => {
    async function fetchProfile() {
      try{ 
        const res = await axios.get(`${URL}/profile?mode=browser`, { withCredentials: true });
        setUsername(res.data.username);
        setLoggedIn(true);}
      catch(err){
        console.error("Failed to fetch profile:", err);
        setLoggedIn(false);
      }
    }

    fetchProfile()
  }, []);

  // listens for the side effects/ messages from the server
  useEffect(() => {

    socket.on("room_data", (data)=>{
      if (data.success){
        setIsJoining({state:true, statusMessage:"Waiting for another opponent to join ..."});
      }else{
        setIsJoining({state:false, statusMessage:"Room is full. Pick another one."});
      }
    })
    //server sees the 2 players in the room successfully initialized -> change from JOIN ROOM to GAME GRID 
    //only occurs when room first created not for rematches after
    socket.on("start_game", () => {
      setGameOn(true);
      setIsJoining({state:false, statusMessage:""});
    });

    //server has 2 players in room and sends their usernames to display in HEADER
    socket.on("players_in_room", (data) => {
      setPlayers(data.usernames)
      setFull(true);
    });
    
    //server recieved rematch request from 1 player and notifies the other player of request in GAME GRID
    socket.on("rematch_invite",()=>{
    setRematchState(<>Your opponent wants to rematch!<br />'Rematch' to accept.<br />'Exit' to decline.</>);
    })

    //server signals rematch on with same opp in same room -> reset GAME GRID for rematch
    socket.on("rematch_on", (data) => {
      if (data.rematchOn){
        console.log("rematch is on setting up variables");
        reset()
      } 
      else{
        console.log("rematch is off");
        setFull(false)
        setRematchState("Rematch not possible");
      }
    });

    //server has sent initial set up for both players in room (are you X or O, is it your turn, grid blocks empty, round 0)
    //once player successfully updated their variables they return signal to server to notify it
    socket.on("initial_setUp", (data) => {
      setPlayer(data.player);
      setTurn(data.turn);
      setBlocks(data.gameState);
      setRound(data.round);
      if (!hasEmittedSetup.current) {
        socket.emit("initial_setUp_complete");
        hasEmittedSetup.current = true;
      }
    });
    
    // server signals to each player in room updates from game play: new turn, new round, new grid blocks, winner or draw
    socket.on("update_round", (data) => setRound(data.round));
    socket.on("update_grid", (data) => setBlocks(data.gameState));
    socket.on("turn_update", (data) => setTurn(data.turn));
    // server signals if winner found or 9 rounds finished and draw -> match is finished in GAME GRID -> prompt rematch or exit opts
    socket.on("win_streak", (data) => {
      setWinningBlocks(data.winStreak);
      setIsFinished(true);
    });
    socket.on("draw", () => setIsFinished(true));
  }, []);

  //funct in GAME GRID when user clicks on any grid board button
  function blockClicked(blockId) {
    if (isFinished || blocks[blockId] !== "" || !turn) return;
    socket.emit("client_move", { player: player, move: blockId });
  }

  //funct in GAME GRID when user clicks on rematch 
  function rematch(event) {
    event.target.disabled = true;
    socket.emit("rematch_requested");
    setRematchState("Waiting for opponent to accept ...");
  }

  //funct in GAME GRID when user clicks on exit to return to JOIN ROOM
  //resets the GAME GRID and JOIN ROOM but still connected to server
  function exit(event) {
    event.target.disabled = true;
    socket.emit("exit", { room: room });
    reset();
    setRoom("");
    setGameOn(false);
    setPlayers([]);
  }

  return (
    <>
      {/* always show header, dynamically change for each stage: LOGIN, JOIN ROOM, GAME GRID */}
      <Header 
        endState={winningBlocks.length > 0 ? `Player ${blocks[winningBlocks[0]]} wins!` : (round === 9) ? "It's a draw!" : ""}
        mark={player}
        username={username}
        players={players}
        turn={turn}
      />
      {/* if not yet logged in show LOGIN else if logged in show JOIN ROOM/GAME GRID */}
      {!isLoggedIn ? 
      ( 
        <Login setLoggedIn={setLoggedIn} setUsername={setUsername} />
      ) : 
      (
        <>
          {/* if user not yet joined a room or ready to begin game show JOIN ROOM else show GAME GRID */}
          {!isGameOn ? 
          (
            <JoinRoom 
              room={room} //pass room useState variable as prop from APP to JOIN ROOM
              setRoom={setRoom} //pass setRoom useState func as prop from APP to JOIN ROOM
              joinRoom={joinRoom} //pass joinRoom func as prop from APP to JOIN ROOM
              isJoining={isJoining} //pass isJoining useState variable as prop from APP to JOIN ROOM
              cancel={cancel} //pass cancel func as prop from APP to JOIN ROOM
              logout={logout} //pass logout func as prop from APP to JOIN ROOM
            />
          ) : 
          (
            <GameGrid
              blocks={blocks} //pass blocks useState variable as prop from APP to GAME GRID
              blockClicked={blockClicked} //pass blockClicked func as prop from APP to GAME GRID
              winningBlocks={winningBlocks} //pass winningBlocks useState variable as prop from APP to GAME GRID
              isGameOn={isGameOn} //pass isGameOn useState variable as prop from APP to GAME GRID
              isFinished={isFinished} //pass isFinished useState variable as prop from APP to GAME GRID
              rematch={rematch} //pass rematch func as prop from APP to GAME GRID
              exit={exit} //pass exit func as prop from APP to GAME GRID
              rematchState={rematchState} //pass rematchState useState variable as prop from APP to GAME GRID
              full={full} //pass full useState variable as prop from APP to GAME GRID
              socket={socket} //pass socket object as prop from APP to GAME GRID
              room={room} //pass room useState variable as prop from APP to GAME GRID
              username = {username}
            />
          )}
        </>
      )}
    </>
  );
}

export default App;
