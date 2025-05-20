function Button({ id, value, onBlockClicked, isGameOn, isWinningBlock }) {

    function handleClick() {
      if (isGameOn) {
        onBlockClicked(id);
      }
    }
  
    return (
      <button 
      className={`grid-button ${value === "X" ? "x" : value === "O" ? "o" : ""} ${isWinningBlock ? "win" : ""}`}
        onClick={handleClick}
        disabled={!isGameOn || value !== ""}
      >
        {value}
      </button>
    );
  }
  
  export default Button;