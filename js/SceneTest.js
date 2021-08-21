class SceneTest extends Phaser.Scene {
    constructor() {
        super({
            key: "SceneTest"
        });
    }

    preload() {
        //#region image assets
        this.load.image("sprBg0", "content/sprBg0.png");
        this.load.image("sprBg1", "content/sprBg1.png");
        this.load.image("uiWeapon1", "content/uiWeapon1.png");
        this.load.image("uiWeapon2", "content/uiWeapon2.png");
        this.load.image("uiWeapon3", "content/uiWeapon3.png");        
        this.load.image("uiWeapon4", "content/uiWeapon4.png");
        this.load.image("uiWeapon1off", "content/uiWeapon1off.png");
        this.load.image("uiWeapon2off", "content/uiWeapon2off.png");
        this.load.image("uiWeapon3off", "content/uiWeapon3off.png");
        this.load.image("uiWeapon4off", "content/uiWeapon4off.png");
        this.load.spritesheet("sprExplosion", "content/sprExplosion.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet("sprEnemy0", "content/sprEnemy0.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image("sprEnemy1", "content/sprEnemy1.png");
        this.load.spritesheet("sprEnemy2", "content/sprEnemy2.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image("sprMeteor", "content/sprMeteor.png");
        this.load.image("sprLaserEnemy0", "content/sprLaserEnemy0.png");
        this.load.image("sprLaserPlayer1", "content/sprLaserPlayer1.png");
        this.load.image("sprLaserPlayer2", "content/sprLaserPlayer2.png");
        this.load.image("sprFocusBeam", "content/sprFocusBeam.png");
        this.load.spritesheet("sprPlayer", "content/sprPlayer.png", {
            frameWidth: 16,
            frameHeight: 16
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
        this.load.spritesheet("sprPlayerMissile", "content/sprPlayerMissile.png", {
            frameWidth: 4,
            frameHeight: 8
        })
        //#endregion
        //#region audio assets
        this.load.audio("sndExplode0", "content/sndExplode0.wav");
        this.load.audio("sndExplode1", "content/sndExplode1.wav");
        this.load.audio("sndLaser", "content/sndLaser2.wav");
        this.load.audio("sndPowerUp", "content/sndPowerUp.wav");
        this.load.audio("snd1up", "content/snd1up.wav");
        this.load.audio("sndHit", "content/sndHit.wav");
        this.load.audio("sndHit2", "content/sndHit2.wav");

        this.load.audio("bgm1", "content/Electric_Highway.mp3");
        //#endregion
    }

    create() {
        //#region animations
        this.anims.create({
            key: "sprEnemy0",
            frames: this.anims.generateFrameNumbers("sprEnemy0"),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "sprEnemy2",
            frames: this.anims.generateFrameNumbers("sprEnemy2"),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "sprExplosion",
            frames: this.anims.generateFrameNumbers("sprExplosion"),
            frameRate: 20,
            repeat: 0
        });

        this.anims.create({
            key: "sprPlayer",
            frames: this.anims.generateFrameNumbers("sprPlayer"),
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
            key: "sprPlayerMissile",
            frames: this.anims.generateFrameNumbers("sprPlayerMissile"),
            frameRate: 50,
            repeat: -1
        });

        //#endregion
        //#region sound effects/music
        this.sfx = {
            explosions: [
                this.sound.add("sndExplode0"),
                this.sound.add("sndExplode1")
            ],
            laser: this.sound.add("sndLaser", {
                volume: 0.3
            }),
            powerUp: this.sound.add("sndPowerUp", {
                volume: 0.2
            }),
            oneUp: this.sound.add("snd1up", {
                volume: 0.5
            }),
            hit: this.sound.add("sndHit", {
                volume: 0.7
            }),
            hit2: this.sound.add("sndHit2", {
                volume: 0.2
            })
        };        
        //Starts background music loop
        var music = this.sound.add("bgm1", { volume: 0.4 });
        music.setLoop(true);
        music.play();
        //#endregion

        //#region Entities Initialization
        this.backgrounds = [];
        for (var i = 0; i < 5; i++) { // create five scrolling backgrounds
            var bg = new ScrollingBackground(this, "sprBg0", i * 10);
            this.backgrounds.push(bg);
        }        

        //Initializes player ship object
        this.player = new Player(
            this,
            this.game.config.width * 0.5,
            this.game.config.height * 0.85,
            "sprPlayer"
        );               

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.input.keyboard.on('keydown-X', function(event){
            this.scene.player.changeWeapon();
        })
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
        levelText = this.add.text(this.game.config.width * 0.75, 16, '--TEST LEVEL--', {
            fontSize: '12px',
            fill: "#fff"
        });
        
        //Initializes Player Score display and value
        var scoreText;
        scoreText = this.add.text(14, 16, 'Score: 0', {
            fontSize: '18px',
            fill: '#fff'
        });
        this.player.score = 0;

        //Initializes Player Lives display          
        this.livesDisplay = this.add.group();    
        this.qtyText = this.add.group(); 
        this.add.text(14, 36, 'Lives: ', {
            fontSize: '18px',
            fill: '#fff'
        });
        this.updateLives();                        

        this.weaponUI = this.add.group({
            key: ['uiWeapon1', 'uiWeapon2', 'uiWeapon3', 'uiWeapon4']
        });       
        this.updateWeaponUI();
        
        Phaser.Actions.GridAlign(this.weaponUI.getChildren(), {
            width: 4,
            height: 2,
            cellWidth: 26,
            cellHeight: 20,
            x: 14,
            y: 570
        });

        //Used for bonus life calculations
        var multiplier = 1;
        var nextLife = 5000;

        //Initializes Entities groups
        this.enemies = this.add.group();
        this.enemyLasers = this.add.group();
        this.playerLasers = this.add.group();
        this.powerUps = this.add.group();
        this.dummy = this.add.group();
        //#endregion

        this.circle = new Phaser.Geom.Circle(this.player.x, this.player.y, 50);
        this.orbs = this.add.group();
        
        this.startAngle = this.tweens.addCounter({
            from: 0,
            to: 6.28,
            duration: 1000,
            repeat: -1
          })
        
          this.endAngle = this.tweens.addCounter({
            from: 6.28,
            to: 12.56,
            duration: 1000,
            repeat: -1
          })

        //#region Clock-based events
        //Initializes in-game Timer display
        var seconds = 0;
        var minutes = 0;
        this.timerText = this.add.text(this.game.config.width * 0.7, 28, ' Time: 00:00', {
            fontSize: '18px',
            fill: '#fff'
        });
        this.time.addEvent({ 
            delay: 1000 ,
            callback: function(){
                seconds++;
                if(seconds == 60){
                    minutes++;
                    seconds = 0;
                }
                if(minutes < 10 && seconds < 10) this.timerText.setText(' Time: 0' + minutes + ':0' + seconds);
                else if(minutes < 10) this.timerText.setText(' Time: 0' + minutes + ':' + seconds);
                else if(seconds < 10) this.timerText.setText(' Time: ' + minutes + ':0' + seconds);
                else this.timerText.setText(' Time: ' + minutes + ':' + seconds);
            },
            callbackScope: this,
            loop: true
        });    

        // this.time.addEvent({
        //     delay: 1000,
        //     callback: function(){
        //         var enemy = new CarrierShip(this, 
        //             Phaser.Math.Between(0, this.game.config.width),
        //             0,
        //             1);
        //         this.enemies.add(enemy);
        //     },
        //     callbackScope: this,
        //     loop: true
        // });

        // Difficulty multiplier controller
        // Increases difficulty by 1 at every set interval
        // Increases Enemy Health, Speed and Scoring values according to multiplier
        // Also reduces spawn timer delay
        this.diffMulti = 1;        
        this.time.addEvent({
            delay: 45000,
            callback: function () {
                this.diffMulti++;
                levelText.setText('--Level ' + this.diffMulti + '--'); //Updates current level
                this.spawnerDelay -= 75;                
                if(this.spawnerDelay < 225) this.spawnerDelay = 225; //Spawn timer lower limit
                //Resets and updates spawner with new delay
                this.updateRespawn(this.spawner);
            },
            callbackScope: this,
            loop: true
        });

        //Spawns a random enemy ship on loop based on delay value
        this.spawnerDelay = 600;
        this.spawner = this.time.addEvent({
            delay: this.spawnerDelay,
            callback: function () {
                var enemy = null;

                if (Phaser.Math.Between(0, 10) >= 5) {
                    enemy = new GunShip(
                        this,
                        Phaser.Math.Between(0, this.game.config.width),
                        0,
                        this.diffMulti
                    );
                }
                else if (Phaser.Math.Between(0, 10) >= 5){
                    enemy = new BigMeteor(
                        this,
                        Phaser.Math.Between(0, this.game.config.width),
                        0,
                        this.diffMulti
                    );
                } 
                else if (Phaser.Math.Between(0, 10) >= 4) {
                    if (this.getEnemiesByType("ChaserShip").length < 5) {

                        enemy = new ChaserShip(
                            this,
                            Phaser.Math.Between(0, this.game.config.width),
                            0,
                            this.diffMulti
                        );
                    }
                } else {
                    enemy = new CarrierShip(
                        this,
                        Phaser.Math.Between(0, this.game.config.width),
                        0,
                        this.diffMulti
                    );
                }

                if (enemy !== null) {
                    enemy.setScale(Phaser.Math.Between(10, 20) * 0.1);
                    this.enemies.add(enemy);
                }
            },
            callbackScope: this,
            loop: true
        });     
        //#endregion
        
        Phaser.Actions.PlaceOnCircle(this.orbs.getChildren(), this.circle, this.startAngle, this.endAngle);
        

        //#region Collisions/Overlaps
        this.physics.add.overlap(this.playerLasers, this.enemies, function (playerLaser, enemy) {
            if (enemy) {
                //Reduces enemy health by 1 on every hit
                playerLaser.destroy();
                enemy.health--;                
                if(enemy.health <= 0){
                    enemy.body.enable = false;
                    enemy.explode(true);
                    //Scoring award and Life ups
                    enemy.scene.player.score += enemy.score;
                    scoreText.setText('Score: ' + enemy.scene.player.score);
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
                else{
                    enemy.scene.sfx.hit2.play();
                    enemy.setTintFill(0xffffff);
                    enemy.scene.time.delayedCall(10, function(){
                    enemy.clearTint();
                }, this);
                }
            }
        });

        this.physics.add.overlap(this.player, this.enemies, function (player, enemy) {
            if (player.alpha == 1) { //Player is Vulnerable
                if (!player.getData("isDead") &&
                    !enemy.getData("isDead")) {
                    player.onHit();
                    if (player.lives == 0) {
                        player.explode(false);
                        player.onDestroy();
                        music.stop();
                    } else {
                        player.alpha = 0.5; //Player is Invulnerable
                        player.scene.time.addEvent(player.invulTimer);
                    }
                }
            }
        });

        this.physics.add.overlap(this.player, this.enemyLasers, function (player, laser) {
            if (player.alpha == 1) {
                if (!player.getData("isDead") &&
                    !laser.getData("isDead")) {
                    laser.destroy();
                    player.onHit();
                    if (player.lives == 0) {
                        player.explode(false);
                        player.onDestroy();
                        music.stop();
                    } else {
                        player.alpha = 0.5;
                        player.scene.time.addEvent(player.invulTimer);
                    }
                }
            }
        });

        this.physics.add.overlap(this.orbs, this.enemyLasers, function (orb, laser){
            laser.destroy();
        } );

        this.physics.add.overlap(this.orbs, this.enemies, function (orb, enemy){
            if (enemy) {
                //Reduces enemy health by 1 on every hit
                enemy.health--;                
                if(enemy.health <= 0){
                    enemy.body.enable = false;
                    enemy.explode(true);
                    //Scoring award and Life ups
                    enemy.scene.player.score += enemy.score;
                    scoreText.setText('Score: ' + enemy.scene.player.score);
                    if (enemy.scene.player.score > nextLife) {
                        enemy.scene.player.lives += 1;
                        livesText.setText('Lives: ' + enemy.scene.player.lives);                        
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
                else{
                    enemy.scene.sfx.hit2.play();
                    enemy.setTintFill(0xffffff);
                    enemy.scene.time.delayedCall(10, function(){
                    enemy.clearTint();
                }, this);
                }
            }
        });

        this.physics.add.overlap(this.player, this.powerUps, function (player, powerUp) {
            //Increases power by 1; If at limit, increases Score instead
            if (!player.getData("isDead")) {
                if (player.power >= 1 && player.power <= 5) {
                    player.power += 1;
                    player.updateOrbs();
                } else {
                    //Scoring award and Life ups
                    player.score += powerUp.score;                    
                    scoreText.setText('Score: ' + player.score);
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

        Phaser.Actions.PlaceOnCircle(
        this.orbs.getChildren(), 
        this.circle, 
        this.startAngle.getValue(), 
        this.endAngle.getValue()
        );

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
            this.player.alpha = 1;
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

            if (this.keyZ.isDown) {
                this.player.setData("isShooting", true);
            } else {
                this.player.setData("isShooting", false);
            }
        }
        //#endregion

        //#region Removes objects when Out of Bounds
        for (var i = 0; i < this.enemies.getChildren().length; i++) {
            var enemy = this.enemies.getChildren()[i];

            enemy.update();

            if (enemy.x < -enemy.displayWidth ||
                enemy.x > this.game.config.width + enemy.displayWidth ||
                enemy.y < -enemy.displayHeight * 4 ||
                enemy.y > this.game.config.height + enemy.displayHeight) {

                if (enemy) {
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
                laser.x > this.game.config.width + laser.displayWidth ||
                laser.y < -laser.displayHeight * 4 ||
                laser.y > this.game.config.height + laser.displayHeight) {
                if (laser) {
                    laser.destroy();
                }
            }
        }

        for (var i = 0; i < this.powerUps.getChildren().length; i++) {
            var powerUp = this.powerUps.getChildren()[i];
            powerUp.update();

            if (powerUp.x < -powerUp.displayWidth ||
                powerUp.x > this.game.config.width + powerUp.displayWidth ||
                powerUp.y < -powerUp.displayHeight * 4 ||
                powerUp.y > this.game.config.height + powerUp.displayHeight) {
                if (powerUp) {
                    powerUp.destroy();
                }
            }
        }

        for (var i = 0; i < this.playerLasers.getChildren().length; i++) {
            var laser = this.playerLasers.getChildren()[i];
            laser.update();

            if (laser.x < -laser.displayWidth ||
                laser.x > this.game.config.width + laser.displayWidth ||
                laser.y < -laser.displayHeight * 4 ||
                laser.y > this.game.config.height + laser.displayHeight) {
                if (laser) {
                    laser.destroy();
                }
            }
        }
        //#endregion
    }        

    //Updates enemy spawner with current difficulty-based delay
    updateRespawn(spawner){
        spawner.reset({
            delay: this.spawnerDelay,
            callback: function () {
                var enemy = null;

                if (Phaser.Math.Between(0, 10) >= 5) {
                    enemy = new GunShip(
                        this,
                        Phaser.Math.Between(0, this.game.config.width),
                        0,
                        this.diffMulti
                    );
                }
                else if (Phaser.Math.Between(0, 10) >= 5){
                    enemy = new BigMeteor(
                        this,
                        Phaser.Math.Between(0, this.game.config.width),
                        0,
                        this.diffMulti
                    );
                } 
                else if (Phaser.Math.Between(0, 10) >= 4) {
                    if (this.getEnemiesByType("ChaserShip").length < 5) {

                        enemy = new ChaserShip(
                            this,
                            Phaser.Math.Between(0, this.game.config.width),
                            0,
                            this.diffMulti
                        );
                    }
                } else {
                    enemy = new CarrierShip(
                        this,
                        Phaser.Math.Between(0, this.game.config.width),
                        0,
                        this.diffMulti
                    );
                }

                if (enemy !== null) {
                    enemy.setScale(Phaser.Math.Between(10, 20) * 0.1);
                    this.enemies.add(enemy);
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    updateLives(){  
        this.livesDisplay.clear(false, true);
        this.qtyText.destroy();
        if(this.player.lives <= 4){            
            this.livesDisplay = this.add.group({
                key: 'sprPlayer',
                frameQuantity: this.player.lives
            });           
        }
        else{
            this.livesDisplay = this.add.group({ key: 'sprPlayer' });
            this.qtyText = this.add.text(100, 36, 'X' + this.player.lives);
        }
        Phaser.Actions.GridAlign(this.livesDisplay.getChildren(), {
            width: 10,
            height: 10,
            cellWidth: 18,
            cellHeight: 18,
            x: 90,
            y: 46
        });
    }

    updateWeaponUI(){
        switch(this.player.weapon){
            case 1:
                this.weaponUI.getChildren()[0].setTexture("uiWeapon1");
                this.weaponUI.getChildren()[1].setTexture("uiWeapon2off");
                this.weaponUI.getChildren()[2].setTexture("uiWeapon3off");
                this.weaponUI.getChildren()[3].setTexture("uiWeapon4off");
                break;
            case 2:
                this.weaponUI.getChildren()[0].setTexture("uiWeapon1off");
                this.weaponUI.getChildren()[1].setTexture("uiWeapon2");
                this.weaponUI.getChildren()[2].setTexture("uiWeapon3off");
                this.weaponUI.getChildren()[3].setTexture("uiWeapon4off");
                break;
            case 3:
                this.weaponUI.getChildren()[0].setTexture("uiWeapon1off");
                this.weaponUI.getChildren()[1].setTexture("uiWeapon2off");
                this.weaponUI.getChildren()[2].setTexture("uiWeapon3");
                this.weaponUI.getChildren()[3].setTexture("uiWeapon4off");
                break;
            case 4:
                this.weaponUI.getChildren()[0].setTexture("uiWeapon1off");
                this.weaponUI.getChildren()[1].setTexture("uiWeapon2off");
                this.weaponUI.getChildren()[2].setTexture("uiWeapon3off");
                this.weaponUI.getChildren()[3].setTexture("uiWeapon4");
                break;
        }
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