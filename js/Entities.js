class Entity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key, type) {
        super(scene, x, y, key);
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this, 0);
        this.setData("type", type);
        this.setData("isDead", false);
    }

    explode(canDestroy) {
        if (!this.getData("isDead")) {
            this.setData("isDead", true);
            // Set the texture to the explosion image, then play the animation
            this.setTexture("sprExplosion"); // this refers to the same animation key we used when we added this.anims.create previously
            this.play("sprExplosion"); // play the animation

            // pick a random explosion sound within the array we defined in this.sfx in SceneMain
            this.scene.sfx.explosions[Phaser.Math.Between(0, this.scene.sfx.explosions.length - 1)].play();

            if (this.shootTimer !== undefined) {
                if (this.shootTimer) {
                    this.shootTimer.remove(false);
                }
            }

            this.setAngle(0);
            this.body.setVelocity(0, 0);

            this.on('animationcomplete', function () {

                if (canDestroy) {
                    this.destroy();
                } else {
                    this.setVisible(false);
                }

            }, this);
        }
    }
}

class ChaserShip extends Entity {
    constructor(scene, wave, xSpeed, x, y, multi) {
        super(scene, x, y, "sprChaser", "ChaserShip");
        this.wave = wave;
        this.body.velocity.x = xSpeed;
        this.health = 4 + (multi * 0.5);
        this.score = 40 + (multi * 20);
        this.multi = multi;
        this.scale = 2;
        this.play("sprChaser");
        this.chase = this.scene.time.addEvent({
            delay: 1000,
            callback: function () {
                this.tween.stop();
                var dx = this.scene.player.x - this.x;
                var dy = this.scene.player.y - this.y;

                var angle = Math.atan2(dy, dx);

                var speed = 375 + (this.multi * 175);
                this.body.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            },
            callbackScope: this
        });
        this.tween = this.scene.tweens.add({
            targets: this,
            y: 90,
            duration: 200,
            ease: 'Sine.easeInOut',
            yoyo: true,
            loop: -1
        });
    }

    update() {}

    onHit(playerLaser) {
        if (playerLaser instanceof playerHoming) {
            this.health -= playerLaser.damage * 2;
        } else {
            this.health -= playerLaser.damage;
        }
    }

    onDestroy() {
        this.chase.destroy();
        this.scene.enemyLasers.add(new EnemyBullet(this.scene, this.x, this.y));
    }
}

class GunShip extends Entity {
    constructor(scene, wave, x, y, multi) {
        super(scene, x, y, "sprEnemy0", "GunShip");
        this.wave = wave;
        this.body.velocity.y = 200;
        this.health = 4 + (multi * 2);
        this.score = 40 + (multi * 10);
        this.scale = 2;
        this.shootTimer = this.scene.time.addEvent({
            startAt: 1200 - (multi * 100),
            delay: 1600 - (multi * 100),
            callback: function () {
                var laser = new EnemyBullet(
                    this.scene,
                    this.x,
                    this.y
                );
                laser.setScale(this.scaleX);
                this.scene.enemyLasers.add(laser);
            },
            callbackScope: this,
            repeat: 0 + Math.floor(multi / 4)
        });
        this.play("sprEnemy0");
    }

    onHit(playerLaser) {
        if (playerLaser instanceof PlayerLaser) {
            this.health -= playerLaser.damage * 3;
        } else {
            this.health -= playerLaser.damage;
        }
    }

    onDestroy() {
        if (this.shootTimer !== undefined) {
            if (this.shootTimer) {
                this.shootTimer.remove(false);
            }
        }
    }
}

class CarrierShip extends Entity {
    constructor(scene, x, y, multi) {
        super(scene, x, y, "sprBox", "CarrierShip");
        this.body.velocity.y = 100;
        this.health = 5 + (multi * 15);
        this.score = 100 + (multi * 50);
        this.multi = multi;
        this.scale = 3;
        this.play("sprBox");
        this.stopSpeed = this.scene.time.addEvent({
            delay: 1500
        });
        this.resetSpeed = this.scene.time.addEvent({
            delay: 13500
        });
    }

    update() {
        if (this.stopSpeed.getProgress() == 1) {
            this.body.velocity.y = 0;
        }

        if (this.resetSpeed.getProgress() == 1) {
            this.body.velocity.y = 300;
        }
    }

