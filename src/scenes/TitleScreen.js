import Phaser from 'phaser'

import {Game} from '../consts/SceneKeys'
import * as Fonts from '../consts/Fonts'

import WebFontFile from "./WebFontFile"

export default class TitleScreen extends Phaser.Scene {
    preload() {
        const fonts = new WebFontFile(this.load, 'Press Start 2P')
        this.load.addFile(fonts)
    }

    create() {
        const title = this.add.text(400, 250, "Old School Midi Tennis", {
            fontSize: 34,
            fontFamily: Fonts.PressStart2P
        })
        title.setOrigin(0.5, 0.5)

        const text = this.add.text(400, 300, "Press Space to Start", {
            fontFamily: Fonts.PressStart2P
        })
        text.setOrigin(0.5)

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start(Game)
        })
    }
}