import { useState, useEffect } from "react";
import axios from "axios";

// CONNECT TO LOCAL MICROSERVICES API ENDPOINTS
// API FOR GATEWAY LOGIN = 
const auth_APIGW_baseURL = import.meta.env.VITE_REACT_APP_AUTH_API_BASE_URL // + /endpoint

function Login({setLoggedIn, setUsername, handleSuccessfulLogin, returnToMenu}){

    //username const
    const [localUsername, setLocalUsername] = useState("")
    //password const
    const [password, setPassword] = useState("")
    //login sign up status const
    const [statusText, setStatusText] = useState("")
    //login sign up status const
    const [statusColor, setStatusColor] = useState("blue")
    //login menu cosnt
    const [defaultMenu, setDefaultMenu] = useState(true)
    
    // send user input via axios in http post req to express authRoutes router 
    // where details will be verified and if successful status returned -> setLoggedIn = true
    async function handleLogin(event){
        event.preventDefault()
        console.log("Login - handleLogin():")
        console.log(localUsername)
        console.log(password)

        if (localUsername.length === 0 || password.length ===0){
            setStatusColor('red')
            setStatusText("Please enter a username and password")
        }
        else if (localUsername.length < 5 || password.length < 5) {
            setStatusColor('red')
            setStatusText("Username and password must be at least 5 characters")
        }
        else{
            try{
                console.log("Login - handleLogin(): trying to make post request to login route")
                const response = await axios.post(`${auth_APIGW_baseURL}/login`, {
                    username: localUsername,
                    password
                },
                {   params: { mode: 'browser' },
                    withCredentials: true
                }
                )
                var result = response.data //response from backend
                console.log("Login - handleLogin():", result)
                if(result.success){
                    setLoggedIn(true)
                    setUsername(localUsername)
                    handleSuccessfulLogin()
                    console.log(`Logged in as ${localUsername} `,result.message)
                }   
                else{
                    setStatusColor('red')
                    setStatusText(result.message)
                }
            }
            catch(err){
                console.log("Error logging in", err)
            }
        }
    }

    // send user input via axios in http post req to express authRoutes router 
    // where details will be verified and added to DB, if successful status returned -> setLoggedIn = true
    async function handleSignUp(event){
        event.preventDefault()
        console.log(localUsername)
        console.log(password)

        if (localUsername.length === 0 || password.length ===0){
            setStatusColor('red')
            setStatusText("Please enter a username and password")
        }
        else if (localUsername.length < 5 || password.length < 5) {
            setStatusColor('red')
            setStatusText("Username and password must be at least 5 characters")
        }
        else{
            try{
                const response = await axios.post(`${auth_APIGW_baseURL}/signup`, {
                    username: localUsername,
                    password
                },
                {   params: { mode: 'browser' },
                    withCredentials: true
                }
                )
                var result = response.data //response from backend
                alert(result.message)
                if(result.success){
                    setLoggedIn(true)
                    setUsername(localUsername)
                    handleSuccessfulLogin()
                    console.log(`Logged in as ${localUsername} `,result.message)
                }   
                else{
                    setStatusColor('red')
                    setStatusText(result.message)
                }
            }
            catch(err){
                console.log("Error signing up", err)
            }
        }
        
    }

    // func to switch between loging and sign up UI
    function switchMenu(event){
        event.preventDefault();
        setDefaultMenu(prev => {
        const newState = !prev;  // Toggle the state properly
        if (newState) {
            setStatusText("");
        } else {
            setStatusColor("orange")
            setStatusText("Username and password must be at least 5 characters.");
        }
        return newState;
    });
    }

    return (
        <div className="login">
            <form>
            <input
              type="text"
              placeholder="Username"
              value={localUsername}
              onChange={(event) => setLocalUsername(event.target.value)}
              autoComplete="off"
            />
            <input
              type="text"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)
              }
              autoComplete = "off"
            />
            {defaultMenu ? <button onClick={handleLogin}>Login</button> : <button onClick={handleSignUp}>Sign Up</button>}
            {statusText && <h2 style={{color:statusColor}}>{statusText}</h2>}
            <button onClick={switchMenu}>{defaultMenu? "Sign Up Instead" : "Login Instead"}</button>
            <button onClick={returnToMenu}>Return To Menu</button>
          </form>
        </div>
    );
}

export default Login