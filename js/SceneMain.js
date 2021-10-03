class ScenePause extends Phaser.Scene {
    constructor() {
        super({
            key: "ScenePause"
        });
    }

    preload() {
        this.option = 1;
        this.load.audio("sndBtnOver", "content/sndBtnOver.wav");
        this.load.audio("sndBtnDown", "content/sndBtnDown.wav");
    }

    create() {
        var sfx = {
            btnOver: this.sound.add("sndBtnOver", {
                volume: 0.2
            }),
            btnDown: this.sound.add("sndBtnDown", {
                volume: 0.2
            })
        };

        var menu = this.add.rectangle(142, 210, 200, 120, 0x000000);
        menu.setOrigin(0);
        menu.setStrokeStyle(2, 0xffffff);
        var pause = this.add.bitmapText(200, 230, 'uiFont', 'PAUSE', 24);
        var resume = this.add.bitmapText(203, 270, 'uiFont', '> Resume', 14);
        var retry = this.add.bitmapText(208, 300, 'uiFont', '   Retry', 14);

        menu.setDepth(10);
        pause.setDepth(10);
        resume.setDepth(10);
        retry.setDepth(10);

        retry.alpha = 0.3;

        this.input.keyboard.on('keydown-ENTER', function (event) {
            sfx.btnDown.play();
            if (this.option == 2) {
                this.option = 1;
                this.game.scene.bringToTop('SceneMain');
                //this.game.scene.sleep('ScenePause');
                var reset = this.game.scene.getScene('ScenePause');
                reset.scene.stop();
                var reset = this.game.scene.getScene('SceneMain');
                reset.scene.restart();
            } else {
                this.game.scene.bringToTop('SceneMain');
                var reset = this.game.scene.getScene('ScenePause');
                reset.scene.stop();
                this.game.scene.resume('SceneMain');
            }
        });

        this.input.keyboard.on('keydown-DOWN', function (event) {
            sfx.btnOver.play();
            this.option = 2;
            resume.alpha = 0.3;
            retry.alpha = 1;
            resume.setText('   Resume');
            retry.setText('> Retry');
        });

        this.input.keyboard.on('keydown-UP', function (event) {
            sfx.btnOver.play();
            this.option = 1;
            resume.alpha = 1;
            retry.alpha = 0.3;
            resume.setText('> Resume');
            retry.setText('   Retry');
        });
    }
}

class SceneClear extends Phaser.Scene {
    constructor() {
        super({
            key: "SceneClear"
        });
    }

    preload() {
        this.load.audio("sndBtnDown", "content/sndBtnDown.wav");
    }

    init(data) {
        this.score = data.score;
        this.lives = data.lives;
        this.timeBonus = data.time;
        this.bgmReset = data.bgmReset;
    }

    create() {
        var btnDown = this.sound.add("sndBtnDown", {
            volume: 0.2
        })
        var bossBgm = this.bgmReset;
        var screen = this.add.rectangle(142, 210, 200, 160, 0x000000);
        var score = this.score;
        screen.setStrokeStyle(2, 0xffffff);
        screen.setOrigin(0);
        this.add.bitmapText(162, 220, 'uiFont', 'BOSS CLEAR', 24);
        var bonusScore = 10000;
        var timeBonus;
        if (this.timeBonus > 0) {
            timeBonus = 50000;
        } else {
            timeBonus = 0;
        }
        var livesText = this.add.bitmapText(156, 265, 'uiFont', 'LIFE BONUS: ' + bonusScore + 'x' + this.lives, 14);
        var timeText = this.add.bitmapText(156, 285, 'uiFont', 'TIME BONUS: ' + timeBonus, 14);
        var scoreText = this.add.bitmapText(156, 325, 'uiFont', 'SCORE: ' + score, 14);
        this.add.bitmapText(160, 350, 'uiFont', 'Press ENTER to retry', 10);
        this.time.addEvent({
            delay: 60,
            callback: function () {
                bonusScore -= 100;
                if (timeBonus != 0) timeBonus -= 500;
                livesText.setText('LIFE BONUS: ' + bonusScore + 'x' + this.lives);
                timeText.setText('TIME BONUS: ' + timeBonus);
                score += (100 * this.lives);
                if (timeBonus != 0) score += 500;
                scoreText.setText('SCORE: ' + score);
                this.score = score;
            },
            callbackScope: this,
            repeat: 99
        });

        this.input.keyboard.on('keydown-ENTER', function (event) {
            btnDown.play();
            this.game.scene.bringToTop('SceneMain');
            //this.game.scene.sleep('ScenePause');
            bossBgm.stop();
            var reset = this.game.scene.getScene('SceneClear');
            reset.scene.stop();
            var reset = this.game.scene.getScene('SceneMain');
            reset.scene.restart();
        });
    }

}

class SceneMain extends Phaser.Scene {
    constructor() {
        super({
            key: "SceneMain"
        });
    }

