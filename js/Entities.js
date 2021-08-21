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
    constructor(scene, x, y, multi) {
        super(scene, x, y, "sprEnemy1", "ChaserShip");
        this.body.velocity.y = Phaser.Math.Between(50, 100);
        this.health = 8 * multi;
        this.score = 40 + (multi * 20);
        this.multi = multi;
        this.states = {
            MOVE_DOWN: "MOVE_DOWN",
            CHASE: "CHASE"
        };
        this.state = this.states.MOVE_DOWN;
    }

    update() {
        if (!this.getData("isDead") && this.scene.player) {
            if (Phaser.Math.Distance.Between(
                    this.x,
                    this.y,
                    this.scene.player.x,
                    this.scene.player.y
                ) < 400) {

                this.state = this.states.CHASE;
            }

            if (this.state == this.states.CHASE) {
                var dx = this.scene.player.x - this.x;
                var dy = this.scene.player.y - this.y;

                var angle = Math.atan2(dy, dx);

                var speed = 250 + (this.multi * 25);
                this.body.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );

                if (this.x < this.scene.player.x) {
                    this.angle -= 5;
                } else {
                    this.angle += 5;
                }
            }
        }
    }
}

class GunShip extends Entity {
    constructor(scene, x, y, multi) {
        super(scene, x, y, "sprEnemy0", "GunShip");
        this.body.velocity.y = 300;
        this.health = 16 * multi;
        this.score = 40 + (multi * 10);
        this.shootTimer = this.scene.time.addEvent({
            delay: 600,
            callback: function () {
                var laser = new EnemyLaser(
                    this.scene,
                    this.x,
                    this.y
                );
                laser.setScale(this.scaleX);
                this.scene.enemyLasers.add(laser);
            },
            callbackScope: this,
            loop: true
        });
        this.play("sprEnemy0");
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
        super(scene, x, y, "sprEnemy2", "CarrierShip");
        this.body.velocity.y = Phaser.Math.Between(50, 100);
        this.health = 20 * multi;
        this.score = 40 + (multi * 10);
        this.multi = multi;
        this.play("sprEnemy2");
    }

    onDestroy() {
        this.scene.powerUps.add(new PowerUp(this.scene, this.x, this.y, this.multi));
    }
}

class BigMeteor extends Entity {
    constructor(scene, x, y, multi) {
        super(scene, x, y, "sprMeteor", "BigMeteor");
        this.multi = multi;
        this.speed = 175 + (multi * 25);
        this.body.velocity.y = Phaser.Math.Between(this.speed * 0.5, this.speed);
        this.body.velocity.x = Phaser.Math.Between(this.speed * 0.3, this.speed * 0.6);
        this.health = 8 * multi;
        this.score = 20 + (multi * 5);
        this.scale = 6;
    }

    update() {
        this.angle += 10;
    }

    onDestroy() {
        for (var i = 0; i < Phaser.Math.Between(3, 5); i++) {
            this.scene.enemies.add(new SmallMeteor(this.scene, this.x, this.y, this.multi));
        }
    }
}

class SmallMeteor extends Entity {
    constructor(scene, x, y, multi) {
        super(scene, x, y, "sprMeteor", "SmallMeteor");
        this.speed = 200 + (multi * 50);
        this.body.velocity.y = Phaser.Math.Between(-this.speed, this.speed);
        this.body.velocity.x = Phaser.Math.Between(-this.speed, this.speed);
        this.health = 7;
        this.score = 10 + multi;
        this.scale = 1;
    }

    update() {
        this.angle -= 20;
    }
}



class EnemyLaser extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprLaserEnemy0");
        this.body.velocity.y = 450;
        this.setDepth(5);
    }
}

class Player extends Entity {
    constructor(scene, x, y, key) {
        super(scene, x, y, key, "Player");
        this.setData("speed", 200);
        this.play("sprPlayer");
        this.setData("isShooting", false);
        this.setData("timerShootDelay", 10);
        this.setData("timerShootTick", this.getData("timerShootDelay") - 1);
        this.scale = 2;
        this.power = 1;
        this.lives = 3;
        this.weapon = 1; //Default weapon
        this.invulTimer = new Phaser.Time.TimerEvent({
            delay: 2000
        });
    }

