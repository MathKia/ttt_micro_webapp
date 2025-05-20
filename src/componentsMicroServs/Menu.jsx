function Menu({playComputer, playOnline, isLoggedIn}) {
    console.log("Menu is rendering");
    
    return (
        <div className="menu">
            <button onClick={playComputer}>VS Computer</button>
            <button onClick={playOnline}>{!isLoggedIn?'Login To VS Online':'VS Online Opponent'}</button>
        </div>
    );
}
export default Menu