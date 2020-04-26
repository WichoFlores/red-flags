import io from 'socket.io-client'
import { useEffect, useState } from 'react'

const Index = () => {

  const [socket, setSocket] = useState(null)
  const [nickname, setNickname] = useState("")
  const [players, setPlayers] = useState([])
  const [isLeader, setIsLeader] = useState(false)
  const [sent, setSent] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [hand, setHand] = useState([])
  const [selected, setSelected] = useState([])

  useEffect(() => {
    setSocket(io())
    document.getElementById("name").focus()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('update players', (players) => {
        setPlayers(players)
      })

      socket.on('set leader', () => setIsLeader(true))

      socket.on('draw', (hand) => setHand(hand) )

      socket.on('start game', () => setGameStarted(true))
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
    setSent(false)
  }

  const selectCard = (selectedCard) => {
    setHand(hand.filter(card => card != selectedCard))

    const selection = hand.filter(card => card == selectedCard)
    setSelected(selected.concat(selection))
  }

  const removeSelected = (selectedCard) => {
    const newHand = selected.filter(card => card == selectedCard)
    setHand(hand.concat(newHand))

    setSelected(selected.filter(card => card != selectedCard))
  }

  const sendPerks = () => {
    socket.emit('set perks', selected)
    setSent(true)
  }

  return(
    <div>
      <h1>Red Flags</h1>
      {nickname && 
          <h2>{nickname}</h2>
        }
      { !gameStarted ? 
      <div>
        {isLeader && 
          <h2>You are the leader!</h2>
        }
        <form autoComplete="off" onSubmit={submitName}>
          <input id="name" placeholder="Nickname" value={nickname} disabled={sent} onChange={(e) => setNickname(e.target.value)} ></input>
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
          {hand.map(card => <div onClick={() => selectCard(card)} key={card}>{card}</div>)}
        <h3>Selection:</h3>
        <ul>
          {selected.map(card => <li onClick={() => removeSelected(card)} key={card}>{card}</li>)}
        </ul>
        <button onClick={sendPerks} disabled={selected.length == 2 ? false : true && sent}>Set perks</button> 
        <h3>Waiting for:</h3>
        <ul>
          {players.map(player => {
            if(!player.date.perk1 || !player.date.perk2) {
              return <li key={player.id}>{player.name}</li>
            }
          })}
        </ul>
      </div>
      }
    </div>
  )
}

export default Index