    moveUp() {
        this.body.velocity.y = -this.getData("speed");
    }

    moveDown() {
        this.body.velocity.y = this.getData("speed");
    }

    moveLeft() {
        this.body.velocity.x = -this.getData("speed");
    }

    moveRight() {
        this.body.velocity.x = this.getData("speed");
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
        this.scene.sfx.hit.play();
        this.lives -= 1;
        this.scene.updateLives();
        this.power -= 2;
        if (this.power < 1) this.power = 1;
        this.updateOrbs();
    }

    onDestroy() {
        this.scene.time.addEvent({ // go to game over scene
            delay: 1000,
            callback: function () {
                this.scene.scene.start("SceneGameOver", {
                    score: this.scene.player.score,
                    time: this.scene.timerText
                });
            },
            callbackScope: this,
            loop: false
        });
    }

    changeWeapon() {
        if (this.weapon >= 4) this.weapon = 1;
        else {
            this.scene.orbs.clear(false, true);
            this.weapon++;
        }
        this.updateOrbs();
    }

    weaponSpread() {
        switch (this.power) {
            case 1:
                this.setData("timerShootDelay", 10);
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x, this.y, 0));
                break;
            case 2:
                this.setData("timerShootDelay", 9);
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 6, this.y, 0));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 6, this.y, 0));
                break;
            case 3:
                this.setData("timerShootDelay", 9);
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 8, this.y, -25));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 8, this.y, 25));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 6, this.y, 0));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 6, this.y, 0));
                break;
            case 4:
                this.setData("timerShootDelay", 8);
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 8, this.y, -25));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 10, this.y, -50));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 8, this.y, 25));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 10, this.y, 50));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 6, this.y, 0));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 6, this.y, 0));
                break;
            case 5:
                this.setData("timerShootDelay", 7);
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 8, this.y, -25));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 10, this.y, -50));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 12, this.y, -75));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 8, this.y, 25));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 10, this.y, 50));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 12, this.y, 75));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 6, this.y, 0));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 6, this.y, 0));
                break;
            case 6:
                this.setData("timerShootDelay", 6);
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 8, this.y, -25));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 10, this.y, -50));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 12, this.y, -75));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 14, this.y, -100));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 8, this.y, 25));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 10, this.y, 50));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 12, this.y, 75));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 14, this.y, 100));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x + 6, this.y, 0));
                this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x - 6, this.y, 0));
                break;
            default:
                break;
        }

        this.scene.sfx.laser.play(); // play the laser sound effect
        this.setData("timerShootTick", 0);
    }

    weaponFocusBeam() {
        this.setData("timerShootDelay", 1);
        switch (this.power) {
            case 1:
                this.scene.playerLasers.add(new focusBeam(this.scene, this.x, this.y - 35, 2));
                break;
            case 2:
                this.scene.playerLasers.add(new focusBeam(this.scene, this.x, this.y - 35, 4));
                break;
            case 3:
                this.scene.playerLasers.add(new focusBeam(this.scene, this.x, this.y - 35, 6, 2));
                break;
            case 4:
                this.scene.playerLasers.add(new focusBeam(this.scene, this.x, this.y - 35, 8, 2));
                break;
            case 5:
                this.scene.playerLasers.add(new focusBeam(this.scene, this.x, this.y - 35, 10, 2));
                break;
            case 6:
                this.scene.playerLasers.add(new focusBeam(this.scene, this.x, this.y - 35, 12, 3));
                break;
            default:
                break;
        }
        this.setData("timerShootTick", 0);
    }

    weaponHoming() {
        this.setData("timerShootDelay", 6);
        switch (this.power) {
            case 1:
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x, this.y - 20));
                break;
            case 2:
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 10, this.y - 10));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 10, this.y - 10));
                break;
            case 3:
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x, this.y - 20));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 10, this.y - 10, -40));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 10, this.y - 10, 40));
                break;
            case 4:
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 10, this.y - 20, 40));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 10, this.y - 20, 40));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 20, this.y - 10, -80));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 20, this.y - 10, 80));
                break;
            case 5:
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x, this.y - 20));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 10, this.y - 10, -40));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 10, this.y - 10, 40));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 20, this.y, -80));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 20, this.y, 80));
                break;
            case 6:
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 10, this.y - 20, -40));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 10, this.y - 20, 40));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 20, this.y - 10, -80));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 20, this.y - 10, 80));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x - 30, this.y, -120));
                this.scene.playerLasers.add(new playerHoming(this.scene, this.x + 30, this.y, 120));
                break;
        }
        this.setData("timerShootTick", 0);
    }

    weaponOrbs(entity) {
        switch (entity.scene.player.power) {
            case 1:
                entity.scene.player.setData("timerShootDelay", 10);
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x, entity.y));
                break;
            case 2:
                entity.scene.player.setData("timerShootDelay", 10);
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x - 3, entity.y));
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x + 3, entity.y));
                break;
            case 3:
                entity.scene.player.setData("timerShootDelay", 10);
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x - 3, entity.y));
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x + 3, entity.y));
                break;
            case 4:
                entity.scene.player.setData("timerShootDelay", 10);
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x, entity.y));
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x - 3, entity.y));
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x + 3, entity.y));
                break;
            case 5:
                entity.scene.player.setData("timerShootDelay", 10);
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x, entity.y));
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x - 3, entity.y));
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x + 3, entity.y));
                break;
            case 6:
                entity.scene.player.setData("timerShootDelay", 10);
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x - 3, entity.y));
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x + 3, entity.y));
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x - 6, entity.y));
                entity.scene.playerLasers.add(new PlayerLaser2(entity.scene, entity.x + 6, entity.y));
                break;
        }
        this.setData("timerShootTick", 0);
    }

    updateOrbs() {
        this.scene.orbs.clear(false, true);
        if (this.weapon == 4) {
            if (this.power < 3) {
                this.scene.orbs.add(new Orb(this.scene, this.x, this.y));
            } else if (this.power < 5) {
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
        this.direction = 1;
        this.play("sprOrb");
    }
}

class PlayerLaser extends Entity {
    constructor(scene, x, y, angle = 0) {
        super(scene, x, y, "sprLaserPlayer1");
        this.body.velocity.y = -550;
        this.body.velocity.x = +angle;
        this.scale = 2;
        this.damage = 2;
    }
}

class PlayerLaser2 extends Entity {
    constructor(scene, x, y, angle = 0) {
        super(scene, x, y, "sprLaserPlayer2");
        this.body.velocity.y = -550;
        this.body.velocity.x = +angle;
        this.scale = 2;
        this.damage = 2;
    }
}

class focusBeam extends Entity {
    constructor(scene, x, y, scale, damage = 1) {
        super(scene, x, y, "sprFocusBeam");
        this.body.velocity.y = -1500;
        this.scaleY = 3;
        this.scaleX = scale;
        this.damage = damage;
    }

    update() {
        this.setX(this.scene.player.x);

        if (this.scene.keyZ.isUp) {
            this.scene.playerLasers.clear(false, true);
        }
    }
}

class playerHoming extends Entity {
    constructor(scene, x, y, angle = 0) {
        super(scene, x, y, "sprHoming");
        this.body.velocity.y = -1050;
        this.body.velocity.x = angle;
        this.alpha = 0.5;
        this.damage = 1;
        this.play("sprHoming");
        this.scale = 2;
        this.states = {
            MOVE_UP: "MOVE_UP",
            CHASE: "CHASE"
        };
        this.state = this.states.MOVE_UP;
        this.target = null;
        this.refresh = new Phaser.Time.TimerEvent({
            delay: 30,
            loop: true,
        });
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
            if (i == 0) this.target = enemy;
            if (this.state == this.states.MOVE_UP) {
                if (Phaser.Math.Distance.Between(
                        this.x,
                        this.y,
                        enemy.x,
                        enemy.y
                    ) <= 250) {
                    this.target = enemy;
                    this.state = this.states.CHASE;
                }
            }
        }
    }

    chaseTarget() {
        var dx = this.target.x - this.x;
        var dy = this.target.y - this.y;

        var angle = Math.atan2(dy, dx);

        var speed = 1500;
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
                ) > 350) {
                this.target = null;
                this.state = this.states.MOVE_UP;
            } else if (this.target.getData("isDead")) {
                this.body.velocity.y = -1500;
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