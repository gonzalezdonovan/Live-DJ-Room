import express from "express"
import { createServer } from "node:http"
import { Server } from "socket.io"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = createServer(app)
const io = new Server(server)

const port = process.env.PORT || 3000

const songsPath = path.join(__dirname, "data/songs.json")
const statePath = path.join(__dirname, "data/state.json")

let users = []
let songs = fs.existsSync(songsPath)
  ? JSON.parse(fs.readFileSync(songsPath))
  : []

let state = fs.existsSync(statePath)
  ? JSON.parse(fs.readFileSync(statePath))
  : { playQueue: [], currentSong: null }

let adminId = null
let mode = "voting"

app.use(express.static(path.join(__dirname, "client")))

io.on("connection", socket => {

  socket.on("register", username => {
    socket.username = username

    users.push({
      id: socket.id,
      name: username
    })

    if (!adminId) adminId = socket.id
    emitState()
  })

  socket.on("add-song", ({ youtubeId, title }) => {

    const song = {
      id: Date.now(),
      title,
      youtubeId,
      votes: 0,
      voters: [],
      addedBy: socket.username
    }

    if(mode === "free"){
      state.playQueue.push(song)
      if(!state.currentSong){
        playNextSong()
      }
    } else {
      songs.push(song)
      saveSongs()
    }

    emitState()
  })

  socket.on("vote", songId => {

    if(mode !== "voting") return

    const song = songs.find(s => s.id === songId)
    if (!song) return
    if (song.voters.includes(socket.id)) return

    song.votes++
    song.voters.push(socket.id)

    const requiredVotes = Math.ceil(users.length * 0.5)

    if (song.votes >= requiredVotes) {
      state.playQueue.push(song)
      songs = songs.filter(s => s.id !== songId)
      saveSongs()

      if (!state.currentSong) {
        playNextSong()
      }
    }

    emitState()
  })

  // CONTROLES DEL ADMIN

  socket.on("admin-skip", () => {
    if(socket.id !== adminId) return
    playNextSong()
    emitState()
  })

  socket.on("admin-restart", () => {
    if(socket.id !== adminId) return
    io.emit("restart-song")
  })

  socket.on("admin-pause", () => {
    if(socket.id !== adminId) return
    io.emit("pause-song")
  })

  socket.on("admin-play", () => {
    if(socket.id !== adminId) return
    io.emit("play-song")
  })

  socket.on("admin-clear", () => {
    if(socket.id !== adminId) return
    state.playQueue = []
    songs = []
    state.currentSong = null
    saveSongs()
    saveState()
    emitState()
  })

  socket.on("toggle-mode", () => {
    if(socket.id !== adminId) return
    mode = mode === "voting" ? "free" : "voting"
    emitState()
  })

  socket.on("song-ended", () => {
    if(socket.id !== adminId) return
    playNextSong()
    emitState()
  })

  socket.on("disconnect", () => {
    users = users.filter(u => u.id !== socket.id)
    if (socket.id === adminId) {
      adminId = users[0]?.id || null
    }
    emitState()
  })
})

function playNextSong(){
  if(state.playQueue.length > 0){
    state.currentSong = state.playQueue.shift()
  } else {
    state.currentSong = null
  }
  saveState()
}

function emitState(){
  io.emit("state-update", {
    users,
    songs,
    playQueue: state.playQueue,
    currentSong: state.currentSong,
    adminId,
    mode
  })
}

function saveSongs(){
  fs.writeFileSync(songsPath, JSON.stringify(songs))
}

function saveState(){
  fs.writeFileSync(statePath, JSON.stringify(state))
}

server.listen(port, () =>
  console.log("🎧 DJ Room running on port", port)
)
