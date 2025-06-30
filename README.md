# ✏️ Scibble — Real-Time Multiplayer Drawing & Guessing Game

Scibble is a real-time multiplayer scribble drawing game built for the **Bolt.New Hackathon**. Players take turns drawing a word on a shared canvas while others try to guess it through chat. It's fast, fun, creative, and competitive — just like Pictionary, but online and fully interactive.


## 🚀 Features

### 🎨 Gameplay
- Real-time canvas with smooth drawing for the current player
- Guess the drawing via chat before time runs out
- Automatic hint reveals based on selected settings
- Turn-based rounds where every player gets a chance to draw
- Smart scoring: faster guesses earn more points

### 🧑‍🎨 Avatar Customization
- Choose your avatar's **eyes**, **mouth**, and **color**
- Animated eyes and mouth for a fun personalized touch

### 🛠️ Custom Game Settings
- Set number of players (2–20)
- Customize draw time (15–240 seconds)
- Choose number of rounds and hints
- Add your own custom word list (min. 10 words)
- Enable “Custom Words Only” mode

### 🧩 Tools for Drawing
- Color palette
- Undo / Redo
- Eraser
- Bucket fill tool

### 💬 Chat + Feedback System
- Real-time guessing via chat
- Feedback for "close guesses"
- Live activity feed (join/leave/guess notifications)

---

## 🖥️ Tech Stack

| Tech         | Description                         |
|--------------|-------------------------------------|
| React.js     | Frontend UI                         |
| Socket.IO    | Real-time drawing, guessing, sync   |
| Node.js      | Backend server                      |
| Tailwind CSS | Styling & responsive layout         |

---

## 📦 Installation

```bash
git clone https://github.com/Real-N34r/Scibble.git
cd Scibble
```
## 🔧 Backend
```
cd server
npm install
npm run dev
```
## 🎨 Frontend
```
cd client
npm install
npm run dev
```
