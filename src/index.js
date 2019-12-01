import 'phaser'
import Title from './title'
import Game from './game'

import './index.css'

const gameConfig = {
  width: 960,
  height: 540,
  backgroundColor: '#072C40',
  physics: {
    default: 'matter',
    matter: {
      // debug: true,
      // debugBodyColor: 0xffffff,
    },
  },
  scene: [
    Title,
    Game,
  ],
}

const game = new Phaser.Game(gameConfig)
