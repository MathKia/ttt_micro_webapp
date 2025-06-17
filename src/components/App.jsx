import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Header from "./Header";
import Login from "./Login";
import JoinRoom from "./JoinRoom";
import GameGrid from "./GameGrid";
import VsPC from "./vsComputer";
import Menu from "./Menu";
import axios from "axios";

//client socket object

// CONNECT TO LOCAL MICROSERVICES API ENDPOINTS
// API FOR GATEWAY LOGIN = 
const auth_APIGW_baseURL = import.meta.env.VITE_REACT_APP_AUTH_API_BASE_URL // + /endpoint
// API FOR GATEWAY ROOM MAN = 
const room_APIGW_baseURL = import.meta.env.VITE_REACT_APP_ROOM_API_BASE_URL //+ /endpoint

function App() {

  // menu to let player vs computer or move on to login for online play
  // to play computer option
  const [isPlayComputer, setPlayComputer] = useState(false)
  // to go to login
  const [goToLogin, setGoToLogin] = useState(false)
  // to play online
  const [isPlayOnline, setPlayOnline] = useState(false)
  // move to login form of true
  const [showMenu, setShowMenu] = useState(true)

  
  // API GATEWAY for API based services (login, room joining)
  //user logged in ? -> show JOIN ROOM else LOGIN 
  const [isLoggedIn, setLoggedIn] = useState(false);
  // username -> set from LOGIN used in HEADER
  const [username, setUsername] = useState("");
  // room user chose in JOIN ROOM 
  const [room, setRoom] = useState("");
  // did user select room to join and waiting -> set from JOIN ROOM
  const [isJoining, setIsJoining] = useState({state: false, statusMessage:""});
  // countdown for if opponent is joining room, if not in time exit room
  const [countdown, setCountDown] = useState(180)

  //SOCKET based services (game, chat)
  const [socketToken, setSocketToken] = useState(); // JWT auth token short lived specifically for socket services
  const [serviceAdds, setServiceAdds] =  useState();
  const [gameSocket, setGameSocket] = useState(null); // game serv socket
  const [chatSocket, setChatSocket] = useState(null); // chat serv socket

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

  //when menu option clicked to vs computer
  function handlePlayComputer () {
    console.log(`vs PC button clicked`)
    setPlayComputer(true);
    setPlayOnline(false);
    setShowMenu(false)
  };
  
  // when vsPC option to exit game
  function handleExitComputerGame(){
    setPlayComputer(false)
    setShowMenu(true)
  }

  //when menu option to play online
  function handlePlayOnline () {
    console.log(`vs online button clicked`)
    setPlayComputer(false);
    setShowMenu(false)

    if (isLoggedIn){
      setPlayOnline(true)
    }else{
      setGoToLogin(true)
    }
  };

  function handleSuccessfulLogin(){
    setGoToLogin(false)
    setShowMenu(true)
  }

  function returnToMenu(){
    console.log('return to menu clicked')
    if (isLoggedIn && isJoining.state){
      leaveRoom()
    } else {
      setIsJoining({state:false, statusMessage:""});
      setRoom("")     
    }
    setGoToLogin(false)
    setPlayComputer(false)
    setPlayOnline(false)
    setShowMenu(true)
  }

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
  async function joinRoom() {
    console.log(`user ${username} wants to join room ${room}`)
    if (room !== "") {
      try{
        const res = await axios.post(`${room_APIGW_baseURL}/join`, 
          {
            room: room,
          },
          {   params: { mode: 'browser' },
              withCredentials: true //cookie will include req.user data in token which has username 
          } 
        )
        console.log("success in user joining room = ", res.data.success, res.data.message)
        setIsJoining({state: res.data.success, statusMessage: res.data.message})
        if (res.data.success){
          console.log(`recieved services addresses to create sockets: `, res.data.serviceAdds)
          setServiceAdds(res.data.serviceAdds)
          console.log("updated the service addresses ... moving to useEffect to create sockets to services")
          setSocketToken(res.data.socketToken)
          console.log("recieved short lived socket token for socket auth")
        }
      }
      catch(err){
        console.log(err.message)
        logout()
      }
   } 
   else{
    console.log(`not valid room`)
    setIsJoining({state: false, statusMessage: "Field is empty. Please enter a valid room name to join."})
  }
  }

  // countdown for join room lobby
  useEffect(() => {

    if (isGameOn){
      console.log(`opponent has joined, game is on, stopping countdown + moving to grid`)
      setCountDown(180)
      setIsJoining({state:false, statusMessage:""});
      return
    }

    if (countdown === 0) {
      console.log(`countdown ran out, cancelling room`)
      leaveRoom()
      setCountDown(180)
      setIsJoining({state:false, statusMessage:""});
      return
    };

    if (!isJoining.state){
      console.log(`user no longer joining room, cancelling countdown`)
      leaveRoom()
      setCountDown(180)
      return
    }

    const timer = setInterval(() => {
      setCountDown((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isJoining.state, isGameOn]);

  //cancel user from joining the room they selected, clean the input and set isJoining to false so they can input new room to join
  //server will remove the user from the room, delete the room if no users in it
  //user still remains in JOIN ROOM 
  async function leaveRoom() {
    if (room !== "") {

      console.log(`user ${username} wants to leave room ${room}. Sending room man service exit api request`)
      try{
        console.log(`${room_APIGW_baseURL}`)
        const res = await axios.post(`${room_APIGW_baseURL}/exit`, 
          {
          room: room,
          },
          {   params: { mode: 'browser' },
              withCredentials: true //cookie will include req.user data in token which has username 
          } 
        )
        console.log(`result of exit room request = ${res.data.success}: ${res.data.message}`)
        if (res.data.success){
          console.log(`user ${username} wants to leave room ${room}. Sending room exit event to game + chat sockets`)
          if (gameSocket){gameSocket.emit("exit", { room: room });}
          if (chatSocket){chatSocket.emit("exit", { room: room });}
          setIsJoining({state:false, statusMessage:""});
          setRoom("")     
        }
      }
      catch(err){
        console.log(err.statusMessage)
        logout()
      }
   } 
   else{console.log(`not valid room`)}
  }

  // logs user out from JOIN ROOM, returns them to LOGIN and disconnects from server
  // full reset -> GAME GRID reset, JOIN ROOM reset, LOGIN  reset
  async function logout() {
    try {
        if (gameSocket){gameSocket.disconnect()}
        if (chatSocket){chatSocket.disconnect()}

        const res = await axios.post(`${auth_APIGW_baseURL}/logout`, // url 
          {},                                                        // req body JSON obj
          { params: { mode: 'browser' },                            // config obj (query params, headers, credentials etc.)
            withCredentials: true                                   // do not need header for authorization, we are using cookie
          }
        );
        console.log(res.data.message)
        // reset();
        setUsername("");
        setGameOn(false);
        setLoggedIn(false);
        setShowMenu(true)
        setPlayOnline(false)
        setIsJoining({state:false, statusMessage:""});
        setRoom("");
        setPlayers([]);
    } catch (err) {
        console.error("Logout failed:", err);
    }
  }

  // fetch profile function
  async function fetchProfile() {
    console.log(`fetch profile called`)
    console.log(`isLoggedIn = ${isLoggedIn}`)
    try{ 
      const res = await axios.get(`${auth_APIGW_baseURL}/profile`, 
        { params: {mode: 'browser'},
          withCredentials: true 
        }
      );
      setUsername(res.data.username);
      setLoggedIn(true)
      setGoToLogin(false)
      ;}
    catch(err){
      console.error("Failed to fetch profile:", err.response.data.message);
      setLoggedIn(false);
      setGoToLogin(false)
    }
  }
  
  // updated when user is Logged In or no Longer Logged in
  useEffect(() => {
    fetchProfile()
  }, []);

  // update when serviceAdds is changed ... when there are serviceAdds we create the frontend to service socket connections
  useEffect(() => {
    console.log("Updated serviceAdds: ", serviceAdds);
    if (!serviceAdds?.chat || !serviceAdds?.game) return;
    
    console.log("chat service add:", serviceAdds.chat);
    console.log("game service add:", serviceAdds.game);

    // create and connect sockets
    const socketInstanceChat = io(serviceAdds.chat, {
      auth: {
        token: socketToken, //short lived socket token for socket server auth handshake
      }
    }); // socket client connect to chat serv, pass metadata of token under custom auth object to server socket handshake
    const socketInstanceGame = io(serviceAdds.game, {
      auth: {
        token: socketToken, //short lived socket token for socket server auth handshake
      }
    }); // socket client connect to game serv 

    setChatSocket(socketInstanceChat) // set chatSocket object to this socket connection
    setGameSocket(socketInstanceGame) // set gameSocket object to this socket connection

    // Emit joinRoom right after connection
    socketInstanceChat.emit('join_room', { room: room, username: username });
    socketInstanceGame.emit('join_room', { room: room, username: username });

     // 🧹 Clean up when component unmounts or serviceAdds change
    return () => {
      console.log("Disconnecting sockets...");
      socketInstanceChat.disconnect();
      socketInstanceGame.disconnect();
    };

  }, [serviceAdds]);

  // listens for the side effects/ messages from the server
  useEffect(() => {

    if (!gameSocket) return;

    console.log(`game socket listener set up`)

    gameSocket.on("room_data", (data)=>{
      console.log(`game service emitted room data event`)
      console.log(data.message, data.usernames)
      // joinedGame(data.success) // once game service confirmed room joined
    })

    //server sees the 2 players in the room successfully initialized -> change from JOIN ROOM to GAME GRID 
    //only occurs when room first created not for rematches after
    gameSocket.on("start_game", () => {
      console.log(`game started as conditions of set up met`)
      setGameOn(true);
      setIsJoining({state:false, statusMessage:""});
    });

    //server has 2 players in room and sends their usernames to display in HEADER
    gameSocket.on("players_in_room", (data) => {
      console.log(`2 players in room =`, data.usernames)
      setPlayers(data.usernames)
      setFull(true);
    });
    
    //server recieved rematch request from 1 player and notifies the other player of request in GAME GRID
    gameSocket.on("rematch_invite",()=>{
    console.log(`opponent wants a rematch`)
    setRematchState(<>Your opponent wants to rematch!<br />'Rematch' to accept.<br />'Exit' to decline.</>);
    })

    //server signals rematch on with same opp in same room -> reset GAME GRID for rematch
    gameSocket.on("rematch_on", (data) => {
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
    gameSocket.on("initial_setUp", (data) => {
      console.log(`recieved inital setup conditions for user`)
      setPlayer(data.player);
      setTurn(data.turn);
      setBlocks(data.gameState);
      setRound(data.round);
      if (!hasEmittedSetup.current) {
        gameSocket.emit("initial_setUp_complete");
        hasEmittedSetup.current = true;
      }
    });
    
    // server signals to each player in room updates from game play: new turn, new round, new grid blocks, winner or draw
    gameSocket.on("update_round", (data) => {
      console.log(`round update`)
      setRound(data.round)});
    gameSocket.on("update_grid", (data) => {
      console.log(`game grid update`)
      setBlocks(data.gameState)});
    gameSocket.on("turn_update", (data) => {
      console.log(`turn update`)
      setTurn(data.turn)});
    // server signals if winner found or 9 rounds finished and draw -> match is finished in GAME GRID -> prompt rematch or exit opts
    gameSocket.on("win_streak", (data) => {
      console.log(`winner found`)
      setWinningBlocks(data.winStreak);
      setIsFinished(true);
    });
    gameSocket.on("draw", () => {
      console.log(`draw found`)
      setIsFinished(true)});

    return () => {
      console.log("Cleaning up gameSocket listeners...");
      gameSocket.off("room_data");
      gameSocket.off("start_game");
      gameSocket.off("players_in_room");
      gameSocket.off("rematch_invite");
      gameSocket.off("rematch_on");
      gameSocket.off("initial_setUp");
      gameSocket.off("update_round");
      gameSocket.off("update_grid");
      gameSocket.off("turn_update");
      gameSocket.off("win_streak");
      gameSocket.off("draw");
    };
  }, [gameSocket]);

  //funct in GAME GRID when user clicks on any grid board button
  function blockClicked(blockId) {
    if (isFinished || blocks[blockId] !== "" || !turn) return;
    gameSocket.emit("client_move", { player: player, move: blockId });
  }

  //funct in GAME GRID when user clicks on rematch 
  function rematch(event) {
    event.target.disabled = true;
    gameSocket.emit("rematch_requested");
    setRematchState("Waiting for opponent to accept ...");
  }

  //funct in GAME GRID when user clicks on exit to return to JOIN ROOM
  //resets the GAME GRID and JOIN ROOM but still connected to server
  function exit(event) {
    event.target.disabled = true;
    leaveRoom()
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
        playComputer = {isPlayComputer}
      />
      
      {/* if not yet logged in show LOGIN else if logged in show JOIN ROOM/GAME GRID */}
      {showMenu && <Menu
      playComputer = {handlePlayComputer}
      playOnline = {handlePlayOnline}
      isLoggedIn={isLoggedIn}
      />}

      {isPlayComputer && <VsPC onExit={handleExitComputerGame}/>}

      {goToLogin && <Login 
                      setLoggedIn={setLoggedIn} 
                      setUsername={setUsername} 
                      handleSuccessfulLogin={handleSuccessfulLogin} 
                      returnToMenu={returnToMenu} //option to leave Login form and return to pre login menu
                      />}

      {isPlayOnline && 
        (!isGameOn 
          ? <JoinRoom
                room={room} //pass room useState variable as prop from APP to JOIN ROOM
                setRoom={setRoom} //pass setRoom useState func as prop from APP to JOIN ROOM
                joinRoom={joinRoom} //pass joinRoom func as prop from APP to JOIN ROOM
                isJoining={isJoining} //pass isJoining useState variable as prop from APP to JOIN ROOM
                cancel={leaveRoom} //pass cancel func as prop from APP to JOIN ROOM
                logout={logout} //pass logout func as prop from APP to JOIN ROOM
                returnToMenu={returnToMenu} //option to leave joinRoom form and return to post login menu
                countdown={countdown}
        />: <GameGrid
                blocks={blocks} //pass blocks useState variable as prop from APP to GAME GRID
                blockClicked={blockClicked} //pass blockClicked func as prop from APP to GAME GRID
                winningBlocks={winningBlocks} //pass winningBlocks useState variable as prop from APP to GAME GRID
                isGameOn={isGameOn} //pass isGameOn useState variable as prop from APP to GAME GRID
                isFinished={isFinished} //pass isFinished useState variable as prop from APP to GAME GRID
                rematch={rematch} //pass rematch func as prop from APP to GAME GRID
                exit={exit} //pass exit func as prop from APP to GAME GRID
                rematchState={rematchState} //pass rematchState useState variable as prop from APP to GAME GRID
                full={full} //pass full useState variable as prop from APP to GAME GRID
                chatSocket={chatSocket} //pass chat socket object as prop from APP to GAME GRID
                room={room} //pass room useState variable as prop from APP to GAME GRID
                username = {username}
        />
      )}
    </>
  );
}
  
export default App;
