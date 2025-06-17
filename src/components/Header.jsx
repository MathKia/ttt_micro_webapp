function Header({endState, mark, username, players, turn, playComputer, turnMessage, winMessage}){
    return(
        <>
        <header className="font">
        <h1>
        {players.length === 2
        ? `${players[0]} vs ${players[1]}` 
        : username 
        ? `Welcome ${username}!` 
        : "Tic Tac Toe!"}
        </h1>

        <h2>
        {playComputer 
         ? (endState ? winMessage : turnMessage) 
         : (endState 
            ? endState 
            : mark !== "" 
            ? (turn 
              ? `You're ${mark} - Your turn` 
              : `You're ${mark} - Opponent's turn`) 
              : "")
              }
        </h2>
        </header>
        </>
    )
}

export default Header;