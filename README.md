# 🎮 Tic Tac Toe - Web Frontend (React + Vite)

This is the **web client** of a real-time online multiplayer Tic Tac Toe game, built with **React.js** and **Vite**. 
It connects to a Node.js backend that uses a **microservices architecture** to enable secure login, matchmaking, gameplay, and in-game chat — all in real time.

✅ Built for browsers  
✅ Uses JWT authentication  
✅ Supports rematch, chat, and game invites  
✅ Hosted on AWS (S3 + CloudFront)

---

## 🌐 Live Demo

🔗 [Play Now](https://kiaramathuraportfolio.com)  

---

## 🚀 Features

- ✅ JWT login and signup
- ✅ Verse Computer (offline/online)
- ✅ Verse opponent in game room for real-time turn-based play using WebSockets
- ✅ Persistent in-room chat with timestamps
- ✅ Rematch functionality
- ✅ Responsive UI
- ✅ Authenticated access only (via token)

---

## 🧠 Tech Stack

- **React.js + Vite**
- **Socket.IO (client)**
- **Axios** for REST API calls
- **JWT (via browser cookies)**
- **CSS** 
- Hosted on **S3 + CloudFront**

---

## 📦 Installation & Setup (Local Development)

### 🛠 Prerequisites

- Node.js ≥ 18.x
- Backend running locally (see [Backend Repo](https://github.com/MathKia/ttt_microservices_backend.git))

---

### ⬇️ Clone the Repo

  git clone https://github.com/your-username/ttt_micro_webapp.git
  cd ttt_micro_webapp
  
📥 Install Dependencies

  npm install

⚙️ Environment Variables
Create a .env file in the root of the project:
  VITE_REACT_APP_AUTH_API_BASE_URL = http://localhost:4000/api/auth
  VITE_REACT_APP_ROOM_API_BASE_URL = http://localhost:4000/api/room

▶️Start Development Server

  npm run dev

🔐 Auth Mode Logic
  On login/signup, a JWT is issued and stored in the browser cookies.
  Protected routes (like /join to join a game room) require valid JWT.
  If token is missing or expired, user is redirected to /login.

🔗 Dependencies on Backend
  This frontend depends on the following microservices (via the backend API gateway):
    - /api/auth for login, signup, profile, logout
    - /api/room for room join and room exit
    - Socket.IO (/chat, /game) for messaging and gameplay
  Make sure the backend is running before starting this client.

  The frontend has a built in 'verse computer' script to allow for playing tic tac toe against the computer offline.

🧪 Testing
    Test locally with:
     - two browser windows 
     - browser + incognito mode
     - browser + another platform frontend (desktop/ mobile)
     - you can verse your own user profile or create another one to verse
  
☁️ Deployment
This app was built and deployed using the following flow:
  1. npm run build → generates /dist folder
  2. Upload /dist to S3 bucket
  3. Configure CloudFront distribution
  4. Use Route 53 + HTTPS via ACM/Certbot

📁 Folder Structure

ttt_micro_webapp/
├── src/
│   ├── components/        # Buttons, ChatBox, GameBoard, etc.
|   │   ├── App.jsx
|   |   ├── Button.jsx
|   |   ├── Chat.jsx
|   |   ├── GameGrid.jsx
|   |   ├── Header.jsx
|   |   ├── JoinRoom.jsx
|   |   ├── Login.jsx
│   └── main.jsx
├── public/
|   ├── styles.css
├── .env
├── index.html
├── package.json
├── vite.config.js
└── README.md

🙋 Contact
Developed by MathKia
📧 Email: mathkia00+github@gmail.com or via https://kiaramathuraportfolio.com 

For production setup or cloud deployment guidance, please contact directly.
