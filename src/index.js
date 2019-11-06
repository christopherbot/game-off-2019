import 'phaser'

import './index.css'

class TestScene extends Phaser.Scene {
  static staticProp = 'test'
  instanceProp = [1,2,3]

  preload() {
    this.load.image('frog', 'assets/frog.png')
  }
  create() {
    this.add.text(200, 150, 'Frog', { fill: '#0f0' })
    this.add.text(200, 250, TestScene.staticProp, { fill: '#0f0' })
    this.add.text(200, 350, [...this.instanceProp].join('......'), { fill: '#0f0' })

    this.add.image(200, 450, 'frog').setOrigin(0, 1)
    this.add.image(250, 450, 'frog').setOrigin(0, 1).setScale(1.5)
    this.add.image(310, 450, 'frog').setOrigin(0, 1).setScale(2)
  }
}

const gameConfig = {
  width: 800,
  height: 560,
  backgroundColor: '#072C40',
  physics: {
    default: 'arcade'
  },
  scene: [TestScene],
}

const game = new Phaser.Game(gameConfig)