    onHit(playerLaser) {
        if (playerLaser instanceof PlayerLaser2) {
            this.health -= playerLaser.damage * 2;
        } else {
            this.health -= playerLaser.damage;
        }
    }

    onDestroy() {
        this.scene.powerUps.add(new PowerUp(this.scene, this.x, this.y, this.multi));
        this.resetSpeed.destroy();
    }
}

class BigMeteor extends Entity {
    constructor(scene, wave, x, y, multi) {
        super(scene, x, y, "sprMeteor", "BigMeteor");
        this.wave = wave;
        this.multi = multi;
        this.speed = 175 + (multi * 15);
        this.body.velocity.x = Phaser.Math.Between(-this.speed, this.speed);
        this.body.velocity.y = Phaser.Math.Between(this.speed * 0.5, this.speed);
        this.health = 6 + (multi * 2);
        this.score = 20 + (multi * 5);
        this.scale = 5;
    }

    update() {
        this.angle += 10;
    }

    onHit(playerLaser) {
        if (playerLaser instanceof focusBeam) {
            this.health -= playerLaser.damage * 3;
        } else {
            this.health -= playerLaser.damage;
        }
    }

    onDestroy() {
        for (var i = 0; i < 4; i++) {
            this.scene.enemies.add(new SmallMeteor(this.scene, this.x, this.y, this.multi));
        }
    }
}

class SmallMeteor extends Entity {
    constructor(scene, x, y, multi) {
        super(scene, x, y, "sprMeteor", "SmallMeteor");
        this.speed = 200 + (multi * 25);
        this.seedX = Phaser.Math.Between(0, 10);
        this.seedY = Phaser.Math.Between(0, 10);
        if (this.seedX > 5) this.body.velocity.x = -this.speed;
        else this.body.velocity.x = this.speed;
        if (this.seedY > 5) this.body.velocity.y = -this.speed;
        else this.body.velocity.y = this.speed;
        this.health = 4 + multi * 0.5;
        this.score = 10 + multi;
        this.scale = 3;
    }

    update() {
        this.angle -= 20;
    }

    onHit(playerLaser) {
        if (playerLaser instanceof focusBeam) {
            this.health -= playerLaser.damage * 3;
        } else {
            this.health -= playerLaser.damage;
        }
    }
}

