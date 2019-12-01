import { executeAndDebounce } from './utils'

class Kernel extends Phaser.Physics.Matter.Sprite {
  static isKernel(obj) {
    return obj instanceof Kernel
  }

  static baseOptions = {
    bounce: 0.5,
    minPopDelay: 1000,
    maxPopDelay: 3000,
    initialHits: 0,
    isPlayer: false,
    onFinalPop() {},
    popOnStart: true,
  }

  static MAX_HITS = 3
  static tints = [
    0xc5af97,
    0x75675a,
    0x50483d,
  ]

  constructor({ scene, x, y, options = {} }) {
    super(
      scene.matter.world,
      x,
      y,
      'sheet',
      'kernel',
      {
        shape: scene.shapes.kernel,
      },
    )

    this.scene = scene
    this.initialX = x
    this.initialY = y

    this.options = {
      ...Kernel.baseOptions,
      ...options,
    }

    this.isPlayer = this.options.isPlayer
    this.scene.add.existing(this)

    this.setBounce(this.options.bounce)

    if (this.options.popOnStart) {
      this.pop()
    }

    this.isPopped = false
    this.hits = this.options.initialHits
    this.cook()

    if (!this.isPlayer) {
      this.popTimer = this.scene.time.addEvent({
        delay: Phaser.Math.RND.integerInRange(
          this.options.minPopDelay,
          this.options.maxPopDelay,
        ),
        callback: this.pop,
        callbackScope: this,
        repeat: -1,
      })
    }
  }

  getRandomPopSound() {
    if (!this.scene.sounds) {
      return null
    }

    const soundKey = Phaser.Utils.Array.GetRandom(
      Object.keys(this.scene.sounds.smallPop),
    )

    return this.scene.sounds.smallPop[soundKey]
  }

  pop({
    minAngularVelocity = 0,
    maxAngularVelocity = 0.3,
    minVelocityX = 0,
    maxVelocityX = 5,
    minVelocityY = 5,
    maxVelocityY = 15,
    sound = this.getRandomPopSound(),
  } = {}) {
    if (this.isPopped) {
      return
    }

    if (sound && sound.play) {
      sound.play({
        detune: Phaser.Math.RND.integerInRange(-200, 200),
      })
    }

    this.grow()
    const directionInteger = Phaser.Math.RND.realInRange(0, 1) > 0.5 ? -1 : 1

    this.setAngularVelocity(
      directionInteger * Phaser.Math.RND.realInRange(minAngularVelocity, maxAngularVelocity),
    )

    this.setVelocity(
      directionInteger * Phaser.Math.RND.realInRange(minVelocityX, maxVelocityX),
      -Phaser.Math.RND.realInRange(minVelocityY, maxVelocityY), // negative = up
    )
  }

  grow() {
    if (this.isPlayer) {
      return
    }

    this.scene.tweens.add({
      targets: this,
      scale: 1.3,
      ease: 'Sine.easeInOut',
      duration: 400,
      yoyo: true,
    })
  }

  cook() {
    if (this.isPlayer || this.hits === 0) {
      return
    }

    // TODO tween from current tint to next tint
    this.setTint(
      Kernel.tints[
        Math.min(
          this.hits - 1,
          Kernel.tints.length - 1,
        )
      ],
    )
  }

  _onHit(otherBody) {
    if (this.isPlayer) {
      if (!otherBody.isPopped) {
        this.pop({
          maxVelocityX: 0,
          minVelocityY: 3,
          maxVelocityY: 6,
        })
      }

      return
    }

    if (this.isPopped) {
      return
    }

    this.hits += 1
    this.cook()

    if (this.hits >= Kernel.MAX_HITS) {
      this.popTimer.remove()

      this.scene.time.delayedCall(500, () => {
        this.setTexture(`popcorn${Phaser.Math.RND.integerInRange(1, 3)}`)
        this.clearTint()
        this.pop({
          sound: this.scene.sounds.bigPop,
        })
        this.options.onFinalPop(this.x, this.y)
        this.isPopped = true
      })
    }
  }

  // This is needed because multiple collision events occur in a very short
  // amount of time. This ensures that only one at a time is counted.
  onHit = executeAndDebounce((otherBody) => this._onHit(otherBody), 200)
}

export default Kernel