    preload() {
        //#region image assets
        this.load.bitmapFont('uiFont', 'content/uiFont.png', 'content/uiFont.fnt');

        this.load.image("sprBg0", "content/sprBg0.png");
        this.load.image("sprBg1", "content/sprBg1.png");
        this.load.image("sprWarning", "content/sprWarning.png");
        this.load.image("uiWeaponInput", "content/uiWeaponInput.png");
        this.load.image("uiWeapon1", "content/uiWeapon1.png");
        this.load.image("uiWeapon2", "content/uiWeapon2.png");
        this.load.image("uiWeapon3", "content/uiWeapon3.png");
        this.load.image("uiWeapon4", "content/uiWeapon4.png");
        this.load.image("uiWeapon1off", "content/uiWeapon1off.png");
        this.load.image("uiWeapon2off", "content/uiWeapon2off.png");
        this.load.image("uiWeapon3off", "content/uiWeapon3off.png");
        this.load.image("uiWeapon4off", "content/uiWeapon4off.png");
        this.load.spritesheet("sprExplosion", "content/sprExplosion2.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet("sprEnemy0", "content/sprEnemy0.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("sprChaser", "content/sprChaser.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("sprBox", "content/sprBox.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("sprMeteor", "content/sprMeteor.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image("sprLaserEnemy0", "content/sprLaserEnemy0.png");
        this.load.image("sprLaserEnemy1", "content/sprLaserEnemy1.png");
        this.load.image("sprDestructableBullet", "content/sprDestructableBullet.png");
        this.load.image("sprLaserEnemyTail", "content/sprLaserEnemyTail.png");
        this.load.image("sprLaserPlayer1", "content/sprLaserPlayer1.png");
        this.load.spritesheet("sprLaserPlayer2", "content/sprLaserPlayer2.png", {
            frameWidth: 5,
            frameHeight: 8
        });
        this.load.image("sprFocusBeam", "content/sprFocusBeam.png");
        this.load.spritesheet("sprPlayer", "content/sprPlayer.png", {
            frameWidth: 16,
            frameHeight: 16,
            endFrame: 19
        });
        this.load.image("sprPowerUp", "content/sprPowerUp.png");
        this.load.spritesheet("sprOrb", "content/sprOrb.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("spr1up", "content/spr1up.png", {
            frameWidth: 28,
            frameHeight: 13
        });
        this.load.spritesheet("sprHoming", "content/sprHoming.png", {
            frameWidth: 8,
            frameHeight: 8
        })

        this.load.image("penguin", "content/penguin.png");
        this.load.image("penguinMad", "content/penguinMad.png");
        //#endregion
        //#region audio assets
        this.load.audio("sndExplode0", "content/sndExplode0.wav");
        this.load.audio("sndExplode1", "content/sndExplode1.wav");
        this.load.audio("sndSpread", "content/sndLaser2.wav");
        this.load.audio("sndOrbs", "content/laser3.ogg");
        this.load.audio("sndPowerUp", "content/sndPowerUp.wav");
        this.load.audio("snd1up", "content/snd1up.wav");
        this.load.audio("sndHit", "content/sndHit.wav");
        this.load.audio("sndHit2", "content/sndHit2.wav");

        this.load.audio("bgm1", "content/Electric_Highway.mp3");
        this.load.audio("bgm2", "content/RAIN_&_Co_II.mp3");
        this.load.audio("bgm3", "content/伍式.mp3");
        //#endregion
    }

    create() {
        this.bounds = this.physics.world.setBounds(10, 10, 462, 585, true, true, true, true);

        //#region animations
        this.anims.create({
            key: "sprChaserSpread",
            frames: this.anims.generateFrameNumbers("sprChaser", { start: 0, end: 3}),
            frameRate: 50,
            repeat: -1
        });

        this.anims.create({
            key: "sprChaserBeam",
            frames: this.anims.generateFrameNumbers("sprChaser", { start: 4, end: 7}),
            frameRate: 50,
            repeat: -1
        });

        this.anims.create({
            key: "sprChaserHoming",
            frames: this.anims.generateFrameNumbers("sprChaser", { start: 8, end: 11}),
            frameRate: 50,
            repeat: -1
        });

        this.anims.create({
            key: "sprChaserOrbs",
            frames: this.anims.generateFrameNumbers("sprChaser", { start: 12, end: 15}),
            frameRate: 50,
            repeat: -1
        });

        this.anims.create({
            key: "sprEnemy0Spread",
            frames: this.anims.generateFrameNumbers("sprEnemy0", { start: 0, end: 3}),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "sprEnemy0Beam",
            frames: this.anims.generateFrameNumbers("sprEnemy0", { start: 4, end: 7}),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "sprEnemy0Homing",
            frames: this.anims.generateFrameNumbers("sprEnemy0", { start: 8, end: 11}),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "sprEnemy0Orbs",
            frames: this.anims.generateFrameNumbers("sprEnemy0", { start: 12, end: 15}),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "sprBoxSpread",
            frames: this.anims.generateFrameNumbers("sprBox", { start: 0, end: 7 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: "sprBoxBeam",
            frames: this.anims.generateFrameNumbers("sprBox", { start: 8, end: 15 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: "sprBoxHoming",
            frames: this.anims.generateFrameNumbers("sprBox", { start: 16, end: 23 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: "sprBoxOrbs",
            frames: this.anims.generateFrameNumbers("sprBox", { start: 24, end: 31 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: "sprExplosion",
            frames: this.anims.generateFrameNumbers("sprExplosion"),
            frameRate: 60,
            scale: 0.5,
            repeat: 0
        });

        this.anims.create({
            key: "sprPlayer",
            frames: this.anims.generateFrameNumbers("sprPlayer", { start: 0, end: 3 }),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "sprPlayerSpread",
            frames: this.anims.generateFrameNumbers("sprPlayer", { start: 4, end: 7}),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "sprPlayerBeam",
            frames: this.anims.generateFrameNumbers("sprPlayer", { start: 8, end: 11}),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "sprPlayerHoming",
            frames: this.anims.generateFrameNumbers("sprPlayer", { start: 12, end: 15}),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "sprPlayerOrbs",
            frames: this.anims.generateFrameNumbers("sprPlayer", { start: 16, end: 19}),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "sprLaserPlayer2",
            frames: this.anims.generateFrameNumbers("sprLaserPlayer2"),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "spr1up",
            frames: this.anims.generateFrameNumbers("spr1up"),
            frameRate: 10,
            repeat: 4
        });

        this.anims.create({
            key: "sprOrb",
            frames: this.anims.generateFrameNumbers("sprOrb"),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "sprHoming",
            frames: this.anims.generateFrameNumbers("sprHoming"),
            frameRate: 20,
            repeat: -1
        });

        //#endregion
        //#region sound effects/music
        this.sfx = {
            explosions: [
                this.sound.add("sndExplode0", {
                    volume: 0.2
                }),
                this.sound.add("sndExplode1", {
                    volume: 0.2
                })
            ],
            spread: this.sound.add("sndSpread", {
                volume: 0.1
            }),
            orbs: this.sound.add("sndOrbs", {
                volume: 0.2
            }),
            powerUp: this.sound.add("sndPowerUp", {
                volume: 0.1
            }),
            oneUp: this.sound.add("snd1up", {
                volume: 0.2
            }),
            hit: this.sound.add("sndHit", {
                volume: 0.3
            }),
            hit2: this.sound.add("sndHit2", {
                volume: 0.1
            })
        };
        //Starts background music loop
        this.music = [this.sound.add("bgm1", {
                volume: 0.2
            }),
            this.sound.add("bgm2", {
                volume: 0.2
            })
        ];
        this.bossMusic = this.sound.add("bgm3", {
            volume: 0
        })
        var track = Phaser.Math.Between(0, 1);
        if (this.bgm !== undefined) this.bgm.stop();
        this.bgm = this.music[track].setLoop(true);
        if (this.bossBgm !== undefined) this.bossBgm.stop();
        this.bossBgm = this.bossMusic.setLoop(true);
        this.bgm.play();
        //#endregion

        //#region Entities Initialization
        this.backgrounds = [];
        for (var i = 0; i < 5; i++) { // create five scrolling backgrounds
            var bg = new ScrollingBackground(this, "sprBg0", i * 10);
            this.backgrounds.push(bg);
        }
        this.uiBackground = this.add.rectangle(638, 300, 328, 600, 0x222222).setDepth(7);

        //Initializes player ship object
        this.player = new Player(
            this,
            this.physics.world.bounds.width * 0.5,
            this.physics.world.bounds.height * 0.85,
            "sprPlayer"
        );
        this.player.customBoundsRectangle = this.physics.world.bounds;
        this.player.body.collideWorldBounds = true;
        this.player.onWorldBounds = true;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        // this.input.keyboard.on('keydown-X', function (event) {
        //     this.scene.player.changeWeapon('left');
        // });
        // this.input.keyboard.on('keydown-C', function (event) {
        //     this.scene.player.changeWeapon('right');
        // });
        // this.input.keyboard.on('keydown-SHIFT', function () {
        //     this.scene.player.changeSpeed();
        // });
        this.input.keyboard.on('keydown-ESC', function (event) {
            this.game.scene.start('ScenePause');
            this.game.scene.bringToTop('ScenePause');
            this.game.scene.pause('SceneMain');
        });
        // this.input.keyboard.on('keydown-A', function(event){
        //     this.scene.player.lives++;
        //     this.scene.updateLives();
        // })
        // this.input.keyboard.on('keydown-S', function(event){
        //     this.scene.player.lives--;
        //     this.scene.updateLives();
        // })

        //Initializes Level Display
        var levelText;
        levelText = this.add.bitmapText(580, 10,
            'uiFont',
            '--Level 1--',
            18);
        levelText.setDepth(10);

        //Initializes Player Score display and value
        var scoreText;
        scoreText = this.add.bitmapText(500, 50, 'uiFont', 'SCORE: 0', 18);
        scoreText.setDepth(10);
        this.player.score = 0;

        //Initializes Player Lives display          
        this.livesDisplay = this.add.group();
        this.livesDisplay.setDepth(10);
        this.livesText = this.add.bitmapText(500, 140, 'uiFont', "LIVES: ", 18).setDepth(10);
        this.qtyText = this.add.group();
        this.qtyText.setDepth(10);
        this.updateLives();


        //Speed and Power displays
        //this.speedText = this.add.bitmapText(500, 200, 'uiFont', 'SPEED: >>', 18).setDepth(10);
        this.powerText = this.add.bitmapText(500, 170, 'uiFont', 'POWER: 1', 18).setDepth(10);
        this.weaponText = this.add.bitmapText(500, 300, 'uiFont', 'WEAPON: SPREAD', 18).setDepth(10);
        //this.selectText = this.add.bitmapText(500, 390, 'uiFont', '[X] << SWITCH WEAPON >> [C]', 18).setDepth(10);
        this.weaponUI = this.add.group({
            key: ['uiWeapon1', 'uiWeapon2', 'uiWeapon3', 'uiWeapon4']
        });
        this.weaponUI.setDepth(10);
        this.weaponUI.scaleXY(2);
        this.updateWeaponUI();

        Phaser.Actions.GridAlign(this.weaponUI.getChildren(), {
            width: 4,
            height: 2,
            cellWidth: 26 * 3,
            cellHeight: 20 * 3,
            x: 550,
            y: 370
        });

        this.weaponUiInput = this.add.image(630, 365, "uiWeaponInput").setDepth(11);
        this.weaponUiInput.scale = 3;

        //Used for bonus life calculations
        var multiplier = 1;
        var nextLife = 5000;

        //Initializes Entities groups
        this.enemies = this.add.group();
        this.enemyLasers = this.add.group();
        this.playerLasers = this.add.group();
        this.powerUps = this.add.group();
        this.dummy = this.add.group();
        this.dummy.setDepth(10);
        this.orbs = this.add.group();
        //#endregion

        this.circle = new Phaser.Geom.Circle(this.player.x, this.player.y, 50);

        this.startAngle = this.tweens.addCounter({
            from: 0,
            to: 6.28,
            duration: 2000,
            repeat: -1
        })

        this.endAngle = this.tweens.addCounter({
            from: 6.28,
            to: 12.56,
            duration: 2000,
            repeat: -1
        })

        //#region Clock-based events
        //Initializes in-game Timer display
        var seconds = 0;
        var minutes = 0;
        this.timerText = this.add.bitmapText(500, 80,
            'uiFont',
            'TIME: 00:00',
            18, );
        this.timerText.setDepth(10);
        this.time.addEvent({
            delay: 1000,
            callback: function () {
                seconds++;
                if (seconds == 60) {
                    minutes++;
                    seconds = 0;
                }
                if (minutes < 10 && seconds < 10) this.timerText.setText('TIME: 0' + minutes + ':0' + seconds);
                else if (minutes < 10) this.timerText.setText('TIME: 0' + minutes + ':' + seconds);
                else if (seconds < 10) this.timerText.setText('TIME: ' + minutes + ':0' + seconds);
                else this.timerText.setText('TIME: ' + minutes + ':' + seconds);
            },
            callbackScope: this,
            loop: true
        });

        // Difficulty multiplier controller
        // Increases difficulty by 1 at every set interval
        // Increases Enemy Health, Speed and Scoring values according to multiplier
        // Also reduces spawn timer delay
        this.diffMulti = 1;
        this.time.addEvent({
            delay: 60000,
            callback: function () {
                this.diffMulti++;
                levelText.setText('--Level ' + this.diffMulti + '--');
            },
            callbackScope: this,
            repeat: 2
        });

        var spawnOrder = [];
        for (var i = 0; i < 25; i++) {
            spawnOrder.push(1);
            spawnOrder.push(2);
            spawnOrder.push(3);
        }
        spawnOrder = spawnOrder.sort(() => Math.random() - 0.5);
        var index = 0;
        this.spawner = this.time.addEvent({
            startAt: 4000,
            delay: 4000,
            callback: function () {
                switch (spawnOrder[index]) {
                    case 1:
                        this.time.addEvent({
                            startAt: 1000,
                            delay: 1200,
                            callback: function () {
                                this.spawnGunShipWave();
                            },
                            repeat: 2,
                            callbackScope: this
                        });
                        break;
                    case 2:
                        this.spawnChaserShipWave();
                        break;
                    case 3:
                        this.spawnMeteorWave();
                        break;
                }
                index++;
            },
            callbackScope: this,
            loop: true
        });

        this.carrierSpawn = this.time.addEvent({
            delay: 30000,
            callback: function () {
                var type = Phaser.Math.Between(1, 4);
                this.enemies.add(new CarrierShip(this,
                    Phaser.Math.Between(this.physics.world.bounds.width * 0.1, this.physics.world.bounds.width * 0.9),
                    0,
                    this.diffMulti,
                    type))
            },
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: 298000,
            callback: function () {
                this.tweens.add({
                    targets: this.bgm,
                    volume: 0,
                    duration: 2000
                });
                this.tweens.add({
                    targets: this.bossBgm,
                    volume: 0.2,
                    delay: 4000,
                    duration: 2000
                });
                this.bossBgm.play();
            },
            callbackScope: this
        })

        this.time.addEvent({
            delay: 300000,
            callback: function () {
                this.bgm.stop();
                this.spawnBoss(2000);
            },
            callbackScope: this
        });

        Phaser.Actions.PlaceOnCircle(this.orbs.getChildren(), this.circle, this.startAngle, this.endAngle);

        //#region Collisions/Overlaps
        this.physics.add.overlap(this.playerLasers, this.enemies, function (playerLaser, enemy) {
            if (enemy) {
                //Reduces enemy health by weapon damage value on every hit
                if (!(playerLaser instanceof focusBeam)) {
                    playerLaser.destroy();
                }
                enemy.onHit(playerLaser);
                if (enemy.health <= 0) {
                    enemy.body.enable = false;
                    if (enemy.wave !== undefined) {
                        enemy.wave.updateCount(enemy.x, enemy.y);
                    }
                    if (enemy instanceof Boss) {
                        enemy.explode(false);
                    } else {
                        enemy.explode(true);
                    }
                    //Scoring award and Life ups
                    enemy.scene.player.score += enemy.score;
                    scoreText.setText('SCORE: ' + enemy.scene.player.score);
                    if (enemy.scene.player.score > nextLife) {
                        enemy.scene.player.lives += 1;
                        enemy.scene.updateLives();
                        multiplier += 1.2; //Increases multiplier for next Life Up
                        nextLife += nextLife * multiplier; //Sets the value for next Life Up
                        enemy.scene.dummy = new DummyOneUp(enemy.scene, enemy.x, enemy.y);
                        enemy.scene.sfx.oneUp.play();
                    }
                    if (enemy.onDestroy !== undefined) {
                        enemy.onDestroy();
                    }
                }
                //Play a sound effect and blinks the enemy every time it is damaged
                else {
                    enemy.scene.sfx.hit2.play();
                    enemy.setTintFill(0xffffff);
                    enemy.scene.time.delayedCall(10, function () {
                        enemy.clearTint();
                    }, this);
                }
            }
        });

        this.physics.add.overlap(this.player, this.enemies, function (player, enemy) {
            if (player.isVulnerable == true) { //Player is Vulnerable
                if (!player.getData("isDead") &&
                    !enemy.getData("isDead")) {
                    player.onHit();
                    if (player.lives == 0) {
                        player.explode(false);
                        player.onDestroy();
                        player.scene.bgm.stop();
                    } else {
                        player.isVulnerable = false; //Player is Invulnerable
                        player.scene.time.addEvent(player.invulTimer);
                    }
                }
            }
        });

        this.physics.add.overlap(this.player, this.enemyLasers, function (player, laser) {
            if (player.isVulnerable == true) {
                if (!player.getData("isDead") &&
                    !laser.getData("isDead")) {
                    if (!(laser instanceof HomingLaser)) {
                        laser.destroy();
                    }
                    player.onHit();
                    if (player.lives == 0) {
                        player.explode(false);
                        player.onDestroy();
                        player.scene.bgm.stop();
                        player.scene.bossBgm.stop();
                    } else {
                        player.isVulnerable = false;
                        player.scene.time.addEvent(player.invulTimer);
                    }
                }
            }
        });

        this.physics.add.overlap(this.orbs, this.enemyLasers, function (orb, laser) {
            if (laser instanceof EnemyBullet) {
                laser.destroy();
            }
        });

        this.physics.add.overlap(this.enemyLasers, this.playerLasers, function (bullet, laser) {
            if (bullet instanceof DestructableBullet) {
                if (!(laser instanceof focusBeam)) {
                    laser.destroy();
                }
                bullet.onHit(laser);
            }
        });

        this.physics.add.overlap(this.orbs, this.enemies, function (orb, enemy) {
            if (enemy) {
                //Reduces enemy health by 1 on every hit
                enemy.health--;
                if (enemy.health <= 0) {
                    enemy.body.enable = false;
                    if (enemy.wave !== undefined) {
                        enemy.wave.updateCount(enemy.x, enemy.y);
                    }
                    if (enemy instanceof Boss) {
                        enemy.explode(false);
                    } else {
                        enemy.explode(true);
                    }
                    //Scoring award and Life ups
                    enemy.scene.player.score += enemy.score;
                    scoreText.setText('SCORE: ' + enemy.scene.player.score);
                    if (enemy.scene.player.score > nextLife) {
                        enemy.scene.player.lives += 1;
                        enemy.scene.updateLives();
                        multiplier += 1.2; //Increases multiplier for next Life Up
                        nextLife += nextLife * multiplier; //Sets the value for next Life Up
                        enemy.scene.dummy = new DummyOneUp(enemy.scene, enemy.x, enemy.y);
                        enemy.scene.sfx.oneUp.play();
                    }
                    if (enemy.onDestroy !== undefined) {
                        enemy.onDestroy();
                    }
                }
                //Play a sound effect and blinks the enemy every time it is damaged
                else {
                    enemy.scene.sfx.hit2.play();
                    enemy.setTintFill(0xffffff);
                    enemy.scene.time.delayedCall(10, function () {
                        enemy.clearTint();
                    }, this);
                }
            }
        });

        this.physics.add.overlap(this.player, this.powerUps, function (player, powerUp) {
            //Increases power by 1; If at limit, increases Score instead
            if (!player.getData("isDead")) {
                if (player.power >= 1 && player.power <= 4) {
                    player.power += 1;
                    player.scene.updatePower();
                    player.updateOrbs();
                } else {
                    //Scoring award and Life ups
                    player.score += powerUp.score;
                    scoreText.setText('SCORE: ' + player.score);
                    if (player.score > nextLife) {
                        player.lives += 1;
                        player.scene.updateLives();
                        multiplier += 1.2;
                        nextLife += nextLife * multiplier;
                        player.scene.dummy = new DummyOneUp(player.scene, player.x, player.y);
                        player.scene.sfx.oneUp.play();
                    }
                }
                powerUp.onDestroy();
                powerUp.destroy();
            }
        });
        //#endregion            
    }

    update() {

        this.updateWeaponUI();

        Phaser.Actions.SetXY([this.circle], this.player.x, this.player.y);

        if (this.player.weapon != 10) {
            Phaser.Actions.PlaceOnCircle(
                this.orbs.getChildren(),
                this.circle,
                this.startAngle.getValue(),
                this.endAngle.getValue()
            );
        }

        for (var i = 0; i < this.orbs.getChildren().length; i++) {
            var orb = this.orbs.getChildren()[i];

            orb.update();
        }

        //Background scroll
        for (var i = 0; i < this.backgrounds.length; i++) {
            this.backgrounds[i].update();
        }

        //Resets Player invulnerability
        var invulProgress = this.player.invulTimer.getProgress();
        if (invulProgress == 1) {
            this.player.flick.stop();
            this.player.alpha = 1;
            this.player.isVulnerable = true;
        }

        //#region Updates player inputs
        if (!this.player.getData("isDead")) {
            this.player.update();
            if (this.cursors.up.isDown) {
                this.player.moveUp();
            } else if (this.cursors.down.isDown) {
                this.player.moveDown();
            }
            if (this.cursors.left.isDown) {
                this.player.moveLeft();
            } else if (this.cursors.right.isDown) {
                this.player.moveRight();
            }

            // if (this.keyZ.isDown) {
            //     this.player.setData("isShooting", true);
            // } else {
            //     this.player.setData("isShooting", false);
            // }
            // if (this.keyE.isDown && this.keyR.isDown) {
            //     if (this.orbs.getChildren().length == 0) {
            //         this.player.updateOrbs();
            //     }
            //     this.player.weapon = 10;
            //     this.player.setData("isShooting", true);
            // } else 
            if (this.keyQ.isDown) {
                if(this.player.weapon != 1)this.player.play("sprPlayerSpread");
                this.orbs.clear(false, true);
                this.player.weapon = 1;
                this.player.setData("isShooting", true);
            } else if (this.keyW.isDown) {
                if(this.player.weapon != 2)this.player.play("sprPlayerBeam");
                this.orbs.clear(false, true);
                this.player.weapon = 2;
                this.player.setData("isShooting", true);
            } else if (this.keyE.isDown) {
                if(this.player.weapon != 3)this.player.play("sprPlayerHoming");
                this.orbs.clear(false, true);
                this.player.weapon = 3;
                this.player.setData("isShooting", true);
            } else if (this.keyR.isDown) {
                if(this.player.weapon != 4)this.player.play("sprPlayerOrbs");
                if (this.orbs.getChildren().length == 0) {
                    this.player.updateOrbs();
                }
                this.player.weapon = 4;
                this.player.setData("isShooting", true);
            } else {
                this.player.setData("isShooting", false);
                this.orbs.clear(false, true);
                if(this.player.weapon != 0)this.player.play("sprPlayer");
                this.player.weapon = 0;
            }


        }
        //#endregion

        //#region Removes objects when Out of Bounds
        for (var i = 0; i < this.enemies.getChildren().length; i++) {
            var enemy = this.enemies.getChildren()[i];

            enemy.update();

            if (enemy.x < -enemy.displayWidth ||
                enemy.x > this.physics.world.bounds.width + enemy.displayWidth ||
                enemy.y < -enemy.displayHeight * 4 ||
                enemy.y > this.physics.world.bounds.height + enemy.displayHeight) {

                if (enemy) {
                    enemy.setData("isDead", true);
                    if (enemy.onDestroy !== undefined) {
                        enemy.onDestroy();
                    }
                    enemy.destroy();
                }

            }
        }

        for (var i = 0; i < this.enemyLasers.getChildren().length; i++) {
            var laser = this.enemyLasers.getChildren()[i];
            laser.update();

            if (laser.x < -laser.displayWidth ||
                laser.x > this.physics.world.bounds.width + laser.displayWidth ||
                laser.y < -laser.displayHeight * 4 ||
                laser.y > this.physics.world.bounds.height + laser.displayHeight) {
                if (laser) {
                    if (laser.onDestroy !== undefined) {
                        laser.onDestroy();
                    }
                    laser.destroy();
                }
            }
        }

        for (var i = 0; i < this.powerUps.getChildren().length; i++) {
            var powerUp = this.powerUps.getChildren()[i];
            powerUp.update();

            if (powerUp.x < -powerUp.displayWidth ||
                powerUp.x > this.physics.world.bounds.width + powerUp.displayWidth ||
                powerUp.y < -powerUp.displayHeight * 4 ||
                powerUp.y > this.physics.world.bounds.height + powerUp.displayHeight) {
                if (powerUp) {
                    powerUp.destroy();
                }
            }
        }

        for (var i = 0; i < this.playerLasers.getChildren().length; i++) {
            var laser = this.playerLasers.getChildren()[i];
            laser.update();

            if (laser.x < -laser.displayWidth ||
                laser.x > this.physics.world.bounds.width + laser.displayWidth ||
                laser.y < -laser.displayHeight * 4 ||
                laser.y > this.physics.world.bounds.height + laser.displayHeight) {
                if (laser) {
                    laser.destroy();
                }
            }
        }
        //#endregion
    }

    updatePower() {
        this.powerText.setText('POWER: ' + this.player.power);
    }

    updateLives() {
        this.livesDisplay.clear(false, true);
        this.qtyText.destroy();
        if (this.player.lives <= 5) {
            this.livesDisplay = this.add.group({
                key: 'sprPlayer',
                frameQuantity: this.player.lives
            });
        } else {
            this.livesDisplay = this.add.group({
                key: 'sprPlayer'
            });
            this.qtyText = this.add.bitmapText(620, 140, 'uiFont', 'x' + this.player.lives, 18);
            this.qtyText.setDepth(10);
        }
        this.livesDisplay.scaleXY(1);
        Phaser.Actions.GridAlign(this.livesDisplay.getChildren(), {
            width: 10,
            height: 10,
            cellWidth: 40,
            cellHeight: 40,
            x: 605,
            y: 160
        });
        this.livesDisplay.setDepth(10);
    }

    updateWeaponUI() {
        switch (this.player.weapon) {
            case 0:
                this.weaponText.setText('WEAPON:');
                this.weaponUI.getChildren()[0].setTexture("uiWeapon1off");
                this.weaponUI.getChildren()[1].setTexture("uiWeapon2off");
                this.weaponUI.getChildren()[2].setTexture("uiWeapon3off");
                this.weaponUI.getChildren()[3].setTexture("uiWeapon4off");
                break;
            case 1:
                this.weaponText.setText('WEAPON: SPREAD');
                this.weaponUI.getChildren()[0].setTexture("uiWeapon1");
                this.weaponUI.getChildren()[1].setTexture("uiWeapon2off");
                this.weaponUI.getChildren()[2].setTexture("uiWeapon3off");
                this.weaponUI.getChildren()[3].setTexture("uiWeapon4off");
                break;
            case 2:
                this.weaponText.setText('WEAPON: BEAM');
                this.weaponUI.getChildren()[0].setTexture("uiWeapon1off");
                this.weaponUI.getChildren()[1].setTexture("uiWeapon2");
                this.weaponUI.getChildren()[2].setTexture("uiWeapon3off");
                this.weaponUI.getChildren()[3].setTexture("uiWeapon4off");
                break;
            case 3:
                this.weaponText.setText('WEAPON: HOMING');
                this.weaponUI.getChildren()[0].setTexture("uiWeapon1off");
                this.weaponUI.getChildren()[1].setTexture("uiWeapon2off");
                this.weaponUI.getChildren()[2].setTexture("uiWeapon3");
                this.weaponUI.getChildren()[3].setTexture("uiWeapon4off");
                break;
            case 4:
                this.weaponText.setText('WEAPON: ORBS');
                this.weaponUI.getChildren()[0].setTexture("uiWeapon1off");
                this.weaponUI.getChildren()[1].setTexture("uiWeapon2off");
                this.weaponUI.getChildren()[2].setTexture("uiWeapon3off");
                this.weaponUI.getChildren()[3].setTexture("uiWeapon4");
                break;
            case 10:
                this.weaponText.setText('WEAPON: HOMING ORBS');
                this.weaponUI.getChildren()[0].setTexture("uiWeapon1off");
                this.weaponUI.getChildren()[1].setTexture("uiWeapon2off");
                this.weaponUI.getChildren()[2].setTexture("uiWeapon3");
                this.weaponUI.getChildren()[3].setTexture("uiWeapon4");
                break;
        }
    }

    spawnGunShipWave() {
        var x = Phaser.Math.Between(this.physics.world.bounds.width * 0.2, this.physics.world.bounds.width * 0.8);
        var repeats = Math.floor(this.diffMulti / 2);
        var wave = new Wave(this, 3 + (repeats * 2), this.diffMulti);
        var diff = 30;
        var warning = this.add.image(x, 20, "sprWarning");
        warning.scale = 2;
        warning.setDepth(11);
        var type = Phaser.Math.Between(1, 4);
        this.time.addEvent({
            delay: 1000,
            callback: function () {
                warning.destroy();
                var enemy = new GunShip(this, wave, x, 0, this.diffMulti, type);
                this.enemies.add(enemy);
                this.time.addEvent({
                    delay: 80,
                    callback: function () {
                        var enemy = new GunShip(this, wave, x + diff, 0, this.diffMulti, type);
                        this.enemies.add(enemy);
                        var enemy = new GunShip(this, wave, x - diff, 0, this.diffMulti, type);
                        this.enemies.add(enemy);
                        diff += 30;
                    },
                    callbackScope: this,
                    repeat: 0 + repeats
                });
            },
            callbackScope: this
        });
    }

    spawnChaserShipWave() {
        var wave = new Wave(this, 4 + this.diffMulti, this.diffMulti);
        var origin = Phaser.Math.Between(0, 1);
        if (origin == 0) {
            var warning = this.add.image(30, 20, "sprWarning");
        } else {
            var warning = this.add.image(450, 20, "sprWarning");
        }
        warning.scale = 2;
        warning.setDepth(11);
        var type = Phaser.Math.Between(1, 4);
        this.time.addEvent({
            delay: 1000,
            callback: function () {
                warning.destroy();
                this.time.addEvent({
                    delay: 125,
                    callback: function () {
                        if (origin == 0) {
                            var enemy = new ChaserShip(this, wave, 350, 0, 30, this.diffMulti, type);
                        } else {
                            var enemy = new ChaserShip(this, wave, -350, 480, 30, this.diffMulti, type);
                        }
                        this.enemies.add(enemy);
                    },
                    callbackScope: this,
                    repeat: 3 + this.diffMulti
                });
            },
            callbackScope: this
        });
    }

    spawnMeteorWave() {
        var wave = new Wave(this, 9 + this.diffMulti, this.diffMulti);
        var warning = this.add.group();
        warning.createMultiple({
            key: "sprWarning",
            repeat: 8
        });
        Phaser.Actions.SetXY(warning.getChildren(), 20, 20, 55);
        warning.setDepth(11);
        var type = Phaser.Math.Between(1, 4);
        this.time.addEvent({
            delay: 1000,
            callback: function () {
                warning.destroy(true);
                this.time.addEvent({
                    delay: 300,
                    callback: function () {
                        var x = Phaser.Math.Between(this.physics.world.bounds.width * 0.1, this.physics.world.bounds.width * 0.9);
                        var enemy = new BigMeteor(this, wave, x, 0, this.diffMulti, type);
                        this.enemies.add(enemy);
                    },
                    callbackScope: this,
                    repeat: 8 + this.diffMulti
                });
            },
            callbackScope: this
        });
    }

    spawnBoss(health) {
        this.spawner.destroy();
        this.time.addEvent({
            delay: 10000,
            callback: function () {
                this.enemies.add(new Boss(this, this.physics.world.bounds.width * 0.5, 0, health));
            },
            callbackScope: this
        })
    }

    //Returns enemy Type value, used in spawner logic
    getEnemiesByType(type) {
        var arr = [];
        for (var i = 0; i < this.enemies.getChildren().length; i++) {
            var enemy = this.enemies.getChildren()[i];
            if (enemy.getData("type") == type) {
                arr.push(enemy);
            }
        }
        return arr;
    }
}