class Boss extends Entity {
    constructor(scene, x, y, health) {
        super(scene, x, y, "penguin");
        this.health = health;
        this.maxHealth = health;
        this.title = this.scene.add.text(22, 15, "ペンギンゲームどこ ~~Herald of the Placeholder~~");
        this.healthBar = this.scene.add.rectangle(28, 38, 424, 10, 0x2ecc71).setDepth(9);
        this.healthBar.setOrigin(0);
        this.bgBar = this.scene.add.rectangle(26, 36, 428, 14, 0xffffff).setDepth(10);
        this.bgBar.setOrigin(0);
        this.bgBar.setStrokeStyle(2, 0xffffff);
        this.bgBar.setFillStyle(0x000000, 0);
        this.body.velocity.y = 75;
        this.score = 50000;
        this.scale = 5;
        this.phase = 1;
        this.timeBonus = 90;
        this.timeText = this.scene.add.bitmapText(425, 55, 'uiFont', this.timeBonus.toFixed(1) + 's', 14);
        this.bonusTimer = this.scene.time.addEvent({
            delay: 100,
            callback: function () {
                this.timeBonus -= 0.1;
                if(this.timeBonus <= 0.12) this.timeBonus = 0;
                this.timeText.setText(this.timeBonus.toFixed(1) + 's');
            },
            callbackScope: this,
            repeat: 899
        });
        this.stopSpeed = this.scene.time.addEvent({
            delay: 1500,
            callback: function () {
                this.body.velocity.y = 0;
            },
            callbackScope: this
        });
        this.moveRight = this.scene.time.addEvent({
            delay: 2500,
            callback: function () {
                this.body.velocity.x = 100;
                this.body.setCollideWorldBounds(true);
                this.body.setBounce(1, 0);
            },
            callbackScope: this
        });
        this.pattern = 1;
        this.loop = this.scene.time.addEvent({
            delay: 3000,
            callback: function () {
                switch (this.pattern) {
                    case 1:
                        this.fireBulletLeft();
                        if (this.health < (this.maxHealth * 0.35)) {
                            this.fireBulletRight();
                        }
                        this.pattern++;
                        break;
                    case 2:
                        this.fireBulletRight();
                        if (this.health < (this.maxHealth * 0.35)) {
                            this.fireBulletLeft();
                        }
                        this.pattern++;
                        break;
                    case 3:
                        var repeats = 1;
                        if (this.health < (this.maxHealth * 0.35)) {
                            repeats += 2;
                        }
                        this.scene.time.addEvent({
                            delay: 450,
                            callback: function () {
                                this.fireHomingLaser();
                            },
                            callbackScope: this,
                            repeat: repeats
                        });
                        this.pattern++;
                        break;
                    case 4:
                        if (this.health < (this.maxHealth * 0.35)) {
                            this.fireDestructableBullets(30, 350);
                            this.pattern++;
                        } else {
                            this.fireDestructableBullets(10, 175);
                            this.pattern = 1;
                        }
                        break;
                    case 5:
                        if (this.health < (this.maxHealth * 0.35)) {
                            this.fireBulletLeft();
                            this.fireDestructableBullets(20, 175);
                            this.scene.time.addEvent({
                                delay: 750,
                                callback: function () {
                                    this.fireBulletRight();
                                },
                                callbackScope: this
                            });
                            this.scene.time.addEvent({
                                delay: 1250,
                                callback: function () {
                                    this.fireHomingLaser();
                                },
                                callbackScope: this,
                                repeat: 1
                            });
                        }
                        this.pattern++;
                        break;
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    update() {
        if (this.pattern >= 6) {
            this.pattern = 1;
        }

        this.setValue(this.healthBar);
    }

    fireBulletLeft() {
        this.scene.time.addEvent({
            delay: 100,
            callback: function () {
                var bullet = new BossBullet(
                    this.scene,
                    this.x - 50,
                    this.y
                );
                bullet.setScale(this.scaleX);
                this.scene.enemyLasers.add(bullet);
            },
            callbackScope: this,
            repeat: 4
        });
    }

    fireBulletRight() {
        this.scene.time.addEvent({
            delay: 100,
            callback: function () {
                var bullet = new BossBullet(
                    this.scene,
                    this.x + 50,
                    this.y
                );
                bullet.setScale(this.scaleX);
                this.scene.enemyLasers.add(bullet);
            },
            callbackScope: this,
            repeat: 4
        });
    }

    fireHomingLaser() {
        var laserHead = new HomingLaser(this.scene, this.x, this.y);
        this.scene.enemyLasers.add(laserHead);
        laserHead.setScale(0.5);
    }

    fireDestructableBullets(repeats, valueX) {
        this.scene.time.addEvent({
            delay: 50,
            callback: function () {
                var speedX = Phaser.Math.Between(-valueX, valueX);
                this.scene.enemyLasers.add(new DestructableBullet(this.scene, this.x, this.y, speedX));
            },
            callbackScope: this,
            repeat: repeats
        });
    }

    makeBar(x, y, width, height, color) {
        //draw the bar
        var bar = this.scene.add.graphics();

        //color the bar
        bar.fillStyle(color, 1);

        //fill the bar with a rectangle
        bar.fillRect(0, 0, width, height);

        //position the bar
        bar.x = x;
        bar.y = y;

        //return the bar
        return bar;
    }

    setValue(bar) {
        //scale the bar
        bar.scaleX = this.health / this.maxHealth;
        if (this.health < (this.maxHealth * 0.35)) {
            bar.setFillStyle(0xff0000);
            this.setTexture("penguinMad");
            if (this.phase == 1) {
                this.phase++;
                if (this.x < 300) {
                    this.body.velocity.x = -200;
                    this.body.setCollideWorldBounds(true);
                    this.body.setBounce(1, 0);
                } else {
                    this.body.velocity.x = 200;
                    this.body.setCollideWorldBounds(true);
                    this.body.setBounce(1, 0);
                }
                this.tween = this.scene.tweens.add({
                    targets: this,
                    y: this.y + 60,
                    duration: 2000,
                    ease: 'Power2',
                    yoyo: true,
                    loop: -1
                });
            }
        }
    }

    onHit(playerLaser) {
        this.health -= playerLaser.damage;
    }

    onDestroy() {
        this.scene.player.isVulnerable = false;
        this.loop.destroy();
        this.healthBar.destroy();
        this.scene.carrierSpawn.destroy();
        this.tween.stop();
        var bonusText = this.scene.add.bitmapText(this.x, this.y, 'uiFont', '+' + this.score + '!', 36);
        this.bonusTimer.destroy();
        this.scene.time.addEvent({
            delay: 2000,
            callback: function () {
                bonusText.destroy();
            },
            callbackScope: this,
            loop: false
        });
        this.scene.time.addEvent({ // go to game over scene
            delay: 4000,
            callback: function () {
                this.scene.game.scene.start('SceneClear', {
                    score: this.scene.player.score,
                    lives: this.scene.player.lives,
                    time: this.timeBonus,
                    bgmReset: this.scene.bossBgm
                });
                this.scene.game.scene.pause('SceneMain');
                this.scene.game.scene.bringToTop('SceneClear');
            },
            callbackScope: this,
            loop: false
        });
    }
}

class EnemyBullet extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprLaserEnemy0");
        this.setDepth(5);
        this.scale = 2;
        var dx = this.scene.player.x - this.x;
        var dy = this.scene.player.y - this.y;

        var angle = Math.atan2(dy, dx);

        var speed = 400;
        this.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }
}

class BossBullet extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprLaserEnemy0");
        this.setDepth(5);
        this.scale = 2;
        var dx = this.scene.player.x - this.x;
        var dy = this.scene.player.y - this.y;

        var angle = Math.atan2(dy, dx);

        var speed = 550;
        this.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }
}

class DestructableBullet extends Entity {
    constructor(scene, x, y, speedX) {
        super(scene, x, y, "sprDestructableBullet");
        this.body.velocity.x = speedX;
        this.body.velocity.y = 300;
        this.scale = 2;
        this.health = 2;
        this.setDepth(5);
    }

