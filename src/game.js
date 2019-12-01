import BaseScene from './baseScene'
import Kernel from './kernel'

export default class Game extends BaseScene {
  constructor(props) {
    super('game')
  }

  preload() {}

  createBagSection(x, y, length, width, options = {}) {
    const {
      angle,
      ...imageOptions
    } = options

    const imageKey = Phaser.Math.RND.realInRange(0, 1) > 0.2 ? 'bag' : 'bagAlt'

    const bagSection = this.matter.add.image(x, y, imageKey, undefined, {
      ignoreGravity: true,
      chamfer: 20,
      friction: 0.005,
      frictionAir: 0.05,
      restitution: 0.6,
      ...imageOptions,
    })

    bagSection.setDisplaySize(length, width)

    if (angle) {
      bagSection.setAngle(angle)
    }

    return bagSection
  }

  static numKernels = 20
  static sectionWidth = 20
  static sectionLength = 50
  static numSectionsH = 12
  static numSectionsV = 6
  static constraintLength = 0
  static stiffness = 1

  addConstraint(bodyA, bodyB, options) {
    this.matter.add.constraint(bodyA, bodyB, Game.constraintLength, Game.stiffness, {
      damping: 0.05,
      ...options,
    })
  }

  createBag() {
    const {
      sectionWidth,
      sectionLength,
      numSectionsH,
      numSectionsV,
    } = Game

    const bagX = this.middleX - (numSectionsH * sectionLength / 2)
    const bagYEnd = this.gameHeight - Game.sectionWidth - 5
    const bagY = bagYEnd - numSectionsV * sectionLength

    this.topSide = [...Array(numSectionsH)].map((_, num) => {
      return this.createBagSection(
        bagX + (sectionLength / 2) + (num * sectionLength),
        bagY - 20,
        sectionLength,
        sectionWidth,
      )
    })

    this.rightSide = [...Array(numSectionsV)].map((_, num) => {
      return this.createBagSection(
        bagX + (numSectionsH * sectionLength),
        bagY + (sectionWidth / 2) + (num * sectionLength),
        sectionLength,
        sectionWidth,
        {
          angle: 90,
        },
      )
    })

    this.bottomSide = [...Array(numSectionsH)].map((_, num) => {
      const isInMiddle =
        num > (1 / 4) * numSectionsH &&
        num < (3 / 4) * numSectionsH

      return this.createBagSection(
        bagX + (sectionLength / 2) + num * sectionLength,
        bagY + (numSectionsV * sectionLength),
        sectionLength,
        sectionWidth,
        {
          isStatic: isInMiddle,
          angle: 180,
        }
      )
    })

    this.leftSide = [...Array(numSectionsV)].map((_, num) => {
      return this.createBagSection(
        bagX,
        bagY + (sectionWidth / 2) + (num * sectionLength),
        sectionLength,
        sectionWidth,
        {
          angle: -90,
        },
      )
    })

    const sectionStart = -sectionLength / 2
    const sectionEnd = sectionLength / 2

    // right-to-left constraints for each top section except the last
    this.topSide.forEach((section, i) => {
      if (i !== this.topSide.length - 1) {
        this.addConstraint(
          section,
          this.topSide[i + 1],
          {
            pointA: { x: sectionEnd, y: 0 },
            pointB: { x: sectionStart, y: 0 },
          },
        )
      }
    })

    // bottom-to-top constraints for each right section except the last
    this.rightSide.forEach((section, i) => {
      if (i !== this.rightSide.length - 1) {
        this.addConstraint(
          section,
          this.rightSide[i + 1],
          {
            pointA: { x: 0, y: sectionEnd },
            pointB: { x: 0, y: sectionStart },
          },
        )
      }
    })

    // right-to-left constraints for each bottom section except the last
    this.bottomSide.forEach((section, i) => {
      if (i !== this.bottomSide.length - 1) {
        this.addConstraint(
          section,
          this.bottomSide[i + 1],
          {
            pointA: { x: sectionEnd, y: 0 },
            pointB: { x: sectionStart, y: 0 },
          },
        )
      }
    })

    // bottom-to-top constraints for each left section except the last
    this.leftSide.forEach((section, i) => {
      if (i !== this.leftSide.length - 1) {
        this.addConstraint(
          section,
          this.leftSide[i + 1],
          {
            pointA: { x: 0, y: sectionEnd },
            pointB: { x: 0, y: sectionStart },
          },
        )
      }
    })

    // left-to-top constraint between first top and first left section
    this.addConstraint(
      this.topSide[0],
      this.leftSide[0],
      {
        pointA: { x: sectionStart, y: 0 },
        pointB: { x: 0, y: sectionStart },
      },
    )

    // right-to-top constraint between last top and first right section
    this.addConstraint(
      this.topSide[this.topSide.length - 1],
      this.rightSide[0],
      {
        pointA: { x: sectionEnd, y: 0 },
        pointB: { x: 0, y: sectionStart },
      },
    )

    // bottom-to-left constraint between last left and first bottom section
    this.addConstraint(
      this.leftSide[this.leftSide.length - 1],
      this.bottomSide[0],
      {
        pointA: { x: 0, y: sectionEnd },
        pointB: { x: sectionStart, y: 0 },
      },
    )

    // bottom-to-right constraint between last right and last bottom section
    this.addConstraint(
      this.rightSide[this.rightSide.length - 1],
      this.bottomSide[this.bottomSide.length - 1],
      {
        pointA: { x: 0, y: sectionEnd },
        pointB: { x: sectionEnd, y: 0 },
      },
    )
  }

