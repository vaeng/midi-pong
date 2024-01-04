import Phaser from "phaser"

import * as Colors from '../consts/Colors'
import * as Fonts from '../consts/Fonts'

import * as SceneKeys from '../consts/SceneKeys'

import { JZZ } from 'jzz';
import {WebMidi, Utilities} from "webmidi";

const GameState = {
    Running: 'running',
    PlayerWon: 'player-won',
    AIWon: 'ai-won'
}

export default class Game extends Phaser.Scene {
    static keysPressed = new Set()
    static speed = 200
    static upNote = null 
    static downNote = null

    static generateNewNotes() {
        const lowerNoteLimit = 48
        const upperNoteLimit = 71
        Game.upNote = Phaser.Math.Between(lowerNoteLimit+1,upperNoteLimit)
        Game.downNote = Phaser.Math.Between(lowerNoteLimit, Game.upNote-1)
    }

    init () {
        this.leftScore = 0
        this.rightScore = 0
        this.gameState = GameState.Running
        this.paused = false
        Game.generateNewNotes()
        this.startUpMidi()         
    }

    preload() {

    }

    create() {
        this.scene.run(SceneKeys.GameBackground)
        this.scene.sendToBack(SceneKeys.GameBackground)

        this.physics.world.setBounds(-100, 0, 1000, 500)

        this.ball = this.add.circle(400, 250, 10, Colors.White)
        this.physics.add.existing(this.ball)
        this.ball.body.setCircle(10)
        this.ball.body.acceleration = 10

        this.paddleLeft = this.add.rectangle(50, 250, 30, 100, Colors.White)
        this.physics.add.existing(this.paddleLeft, true)
        this.physics.add.collider(this.paddleLeft, this.ball, this.manage_paddle_hit)

        this.paddleRight = this.add.rectangle(750, 250, 30, 100, Colors.White, 1)
        this.physics.add.existing(this.paddleRight, true)
        this.physics.add.collider(this.paddleRight, this.ball)

        const scoreStyle = {
            fontSize: 48,
            fontFamily: Fonts.PressStart2P
        }
        this.leftScoreLabel = this.add.text(300, 125, '0', scoreStyle).setOrigin(0.5, 0.5)
        this.rightScoreLabel = this.add.text(500, 375, '0', scoreStyle).setOrigin(0.5, 0.5)

        this.upNoteLabel = this.add.text(135, 50, Utilities.toNoteIdentifier(Game.upNote), scoreStyle).setOrigin(0.5, 0.5)
        this.downNoteLabel = this.add.text(135, 450,  Utilities.toNoteIdentifier(Game.downNote), scoreStyle).setOrigin(0.5, 0.5)

        this.cursors = this.input.keyboard.createCursorKeys()

        this.time.delayedCall(1500, () => {this.resetBall()})
    }

    manage_paddle_hit(paddle, ball) {
        const vel = ball.body.velocity
        ball.body.velocity = new Phaser.Math.Vector2(vel.x * 1.3, vel.y * 1.3)
        Game.generateNewNotes()
    }

    update() {
        if (this.paused) {
            return
        }
        this.upNoteLabel.text = Utilities.toNoteIdentifier(Game.upNote)
        this.downNoteLabel.text = Utilities.toNoteIdentifier(Game.downNote)
        this.ball.body.speed = Game.speed

        this.processPlayerInput()
        this.updateAI()
        this.checkScore()
    }

    checkScore() {
        if (this.ball.x < -30) {
            this.incrementRightScore()
            this.resetBall()
        } else if (this.ball.x > 830) {
            this.incrementLeftScore() 
            this.resetBall()
        }

        const maxScore = 7

        if (this.leftScore >= maxScore) {
            this.gameState = GameState.PlayerWon
        } else if (this.rightScore >= maxScore) {
            this.gameState = GameState.AIWon
        }

        if (this.rightScore >= maxScore || this.leftScore >= maxScore) {
            this.paused = true
            this.scene.stop(SceneKeys.GameBackground)
            this.scene.start(SceneKeys.GameOver, {leftScore: this.leftScore, rightScore: this.rightScore})
        }
    }

    processPlayerInput() {
        if (Game.keysPressed.has(Game.upNote)) {
            this.paddleLeft.y -= 10
            if (this.paddleLeft.y < 0) {
                this.paddleLeft.y = 0
            }
            this.paddleLeft.body.updateFromGameObject()
        }
        else if (Game.keysPressed.has(Game.downNote)) {
            this.paddleLeft.y += 10
            if (this.paddleLeft.y > 500) {
                this.paddleLeft.y = 500
            }
            this.paddleLeft.body.updateFromGameObject()
        }
    }

    updateAI() {
        const diff = this.ball.y - this.paddleRight.y
        const aiSpeed = 0.8
        if (Math.abs(diff) > 20) {
            if (diff < 0) {
                this.paddleRight.y -= aiSpeed
            } else if (diff > 0) {
                this.paddleRight.y += aiSpeed
            }
        this.paddleRight.body.updateFromGameObject()
        }
    }

    incrementLeftScore()  {
        this.leftScore += 1
        this.leftScoreLabel.text = this.leftScore.toString()
    }

    incrementRightScore()  {
        this.rightScore += 1
        this.rightScoreLabel.text = this.rightScore.toString()
    }

    resetBall() {
        if (this.paused) {
            return
        }
        const angle = Phaser.Math.Between(-45, 45) + 180 * Phaser.Math.Between(0, 1)
        const vec = this.physics.velocityFromAngle(angle, Game.speed)
        this.ball.setPosition(400, 250)
        this.ball.body.setVelocity(vec.x, vec.y)
        this.ball.body.setCollideWorldBounds(true, 1, 1)
        this.ball.body.setBounce(1, 1)
    }

    // Enable WEBMIDI.js and trigger the onEnabled() function when ready
    startUpMidi() {
        WebMidi.enable()
            .then(this.onEnabled)
            .catch((err) => alert(err));
    }
    

    
    // Function triggered when WEBMIDI.js is ready
    onEnabled() {
      if (WebMidi.inputs.length < 1) {
        console.log("No device detected.");
      } else {
        WebMidi.inputs.forEach((device, index) => {
         console.log(`${index}: ${device.name}`);
        });
      }

      function addKeys(e) {
        Game.keysPressed.add(e.note.number)
        }

        
      function removeKeys(e) {
        Game.keysPressed.delete(e.note.number)
        }
    
      const mySynth = WebMidi.inputs[0];
      mySynth.channels[1].addListener("noteon", addKeys);
      mySynth.channels[1].addListener("noteoff", removeKeys);
    }



}