    onHit(playerLaser) {
        this.health -= playerLaser.damage;
        if (this.health < 0) {
            this.destroy();
        }
    }

    update() {
        this.angle += 10;
    }
}

class HomingLaser extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprLaserEnemy1");
        this.particles = this.scene.add.particles('sprLaserEnemyTail');
        this.particles.setDepth(5);
        this.sprite = this.scene.physics.add.image(this.x, this.y, 'sprLaserEnemy1');
        this.sprite.alpha = 0;
        this.sprite.body.velocity.y = 150;
        this.particles.createEmitter({
            texture: 'sprLaserEnemyTail',
            scale: {
                start: 0.3,
                end: 0
            },
            delay: 200,
            lifespan: 400,
            acceleration: true,
            blendMode: 'ADD',
            follow: this.sprite
        });
        this.visible = false;
        this.body.velocity.y = 150;
        this.chase = null;
        this.setHoming = this.scene.time.addEvent({
            startAt: 500,
            delay: 1000,
            callback: function () {
                this.chase = this.scene.time.addEvent({
                    delay: 400
                });
            },
            callbackScope: this,
            repeat: 1
        });
    }

    update() {
        if (this.chase != null) {
            if (this.chase.getProgress() != 1) {
                var dx = this.scene.player.x - this.x;
                var dy = this.scene.player.y - this.y;

                var angle = Math.atan2(dy, dx);

                var speed = 300;
                this.body.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
                this.sprite.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            }
        }
    }

    onDestroy() {
        this.setHoming.destroy();
        this.chase.destroy();
    }
}

class Player extends Entity {
    constructor(scene, x, y, key) {
        super(scene, x, y, key, "Player");
        this.speed = 300;
        this.play("sprPlayer");
        this.body.setCircle(4, 4, 4);
        this.setDepth(4);
        this.setData("isShooting", false);
        this.setData("timerShootDelay", 10);
        this.setData("timerShootTick", this.getData("timerShootDelay") - 1);
        this.scale = 2;
        this.power = 1;
        this.lives = 3;
        this.weapon = 1; //Default weapon
        this.isVulnerable = true;
        this.invulTimer = new Phaser.Time.TimerEvent({
            delay: 3000
        });
    }

    moveUp() {
        this.body.velocity.y = -this.speed;
        this.body.velocity.normalize().scale(this.speed);
    }

    moveDown() {
        this.body.velocity.y = this.speed;
        this.body.velocity.normalize().scale(this.speed);
    }

    moveLeft() {
        this.body.velocity.x = -this.speed;
        this.body.velocity.normalize().scale(this.speed);
    }