  createBlast(x, y) {
    const blastVector = new Phaser.Math.Vector2(x, y)

    ;[
      ...this.topSide,
      ...this.rightSide,
      ...this.bottomSide,
      ...this.leftSide,
    ].forEach((section) => {
      if (blastVector.distance(section) < 250) {
        const xDiff = section.x - blastVector.x
        const yDiff = section.y - blastVector.y

        section.applyForce({
          x: xDiff / 10000,
          y: yDiff / 10000,
        })

        // TODO add a yoyo tint tween to flash the section
      }
    })
  }

  createKernel(x, y, options) {
    return new Kernel({
      scene: this,
      x,
      y,
      options,
    })
  }

  getKernelPosition(numKernels, index, xTotal, x0, yMin, yMax) {
    const x = numKernels === 1
      ? x0
      : x0 + index * (xTotal / (numKernels - 1))

    const y = Phaser.Math.RND.integerInRange(yMin, yMax)

    return { x, y }
  }

  incrementTotalPopped() {
    this.totalPopped += 1
    this.totalPoppedText.setText(`Popped: ${this.totalPopped}`)
  }

  addKernels(numKernels) {
    const kernelsXTotal = 5 * Game.sectionLength
    const kernelsXStart = this.middleX - (kernelsXTotal / 2)
    const bagYEnd = this.gameHeight - Game.sectionWidth - 5
    const kernelsYEnd = bagYEnd - 40
    const kernelsYStart = bagYEnd - 100

    const newKernels = [...Array(numKernels)].map((_, index) => {
      const { x, y } = this.getKernelPosition(
        numKernels,
        index,
        kernelsXTotal,
        kernelsXStart,
        kernelsYStart,
        kernelsYEnd,
      )

      return this.createKernel(x, y, {
        onFinalPop: (...args) => {
          this.createBlast(...args)
          this.incrementTotalPopped()
        },
        initialHits: Math.max(Kernel.MAX_HITS - numKernels, 0),
      })
    })

    this.kernels = [
      ...this.kernels,
      ...newKernels,
    ]
  }

  create(data) {
    this.sounds = data.sounds

    this.sounds.shake.play()
    this.sounds.background.play()

    this.matter.world.setBounds(0, 0, this.gameWidth, this.gameHeight)
    this.shapes = this.cache.json.get('shapes')

    this.createBag()

    this.playerKernel = this.createKernel(this.middleX, 350, {
      isPlayer: true,
    })

    this.wave = 1
    this.waveText = this.add.text(
      20,
      20,
      `Wave: ${this.wave}`,
      {
        fontFamily: 'Arial',
        fontSize: '30px',
      },
    )

    this.totalPopped = 0
    this.totalPoppedText = this.add.text(
      20,
      60,
      `Popped: ${this.totalPopped}`,
      {
        fontFamily: 'Arial',
        fontSize: '30px',
      },
    )

    this.kernels = []
    this.addKernels(this.wave)

    this.cursors = this.input.keyboard.createCursorKeys()

    this.matter.world.on('collisionstart', (event) => {
      /*
       * The collisionstart callback provides the first pair of collided bodies
       * (e.g. `bodyA` and `bodyB`) after the `event`. The `event` provides a list
       * of all collision pairs, so use that instead since we care about all
       * collisions and not just the first one in a given tick.
       *
       * See: https://github.com/photonstorm/phaser/issues/3450#issuecomment-375519312
       */
      event.pairs.forEach(({ bodyA, bodyB }) => {
        // Only deal with collisions between the player kernel and other kernels.
        if (
          Kernel.isKernel(bodyA.gameObject) &&
          Kernel.isKernel(bodyB.gameObject) &&
          (bodyA.gameObject.isPlayer || bodyB.gameObject.isPlayer)
        ) {
          bodyA.gameObject.onHit(bodyB.gameObject)
          bodyB.gameObject.onHit(bodyA.gameObject)
        }
      })
    })
  }

  handleKeyPress() {
    if (this.cursors.left.isDown) {
      this.playerKernel.setVelocityX(-3)
    } else if (this.cursors.right.isDown) {
      this.playerKernel.setVelocityX(3)
    }

    if (this.keyJustDown(this.cursors.up)) {
      this.playerKernel.pop({
        maxVelocityY: 10,
      })
    }
  }

  update() {
    this.handleKeyPress()

    if (this.kernels.every(kernel => kernel.isPopped)) {
      this.wave += 1
      this.waveText.setText(`Wave: ${this.wave}`)
      this.addKernels(this.wave)

      this.shakeTimer = this.time.addEvent({
        delay: 120,
        callback: () => {
          this.sounds.shake.play({
            volume: Math.min(
              0.1 + ((this.shakeTimer.repeat - this.shakeTimer.repeatCount) / 30),
              0.3,
            ),
          })
        },
        callbackScope: this,
        repeat: this.wave - 1,
      })
    }
  }
}