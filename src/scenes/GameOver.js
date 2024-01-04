import Phaser from "phaser"

import * as Fonts from '../consts/Fonts'
import {TitleScreen} from '../consts/SceneKeys'

export default class GameOver extends Phaser.Scene {
    create (data) {
        let titleText = "Game Over"
        if (data.rightScore < data.leftScore) {
            titleText = "You Win!"
        }

        this.add.text(400, 200, titleText, {
            fontFamily: Fonts.PressStart2P,
            fontSize: 38
        }).setOrigin(0.5)

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start(TitleScreen)
        })

        const text = this.add.text(400, 300, "Press Space to Continue", {
            fontFamily: Fonts.PressStart2P
        })
        text.setOrigin(0.5)
    }
}