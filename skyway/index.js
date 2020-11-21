// skyway
const peer = new Peer({key: "ff406994-e59b-47d6-a654-34b7651d65cd", debug: 3})
let connected
peer.on("open", () => (document.getElementById("my-id").textContent = peer.id))
peer.on("connection", connection => {
  connected = connection
  connected.on(
    "open",
    () =>
      (document.getElementById("their-id-after-connect").textContent =
        connected.id)
  )
})

const handleClick = () => {
  const theirID = document.getElementById("their-id").value
  peer.connect(theirID)
}

document.getElementById("make-call").addEventListener("click", handleClick)
