const app = require("express")()
const server = require('http').Server(app)
const io = require("socket.io")(server)
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

const port = 3000

let dummyDeck = []

let players = []

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}

io.on('connection', socket => {
  socket.on('disconnect', () => {
    // If the leader exited, make a new leader
    if (players.length > 0 && socket.id === players[0].id) {
      console.log("Leader left!")
      io.to(players[1].id).emit('set leader', null)
    }
    players = players.filter(client => client.id != socket.id)
    socket.broadcast.emit('update players', players)
    console.log(`Total users: ${players.length}`) 
    return
  })


  socket.on('new player', (name) => {
    console.log("New player:", name)
    // Add client
    players.push({ id: socket.id, name })
    console.log(`Total players: ${players.length}`)

    // If first player, make him leader
    if (players.length == 1) {
      socket.emit('set leader', null)
    }
    // Update other players list
    io.emit('update players', players)
  })
  socket.on('start game', () => {
    // db query
    // set deck
    dummyDeck = [1,2,3,4]
    // shuffle deck
    shuffleArray(dummyDeck)
    // send cards to each client
    players.forEach(player => {
      let hand = []
      // send two cards
      hand.push(dummyDeck.pop())
      hand.push(dummyDeck.pop())
      io.to(player.id).emit('draw', hand)
    })
  })
})


nextApp.prepare().then(() => {
  app.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err 
    console.log(`Ready on http://localhost:${port}`)    
  })
})