class SceneMainMenu extends Phaser.Scene {
    constructor() {
        super({
            key: "SceneMainMenu"
        });
    }

    preload() {
        this.load.image("sprBtnPlay", "content/sprBtnPlay.png");
        this.load.image("sprBtnPlayHover", "content/sprBtnPlayHover.png");
        this.load.image("sprBtnPlayDown", "content/sprBtnPlayDown.png");
        this.load.image("sprBtnRestart", "content/sprBtnRestart.png");
        this.load.image("sprBtnRestartHover", "content/sprBtnRestartHover.png");
        this.load.image("sprBtnRestartDown", "content/sprBtnRestartDown.png");

        this.load.audio("sndBtnOver", "content/sndBtnOver.wav");
        this.load.audio("sndBtnDown", "content/sndBtnDown.wav");

        this.load.image("sprBg0", "content/sprBg0.png");
        this.load.image("sprBg1", "content/sprBg1.png");
        this.load.spritesheet("sprExplosion", "content/sprExplosion.png", {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.audio("bgm", "content/quiet_melancholy.mp3");
    }

    create() {
        this.sfx = {
            btnOver: this.sound.add("sndBtnOver"),
            btnDown: this.sound.add("sndBtnDown")
        };

        var music = this.sound.add("bgm", { volume: 0.4 });
        music.setLoop(true);
        music.play();

        this.btnPlay = this.add.sprite(
            this.game.config.width * 0.5,
            this.game.config.height * 0.5,
            "sprBtnPlay"
        );
        this.btnPlay.setInteractive();
        this.btnPlay.on("pointerover", function () {
            this.btnPlay.setTexture("sprBtnPlayHover"); // set the button texture to sprBtnPlayHover
            this.sfx.btnOver.play(); // play the button over sound
        }, this);
        this.btnPlay.on("pointerout", function () {
            this.setTexture("sprBtnPlay");
        });
        this.btnPlay.on("pointerdown", function () {
            this.btnPlay.setTexture("sprBtnPlayDown");
            this.sfx.btnDown.play();
        }, this);
        this.btnPlay.on("pointerup", function () {
            this.btnPlay.setTexture("sprBtnPlay");
            music.stop();
            this.scene.start("SceneMain");
        }, this);

        // this.btnPlay2 = this.add.sprite(
        //     this.game.config.width * 0.5,
        //     this.game.config.height * 0.6,
        //     "sprBtnPlay"
        // );
        // this.btnPlay2.setInteractive();
        // this.btnPlay2.on("pointerover", function () {
        //     this.btnPlay2.setTexture("sprBtnPlayHover"); // set the button texture to sprBtnPlayHover
        //     this.sfx.btnOver.play(); // play the button over sound
        // }, this);
        // this.btnPlay2.on("pointerout", function () {
        //     this.setTexture("sprBtnPlay");
        // });
        // this.btnPlay2.on("pointerdown", function () {
        //     this.btnPlay2.setTexture("sprBtnPlayDown");
        //     this.sfx.btnDown.play();
        // }, this);
        // this.btnPlay2.on("pointerup", function () {
        //     this.btnPlay2.setTexture("sprBtnPlay");
        //     music.stop();
        //     this.scene.start("SceneTest");
        // }, this);

        this.title = this.add.text(this.game.config.width * 0.5, 128, "JS Shmup Project", {
            fontFamily: 'uiFont',
            fontSize: 28,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        });
        this.title.setOrigin(0.5);

        this.title2 = this.add.text(this.game.config.width * 0.75, 148, "JS STG プロジェクト", {
            fontFamily: 'uiFont',
            fontSize: 12,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'right'
        });
        this.title2.setOrigin(0.5);

        this.ver = this.add.text(this.game.config.width * 0.85, this.game.config.height * 0.95, "v0.2.3", {
            fontFamily: 'uiFont',
            fontSize: 12,
            color: '#ffffff',
            align: 'right'
        })

        this.backgrounds = [];
        for (var i = 0; i < 5; i++) {
            var keys = ["sprBg0", "sprBg1"];
            var key = keys[Phaser.Math.Between(0, keys.length - 1)];
            var bg = new ScrollingBackground(this, key, i * 10);
            this.backgrounds.push(bg);
        }
    }

    update() {
        for (var i = 0; i < this.backgrounds.length; i++) {
            this.backgrounds[i].update();
        }
    }
}