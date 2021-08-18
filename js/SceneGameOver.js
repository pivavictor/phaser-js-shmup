class SceneGameOver extends Phaser.Scene {
  constructor() {
    super({
      key: "SceneGameOver"
    });
  }

  init (data){
    this.finalScore = data.score;
    this.finalTime = data.time;
  }

  create() {
    this.title = this.add.text(this.game.config.width * 0.5, 128, "GAME OVER", {
      fontFamily: 'monospace',
      fontSize: 48,
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    });
    this.title.setOrigin(0.5);

    this.score = this.add.text(this.game.config.width * 0.5, 188, "SCORE: " + this.finalScore, {
      fontFamily: 'monospace',
      fontSize: 36,
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    });
    this.score.setOrigin(0.5);

    console.log(this.finalTime);
    this.time = this.add.text(this.game.config.width * 0.5, 248, this.finalTime.text, {
      fontFamily: 'monospace',
      fontSize: 36,
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    });
    this.time.setOrigin(0.5);

    this.sfx = {
      btnOver: this.sound.add("sndBtnOver"),
      btnDown: this.sound.add("sndBtnDown")
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