class SceneGameOver extends Phaser.Scene {
  constructor() {
    super({
      key: "SceneGameOver"
    });
  }

  preload(){    
    this.load.bitmapFont('uiFont', 'content/uiFont.png', 'content/uiFont.fnt');
  }

  init (data){
    this.finalScore = data.score;
    this.state = data.state;
  }

  create() {
    this.title = this.add.bitmapText(this.game.config.width * 0.5, 128, 'uiFont', this.state, 32);
    this.title.setOrigin(0.5);

    this.score = this.add.bitmapText(this.game.config.width * 0.5, 188, 'uiFont', "SCORE: " + this.finalScore, 28);
    this.score.setOrigin(0.5);

    this.sfx = {
      btnOver: this.sound.add("sndBtnOver", { volume: 0.2 }),
      btnDown: this.sound.add("sndBtnDown", { volume: 0.2 })
    };

    this.btnRestart = this.add.sprite(
      this.game.config.width * 0.5,
      this.game.config.height * 0.5,
      "sprBtnRestart"
    );

    this.btnRestart.setInteractive();

    this.btnRestart.on("pointerover", function () {
      this.btnRestart.setTexture("sprBtnRestartHover"); // set the button texture to sprBtnPlayHover
      this.sfx.btnOver.play(); // play the button over sound
    }, this);

    this.btnRestart.on("pointerout", function () {
      this.setTexture("sprBtnRestart");
    });

    this.btnRestart.on("pointerdown", function () {
      this.btnRestart.setTexture("sprBtnRestartDown");
      this.sfx.btnDown.play();
    }, this);

    this.btnRestart.on("pointerup", function () {
      this.btnRestart.setTexture("sprBtnRestart");
      this.scene.start("SceneMain");
    }, this);
  }
}