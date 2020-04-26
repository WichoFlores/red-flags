import io from 'socket.io-client'
import { useEffect, useState } from 'react'

const Index = () => {

  const [socket, setSocket] = useState(null)
  const [nickname, setNickname] = useState("")
  const [players, setPlayers] = useState([])
  const [sent, setSent] = useState(false)
  const [isLeader, setIsLeader] = useState(false)
  const [hand, setHand] = useState([])
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    setSocket(io())
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('update players', (players) => {
        setPlayers(players)
      })

      socket.on('set leader', () => setIsLeader(true))

      socket.on('draw', (hand) => setHand(hand) )
    }

  }, [socket])

  const submitName = (e) => {
    e.preventDefault()
    socket.emit("new player", nickname)
    setSent(true)
  }

  const startGame = () => {
    socket.emit('start game', null)
    setGameStarted(true)
  }

  return(
    <div>
      <h1>Red Flags</h1>
      { !gameStarted ? 
      <div>
        {sent && 
          <h2>{nickname}</h2>
        }
        {isLeader && 
          <h2>You are the leader!</h2>
        }
        <form onSubmit={submitName}>
          <input placeholder="Nickname" value={nickname} disabled={sent} onChange={(e) => setNickname(e.target.value)} ></input>
        </form>
        <h3>Other players: </h3>
        <ul>
          {players.map(player => <li key={player.id}>{player.name}</li>)}
        </ul>
        {isLeader && 
          <button onClick={startGame} disabled={players.length > 1 ? false : true}>Start Game</button>
        }
      </div> :
      <div>
        <h2>Perks Phase</h2>
        <h3>Choose 2 perks:</h3>
        <ul>
          {hand.map(card => <li key={card}>{card}</li>)}
        </ul>
        <h3>Selection:</h3>
        <ul>
          {selected.map(card => <li key={card}>{card}</li>)}
        </ul>
        <button disabled={selected.length}>Set perks</button>
      </div>
      
      }
    </div>
  )
}

export default Index