    moveRight() {
        this.body.velocity.x = this.speed;
        this.body.velocity.normalize().scale(this.speed);
    }

    update() {
        this.body.setVelocity(0, 0);

        this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);
        this.y = Phaser.Math.Clamp(this.y, 0, this.scene.game.config.height);
        
        if (this.getData("isShooting")) {
            if (this.getData("timerShootTick") < this.getData("timerShootDelay")) {
                this.setData("timerShootTick", this.getData("timerShootTick") + 1); // every game update, increase timerShootTick by one until we reach the value of timerShootDelay
            } else { // when the "manual timer" is triggered:   
                switch (this.weapon) {
                    case 1:
                        this.weaponSpread();
                        break;
                    case 2:
                        this.weaponFocusBeam();
                        break;
                    case 3:
                        this.weaponHoming();
                        break;
                    case 4:
                        this.weaponOrbs(this);
                        for (var i = 0; i < this.scene.orbs.getChildren().length; i++) {
                            var orb = this.scene.orbs.getChildren()[i];
                            this.weaponOrbs(orb);
                        }
                        default:
                            break;
                }
            }
        }
    }

    onHit() {
        this.isVulnerable = false;
        this.scene.sfx.hit.play();
        this.lives -= 1;
        this.scene.updateLives();
        this.power -= 1;
        if (this.power < 1) this.power = 1;
        this.updateOrbs();
        this.scene.updatePower();
        this.flick = this.scene.tweens.add({
            targets: this,
            duration: 50,
            ease: 'Power1',
            alpha: 0,
            yoyo: true,
            loop: -1,
        });
    }

    onDestroy() {
        this.scene.time.addEvent({ // go to game over scene
            delay: 1000,
            callback: function () {
                this.scene.bossBgm.stop();
                this.scene.scene.start("SceneGameOver", {
                    score: this.scene.player.score,
                    state: "GAME OVER"
                });
            },
            callbackScope: this,
            loop: false
        });
    }

    changeWeapon(direction) {
        if (direction == 'right') {
            if (this.weapon >= 4) this.weapon = 1;
            else {
                this.scene.orbs.clear(false, true);
                this.weapon++;
            }
        } else {
            if (this.weapon <= 1) this.weapon = 4;
            else {
                this.scene.orbs.clear(false, true);
                this.weapon--;
            }
        }
        this.updateOrbs();
    }

    // changeSpeed() {
    //     if (this.speed == 200) {
    //         this.speed = 300;
    //         this.scene.speedText.setText('SPEED: >>>>');
    //     } else {
    //         this.speed = 200;
    //         this.scene.speedText.setText('SPEED: >>');
    //     }
    // }

    weaponSpread() {
        switch (this.power) {
            case 1:
                this.setData("timerShootDelay", 10);
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 6, this.y, 40));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 6, this.y, -40));
                break;
            case 2:
                this.setData("timerShootDelay", 10);
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x, this.y, 0));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 6, this.y, 40));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 6, this.y, -40));
                break;
            case 3:
                this.setData("timerShootDelay", 9);
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 6, this.y, 0));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 6, this.y, 0));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 6, this.y, 40));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 6, this.y, -40));
                break;
            case 4:
                this.setData("timerShootDelay", 9);
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 6, this.y, 0));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 6, this.y, 0));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 6, this.y, 40));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 6, this.y, -40));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 8, this.y, 80));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 8, this.y, -80));
                break;
            case 5:
                this.setData("timerShootDelay", 8);
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 6, this.y, 0));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 6, this.y, 0));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 6, this.y, 40));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 6, this.y, -40));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 8, this.y, 80));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 8, this.y, -80));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 10, this.y, 120));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 10, this.y, -120));
                break;
            default:
                break;
        }

        //this.scene.sfx.spread.play();
        this.setData("timerShootTick", 0);
    }

    weaponFocusBeam() {
        this.setData("timerShootDelay", 1);
        switch (this.power) {
            case 1:
                this.scene.playerLasers.add(new focusBeam(this.scene, this.x, this.y - 35, 2));
                break;
            case 2:
                this.scene.playerLasers.add(new focusBeam(this.scene, this.x, this.y - 35, 4, ));
                break;
            case 3:
                this.scene.playerLasers.add(new focusBeam(this.scene, this.x, this.y - 35, 6, 0.08));
                break;
            case 4:
                this.scene.playerLasers.add(new focusBeam(this.scene, this.x, this.y - 35, 8, 0.08));
                break;
            case 5:
                this.scene.playerLasers.add(new focusBeam(this.scene, this.x, this.y - 35, 10, 0.1));
                break;
        }
        this.setData("timerShootTick", 0);
    }

    weaponHoming() {
        this.setData("timerShootDelay", 6);
        switch (this.power) {
            case 1:
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 10, this.y - 10));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 10, this.y - 10));
                break;
            case 2:
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x, this.y - 20));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 10, this.y - 10, -300));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 10, this.y - 10, 300));
                break;
            case 3:
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 10, this.y - 20, -100));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 10, this.y - 20, 100));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 20, this.y - 10, -300));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 20, this.y - 10, 300));
                break;
            case 4:
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x, this.y - 20));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 10, this.y - 10, -100));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 10, this.y - 10, 100));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 20, this.y, -300));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 20, this.y, 300));
                break;
            case 5:
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 10, this.y - 20, -100));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 10, this.y - 20, 100));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 20, this.y - 10, -300));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 20, this.y - 10, 300));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 30, this.y, -500));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 30, this.y, 500));
                break;
        }
        this.setData("timerShootTick", 0);
    }

    weaponOrbs(entity) {
        switch (entity.scene.player.power) {
            case 1:
                entity.scene.player.setData("timerShootDelay", 12);
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x, entity.y));
                break;
            case 2:
                entity.scene.player.setData("timerShootDelay", 12);
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x - 4, entity.y));
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x + 4, entity.y));
                break;
            case 3:
                entity.scene.player.setData("timerShootDelay", 11);
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x - 4, entity.y));
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x + 4, entity.y));
                break;
            case 4:
                entity.scene.player.setData("timerShootDelay", 11);
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x - 4, entity.y));
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x + 4, entity.y));
                break;
            case 5:
                entity.scene.player.setData("timerShootDelay", 10);
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x - 4, entity.y));
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x + 4, entity.y));
                break;
        }

        //this.scene.sfx.orbs.play();
        this.setData("timerShootTick", 0);
    }

    updateOrbs() {
        this.scene.orbs.clear(false, true);
        if (this.weapon == 4) {
            if (this.power < 3) {
                this.scene.orbs.add(new Orb(this.scene, this.x, this.y));
            } else if (this.power < 4) {
                this.scene.orbs.add(new Orb(this.scene, this.x, this.y));
                this.scene.orbs.add(new Orb(this.scene, this.x, this.y));
            } else if (this.power < 5) {
                this.scene.orbs.add(new Orb(this.scene, this.x, this.y));
                this.scene.orbs.add(new Orb(this.scene, this.x, this.y));
                this.scene.orbs.add(new Orb(this.scene, this.x, this.y));
            } else {
                this.scene.orbs.add(new Orb(this.scene, this.x, this.y));
                this.scene.orbs.add(new Orb(this.scene, this.x, this.y));
                this.scene.orbs.add(new Orb(this.scene, this.x, this.y));
                this.scene.orbs.add(new Orb(this.scene, this.x, this.y));
            }
        }
    }
}

