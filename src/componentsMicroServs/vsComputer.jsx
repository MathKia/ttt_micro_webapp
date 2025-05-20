import { useState, useEffect } from 'react';
import Button from './Button';
import Header from './Header';

function VsPC({onExit}) {
  const [blocks, setBlocks] = useState(Array(9).fill(""));
  const [isGameOn, setIsGameOn] = useState(true);
  const [winningBlocks, setWinningBlocks] = useState([]);
  const [playerMark, setPlayerMark] = useState("X");
  const [computerMark, setComputerMark] = useState("O");
  const [turn, setTurn] = useState(true); // Player starts
  const [turnMessage, setTurnMessage] = useState("");
  const [gameResult, setGameResult] = useState("");
  const [rematchCount, setRematchCount] = useState(0);

  // Track turn message updates
  useEffect(() => {
    // Only update the message if the game is active and turn is not null
    if (turn === null || !isGameOn) return;
    setTurnMessage(turn ? "Your turn!" : "Computer's turn!");
  }, [turn, isGameOn]);

  // Set up marks and turn on rematch
  useEffect(() => {
    if (!rematchCount) return;

    if (rematchCount % 2 === 0) {
      setPlayerMark("X");
      setComputerMark("O");
      setTurn(true);
    } else {
      setPlayerMark("O");
      setComputerMark("X");
      setTurn(false);
    }
  }, [rematchCount]);

  // Separate effect to trigger computer move after the mark is set
  useEffect(() => {
     if (!turn) {
    makeComputerMove([...blocks]);
    }
   }, [computerMark]);

  // Check for a winner
  function checkWinner(newBlocks) {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6],           // Diagonals
    ];
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (newBlocks[a] && newBlocks[a] === newBlocks[b] && newBlocks[a] === newBlocks[c]) {
        setWinningBlocks(pattern);
        setIsGameOn(false);
        setGameResult(newBlocks[a] === computerMark ? 'Computer Wins!' : 'You Won!');
        return true;
      }
    }
    if (!newBlocks.includes("")) {
      setIsGameOn(false);
      setGameResult("Draw!");
      return true;
    }
    return false;
  }

  // Computer move with delay
    function makeComputerMove(newBlocks) {

        //list what blocks are not yet filled
        const available = newBlocks
            .map((mark, index) => (mark === "" ? index : null))
            .filter((index) => index !== null);

        // Winning patterns
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]            // Diagonals
        ];

        // Check for a winning or blocking move
        function findBestMove (mark){
            for (let pattern of winPatterns) {
                const [a, b, c] = pattern;
                const values = [newBlocks[a], newBlocks[b], newBlocks[c]];
                if (values.filter(v => v === mark).length === 2 && values.includes("")) {
                    return pattern[values.indexOf("")];
                }
            }
            return null;
        };

        function makeMove (index){
            setTimeout(() => {
                newBlocks[index] = computerMark;
                setBlocks([...newBlocks]);
                if (!checkWinner(newBlocks)) setTurn(true);
            }, 1000); // 1 second delay
        };

        // 1. Try to win
        let bestMove = findBestMove(computerMark);
        if (bestMove !== null) {
            makeMove(bestMove);
            return;
        }

        // 2. Try to block the opponent
        bestMove = findBestMove(playerMark);
        if (bestMove !== null) {
            makeMove(bestMove);
            return;
        }

        // 3. Take the center if available
        if (newBlocks[4] === "") {
            makeMove(4);
            return;
        }

        // 4. Take a corner if available
        const corners = [0, 2, 6, 8];
        for (let corner of corners) {
            if (newBlocks[corner] === "") {
                makeMove(corner);
                return;
            }
        }

        // 5. Fallback: Choose any random available space
        if (available.length > 0) {
            const randomIndex = Math.floor(Math.random() * available.length);
            makeMove(available[randomIndex]);
        }
    }

  // Handle player move
  function blockClicked(index) {
    if (!isGameOn || blocks[index] !== "" || !turn) return;

    const newBlocks = [...blocks];
    newBlocks[index] = playerMark;
    setBlocks(newBlocks);

    if (!checkWinner(newBlocks)) {
      setTurn(false);
      makeComputerMove(newBlocks);
    }
  }

  // Start a new game
  function rematch() {
    setBlocks(Array(9).fill(""));
    setWinningBlocks([]);
    setIsGameOn(true);
    setGameResult("");
    setRematchCount((prev) => prev + 1);
  }

// Exit the game
  function exit() {
    console.log('exit button called');
    setBlocks(Array(9).fill(""));
    setWinningBlocks([]);
    setIsGameOn(false);  // Explicitly set to false
    setGameResult("");
    setRematchCount(0);
    setTurn(null);
    setTurnMessage("");  // Directly clear the message
    setPlayerMark("");
    setComputerMark("");
    onExit()
  }

  return (
    <>
      <Header
        endState={gameResult}
        turnMessage={turnMessage}
        winMessage={gameResult}
        playComputer={true}
        players={0}
      />

      <div className="grid-container">
        {blocks.map((mark, index) => (
          <Button
            key={index}
            id={index}
            value={mark}
            onBlockClicked={() => blockClicked(index)}
            isGameOn={isGameOn}
            isWinningBlock={winningBlocks.includes(index)}
          />
        ))}
      </div>

      <div className="grid-menu">
        {!isGameOn && (
          <>
            <button onClick={rematch}>Rematch</button>
          </>
        )}
        <button onClick={exit}>Exit</button>
      </div>
    </>
  );
}

export default VsPC;
