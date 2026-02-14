const socket = io()

let player
let playerReady = false
let currentVideoLoaded = null

const username = prompt("Enter your name:")
socket.emit("register", username)

const userCount = document.getElementById("userCount")
const songsDiv = document.getElementById("songs")
const playQueueDiv = document.getElementById("playQueue")
const nowPlayingDiv = document.getElementById("nowPlaying")
const adminControls = document.getElementById("adminControls")
const modeDisplay = document.getElementById("modeDisplay")

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '100%',
    videoId: '',
    playerVars: { autoplay: 1 },
    events: {
      onReady: () => { playerReady = true },
      onStateChange: onPlayerStateChange,
      onError: () => {
        socket.emit("song-ended")
      }
    }
  })
}

function onPlayerStateChange(event){
  if(event.data === YT.PlayerState.ENDED){
    socket.emit("song-ended")
  }
}

socket.on("pause-song", () => player?.pauseVideo())
socket.on("play-song", () => player?.playVideo())
socket.on("restart-song", () => {
  if(player){
    player.seekTo(0)
    player.playVideo()
  }
})

socket.on("state-update", state => {

  userCount.innerText = `👥 ${state.users.length} users`

  modeDisplay.innerHTML = `
    🎛 Mode: <strong>${state.mode.toUpperCase()}</strong>
  `

  if(state.adminId === socket.id){
    modeDisplay.innerHTML += `
      <button onclick="toggleMode()">Switch Mode</button>
    `
  }

  if(state.currentSong){
    nowPlayingDiv.innerHTML = `
      <strong>${state.currentSong.title}</strong>
      <br><small>Added by ${state.currentSong.addedBy}</small>
    `

    if(playerReady && currentVideoLoaded !== state.currentSong.youtubeId){
      currentVideoLoaded = state.currentSong.youtubeId
      player.loadVideoById(state.currentSong.youtubeId)
    }
  } else {
    nowPlayingDiv.innerText = "Nothing playing"
  }

  if(state.adminId === socket.id){
    adminControls.innerHTML = `
      <div class="admin-buttons">
        <button onclick="restart()">⏮ Restart</button>
        <button onclick="skip()">⏭ Skip</button>
        <button onclick="pause()">⏸ Pause</button>
        <button onclick="play()">▶ Play</button>
        <button onclick="clearAll()">🗑 Clear</button>
      </div>
    `
  } else {
    adminControls.innerHTML = ""
  }

  songsDiv.innerHTML = ""
  state.songs.forEach(song => {
    songsDiv.innerHTML += `
      <div class="song">
        <div>
          <strong>${song.title}</strong>
          <div class="meta">${song.votes} votes</div>
        </div>
        <button onclick="vote(${song.id})">Vote</button>
      </div>
    `
  })

  playQueueDiv.innerHTML = ""
  state.playQueue.forEach(song => {
    playQueueDiv.innerHTML += `
      <div class="song">${song.title}</div>
    `
  })
})

function vote(id){ socket.emit("vote", id) }
function skip(){ socket.emit("admin-skip") }
function pause(){ socket.emit("admin-pause") }
function play(){ socket.emit("admin-play") }
function clearAll(){ socket.emit("admin-clear") }
function restart(){ socket.emit("admin-restart") }
function toggleMode(){ socket.emit("toggle-mode") }

function extractVideoId(url){
  if(url.includes("youtu.be/")){
    return url.split("youtu.be/")[1].split("?")[0]
  }
  if(url.includes("watch?v=")){
    return url.split("watch?v=")[1].split("&")[0]
  }
  return url
}

document.getElementById("songForm").addEventListener("submit", e => {
  e.preventDefault()

  const linkInput = document.getElementById("youtubeLink")
  const youtubeId = extractVideoId(linkInput.value.trim())
  if(!youtubeId || !playerReady) return

  const hiddenDiv = document.createElement("div")
  hiddenDiv.style.display = "none"
  document.body.appendChild(hiddenDiv)

  const tempPlayer = new YT.Player(hiddenDiv, {
    videoId: youtubeId,
    events: {
      onReady: (event) => {
        const title = event.target.getVideoData().title || "Unknown Title"
        socket.emit("add-song", { youtubeId, title })
        event.target.destroy()
        document.body.removeChild(hiddenDiv)
      },
      onError: (event) => {
        event.target.destroy()
        document.body.removeChild(hiddenDiv)
      }
    }
  })

  e.target.reset()
})