class Orb extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprOrb");
        this.body.setCircle(4, 3, 3);
        this.play("sprOrb");
    }
}

class PlayerLaser extends Entity {
    constructor(scene, x, y, angle = 0) {
        super(scene, x, y, "sprLaserPlayer1");
        this.body.velocity.y = -450;
        this.body.velocity.x = +angle;
        this.scale = 2;
        this.damage = 1;
    }
}

class PlayerLaser2 extends Entity {
    constructor(scene, x, y, angle = 0) {
        super(scene, x, y, "sprLaserPlayer2");
        this.body.velocity.y = -550;
        this.body.velocity.x = +angle;
        this.scale = 2;
        this.damage = 1;
        this.play("sprLaserPlayer2");
    }
}

class focusBeam extends Entity {
    constructor(scene, x, y, scale, damage = 0.05) {
        super(scene, x, y, "sprFocusBeam");
        this.body.velocity.y = -1500;
        this.setDepth(3);
        this.scaleY = 3;
        this.scaleX = scale;
        this.damage = damage;
    }

    update() {
        this.setX(this.scene.player.x);

        if (this.scene.keyW.isUp) {
            //this.scene.playerLasers.clear(false, true);
            this.destroy();
        }
    }
}

class playerHoming extends Entity {
    constructor(scene, x, y, angle = 0) {
        super(scene, x, y, "sprHoming");
        this.body.velocity.y = -750;
        this.body.velocity.x = angle;
        this.alpha = 0.5;
        this.damage = 0.6;
        this.play("sprHoming");
        this.scale = 2;
        this.states = {
            MOVE_UP: "MOVE_UP",
            CHASE: "CHASE"
        };
        this.state = this.states.MOVE_UP;
        this.target = null;
    }

