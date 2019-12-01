import BaseScene from './baseScene'
import Kernel from './kernel'

export default class Title extends BaseScene {
  constructor(props) {
    super('title')
  }

  addTitle() {
    this.add.text(
      this.middleX,
      this.middleY - 100,
      'Kernel Space Program',
      {
        fontFamily: 'Arial',
        fontSize: '60px',
        color: '#d0d04a',
      }
    ).setOrigin(0.5, 0.5)
  }

  addControls() {
    this.menuPrompt = this.add.text(
      this.middleX,
      this.middleY,
      '         ▲\n        POP\n\n◀ Left     Right ▶',
      {
        fontSize: '20px',
        color: '#bbbb4d',
      },
    ).setOrigin(0.5, 0.5)
  }

  addInstructions() {
    this.menuPrompt = this.add.text(
      this.middleX,
      this.middleY + 100,
      'Pop the other kernels',
      {
        fontSize: '20px',
        color: '#bbbb4d',
      },
    ).setOrigin(0.5, 0.5)
  }

  addPrompt() {
    this.menuPrompt = this.add.text(
      this.middleX,
      this.middleY + 160,
      'Hit [enter] to start',
      {
        fontSize: '20px',
        color: '#f3f327',
      },
    ).setOrigin(0.5, 0.5)
  }

  handleKeyPress() {
    if (this.keyJustDown(this.enterKey)) {
      this.scene.start('game', {
        sounds: this.sounds,
      })
    }

    if (this.cursors.left.isDown) {
      this.playerKernel.setIgnoreGravity(false)
      this.playerKernel.setVelocityX(-3)
    } else if (this.cursors.right.isDown) {
      this.playerKernel.setIgnoreGravity(false)
      this.playerKernel.setVelocityX(3)
    }

    if (this.keyJustDown(this.cursors.up)) {
      this.playerKernel.setIgnoreGravity(false)
      this.playerKernel.pop({
        maxVelocityY: 10,
      })
    }
  }

  preload() {
    this.load.audio('background', 'assets/background.wav')
    this.load.audio('highPop', 'assets/highPop.mp3')
    this.load.audio('lowPop', 'assets/lowPop.mp3')
    this.load.audio('bigPop', 'assets/bigPop.mp3')
    this.load.audio('shake', 'assets/shake.mp3')

    this.load.image('bag', 'assets/bag.png')
    this.load.image('bagAlt', 'assets/bagAlt.png')
    this.load.image('kernel', 'assets/kernel.png')
    this.load.image('kernelLarge', 'assets/kernelLarge.png')
    this.load.image('popcorn1', 'assets/popcorn1.png')
    this.load.image('popcorn2', 'assets/popcorn2.png')
    this.load.image('popcorn3', 'assets/popcorn3.png')
    this.load.atlas('sheet', 'assets/sheet.png', 'assets/sheet.json')
    this.load.json('shapes', 'assets/kernelFixed.json')
  }

  create() {
    this.sounds = {
      background: this.sound.add('background', {
        volume: 0.3,
        loop: true,
      }),
      smallPop: {
        high: this.sound.add('highPop', { volume: 0.3 }),
        low: this.sound.add('lowPop', { volume: 0.3 }),
      },
      bigPop: this.sound.add('bigPop', { volume: 0.5 }),
      shake: this.sound.add('shake', { volume: 0.3 }),
    }

    this.enterKey = this.addKey('ENTER')

    this.addTitle()
    this.addControls()
    this.addInstructions()
    this.addPrompt()

    this.cursors = this.input.keyboard.createCursorKeys()

    this.matter.world.setBounds(0, 0, this.gameWidth, this.gameHeight)
    this.shapes = this.cache.json.get('shapes')

    this.playerKernel = new Kernel({
      scene: this,
      x: this.middleX,
      y: this.middleY + 30,
      options: {
        isPlayer: true,
        popOnStart: false,
      },
    })

    this.playerKernel.setIgnoreGravity(true)
  }

  update() {
    this.handleKeyPress()
  }
}
