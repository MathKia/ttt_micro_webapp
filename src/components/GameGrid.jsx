//Game grid is the entire gameboard + chat bar display

import Button from "./Button";
import Chat from "./Chat";

function GameGrid({ 
  blocks, 
  blockClicked, 
  winningBlocks, 
  isGameOn, 
  isFinished, 
  rematch, 
  exit, 
  rematchState, 
  full, 
  chatSocket, 
  room,
  username 
}) 
{
  return (
    <>
      <div className="grid-container">
        {blocks.map((mark, index) => (
          <Button
            key={index}
            id={index}
            value={mark}
            onBlockClicked={blockClicked}
            isGameOn={isGameOn}
            isWinningBlock={winningBlocks.includes(index)}
          />
        ))}
      </div>
      
      <Chat chatSocket={chatSocket} roomNumber={room} username={username}/>

      <div className="grid-menu">
        {isFinished && (
          <>
            <button onClick={rematch} disabled={!full}>Rematch</button>
            <h2>{rematchState}</h2>
          </>
        )}
        {(!full || isFinished) && (
          <>
            <button onClick={exit}>Exit</button>
            {!full && <h2>Your opponent has left the game. Exit to return to menu</h2>}
          </>
        )}
      </div>
    </>
  );
}

export default GameGrid;