    update() {

        if (this.state == this.states.MOVE_UP) {
            this.updateTarget();
        }

        if (this.state == this.states.CHASE) {
            this.chaseTarget();
        }
    }

    updateTarget() {
        for (var i = 0; i < this.scene.enemies.getChildren().length; i++) {
            var enemy = this.scene.enemies.getChildren()[i];
            if (this.state == this.states.MOVE_UP) {
                if (Phaser.Math.Distance.Between(
                        this.x,
                        this.y,
                        enemy.x,
                        enemy.y
                    ) <= 300) {
                    this.target = enemy;
                    if (!(this.target.getData("isDead"))) {
                        this.state = this.states.CHASE;
                    }
                }
            }
        }
    }

    chaseTarget() {
        var dx = this.target.x - this.x;
        var dy = this.target.y - this.y;

        var angle = Math.atan2(dy, dx);

        var speed = 1200;
        this.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        if (this.target != null) {
            if (Phaser.Math.Distance.Between(
                    this.x,
                    this.y,
                    this.target.x,
                    this.target.y
                ) > 300) {
                this.target = null;
                this.state = this.states.MOVE_UP;
            } else if (this.target.getData("isDead")) {
                this.body.velocity.y = -700;
                this.state = this.states.MOVE_UP;
                this.target = null;
            }
        }
    }
}

class PowerUp extends Entity {
    constructor(scene, x, y, multi) {
        super(scene, x, y, "sprPowerUp");
        this.body.velocity.y = 100;
        this.score = 400 + (multi * 100);
        this.setDepth(9);
        this.scale = 2;
    }

    update() {
        this.angle += 5;
    }

    onDestroy() {
        this.scene.sfx.powerUp.play();
    }
}

class DummyOneUp extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "spr1up");
        this.body.velocity.y = -50;
        this.play("spr1up");
        this.on('animationcomplete', function () {
            this.destroy();
        });
    }
}

class Wave {
    constructor(scene, aliveCount, multi) {
        this.scene = scene;
        this.aliveCount = aliveCount;
        this.score = 100 + (multi * 50);
    }

    updateCount(x, y) {
        this.aliveCount--;
        if (this.aliveCount <= 0) {
            this.scene.player.score += this.score;
            var bonusText = this.scene.add.bitmapText(x, y, 'uiFont', '+' + this.score + '!', 10);
            this.scene.time.addEvent({
                delay: 1000,
                callback: function () {
                    bonusText.destroy();
                },
                callbackScope: this,
                loop: false
            });
        }
    }
}

class ScrollingBackground {
    constructor(scene, key, velocityY) {
        this.scene = scene;
        this.key = key;
        this.velocityY = velocityY;

        this.layers = this.scene.add.group();
        this.createLayers();
    }

    createLayers() {
        for (var i = 0; i < 2; i++) {
            // creating two backgrounds will allow a continuous scroll
            var layer = this.scene.add.sprite(0, 0, this.key);
            layer.y = (layer.displayHeight * i);
            var flipX = Phaser.Math.Between(0, 10) >= 5 ? -1 : 1;
            var flipY = Phaser.Math.Between(0, 10) >= 5 ? -1 : 1;
            layer.setScale(flipX * 2, flipY * 2);
            layer.setDepth(-5 - (i - 1));
            this.scene.physics.world.enableBody(layer, 0);
            layer.body.velocity.y = this.velocityY;

            this.layers.add(layer);
        }
    }

    update() {
        if (this.layers.getChildren()[0].y > 0) {
            for (var i = 0; i < this.layers.getChildren().length; i++) {
                var layer = this.layers.getChildren()[i];
                layer.y = (-layer.displayHeight) + (layer.displayHeight * i);
            }
        }
    }
}