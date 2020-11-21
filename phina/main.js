// skyway
const peer = new Peer({key: "ff406994-e59b-47d6-a654-34b7651d65cd", debug: 3})

let connected

// onClick
const handleClick = () => {
  const theirID = document.getElementById("their-id").value
  connected = peer.connect(theirID)
  connected.on("open", function () {
    document.getElementById("their-id-after-connect").textContent =
      connected.peer
  })
}
document.getElementById("make-call").addEventListener("click", handleClick)

// Peer Event
peer.on("open", () => (document.getElementById("my-id").textContent = peer.id))
peer.on("connection", connection => {
  connected = connection
  connected.on("open", () => {
    document.getElementById("their-id-after-connect").textContent =
      connected.peer
  })
})

// phina
phina.globalize()

const ASSETS = {
    image: {
      bg: "assets/bg/sky.png",
      bullet: "assets/weapon/bullet.png",
      player: "assets/chara/police.png",
      enemy: "assets/chara/swat.png",
    },
  },
  CHARACTER = {
    HP: 100,
    POWER: 10,
    SPEED: 8,
  }

// Scene
phina.define("MainScene", {
  superClass: "DisplayScene",
  init: function () {
    this.superInit()
    this.bullets = []
    this.connectedLoaded = false
    // add Background
    Sprite("bg")
      .addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.center())
    // add Enemy & Player
    ;[
      {type: "player", ins: Player, span: 14},
      {type: "enemy", ins: Enemy, span: 2},
    ].forEach(
      ({type, ins, span}) =>
        (this[type] = ins({type})
          .addChildTo(this)
          .setPosition(this.gridX.center(), this.gridY.span(span)))
    )
    setInterval(() => {
      const bullets = this.bullets.map(({x, y}) => ({
        x,
        y,
      }))
      if (connected) {
        const data = {
          x: this.player.x,
          hp: this.enemy.hp.value,
          bullets: bullets,
        }
        console.log("send")
        connected.send(data)
      }
    }, 1000)
  },
  update: function () {
    //　Bullet Collision
    this.bullets.map(bullet => {
      if (bullet.hitTestElement(this.enemy) && bullet.hitFlag === false) {
        this.enemy.hp.value -= 10
        bullet.hitFlag = true
      }
    })

    // receive
    if (connected) {
      if (this.connectedLoaded === false) {
        this.connectedLoaded = true
        connected.on("data", ({x, hp, bullets}) => {
          console.log("receive")
          this.enemy.x = this.width - x
          this.player.hp.value = hp
          bullets.map(({x, y}) => {
            EnemyBullet({x: x - 300, y}).addChildTo(this.enemy)
          })
        })
      }
    }
  },
})

// Player
phina.define("Player", {
  superClass: "Sprite",
  init: function () {
    this.superInit("player")
    this.hp = LifeGauge().addChildTo(this)
    this.bulletFrameCount = 0
    this.bulletFlag = false
  },
  update: function (app) {
    const key = app.keyboard,
      {SPEED} = CHARACTER
    // Move
    ;["left", "right", "a", "d"].forEach(
      (val, i) =>
        key.getKey(val) && (this.x = this.x + (i % 2 === 0 ? -SPEED : SPEED))
    )
    // Shoot
    if (key.getKey("space")) {
      if (this.bulletFrameCount % 30 == 0 || !this.bulletFlag) {
        this.bulletFlag = true
        // Bullet Generate
        this.parent.bullets.push(
          PlayerBullet({
            x: this.x,
            y: this.y,
          }).addChildTo(this.parent)
        )
      }
      this.bulletFrameCount++
    } else {
      this.bulletFramCount = 0
      this.bulletFlag = false
    }
  },
})

// Enemy
phina.define("Enemy", {
  superClass: "Sprite",
  init: function () {
    this.superInit("enemy")
    this.hp = LifeGauge().addChildTo(this)
  },
})

// LifeGauge
phina.define("LifeGauge", {
  superClass: "Gauge",
  init: function () {
    const {HP} = CHARACTER
    this.superInit({
      fill: "red",
      stroke: "silver",
      gaugeColor: "limegreen",
      maxValue: HP,
      value: HP,
    })
    this.animationTime = 400
  },
})

// PlayerBullet
phina.define("PlayerBullet", {
  superClass: "Sprite",
  init: function ({x, y}) {
    this.superInit("bullet")
    this.x = x
    this.y = y
    this.rotation = 90
    this.hitFlag = false
    this.physical.velocity.y = -20
    this.setScale(0.5, 0.5)
  },
  update: function () {
    if (this.bottom < 0) {
      this.parent.bullets.shift()
      this.remove()
    }
  },
})

// EnemyBullet
phina.define("EnemyBullet", {
  superClass: "Sprite",
  init: function ({x, y}) {
    this.superInit("bullet")
    this.x = x
    this.y = y
    this.rotation = -90
    this.physical.velocity.y = 20
    this.setScale(0.5, 0.5)
    console.log(this)
  },
  update: function () {
    if (this.top > this.parent.parent.height) {
      this.parent.parent.bullets.shift()
      this.remove()
    }
  },
})

phina.main(function () {
  var app = GameApp({
    startLabel: "main",
    assets: ASSETS,
  })
  app.run()
})
