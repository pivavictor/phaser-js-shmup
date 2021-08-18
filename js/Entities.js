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

            this.setData("isDead", true);
        }
    }
}

class ChaserShip extends Entity {
    constructor(scene, x, y, multi) {
        super(scene, x, y, "sprEnemy1", "ChaserShip");
        this.body.velocity.y = Phaser.Math.Between(50, 100);
        this.health = 2*multi;
        this.score = 40+(multi*20);
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

                var speed = 250+(this.multi*25);
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
        this.health = 4*multi;
        this.score = 40+(multi*10);
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
        this.health = 6*multi;
        this.score = 40+(multi*10);
        this.multi = multi;
        this.play("sprEnemy2");        
    }

    onDestroy(){
        this.scene.powerUps.add(new PowerUp(this.scene, this.x, this.y, this.multi));
    }
}

class BigMeteor extends Entity {
    constructor(scene, x, y, multi) {
        super(scene, x, y, "sprMeteor", "BigMeteor");
        this.multi = multi;
        this.speed = 175+(multi*25);
        this.body.velocity.y = Phaser.Math.Between(this.speed*0.5, this.speed);
        this.body.velocity.x = Phaser.Math.Between(this.speed*0.3, this.speed*0.6);
        this.health = 2*multi;   
        this.score = 20+(multi*5); 
        this.scale = 6;            
    }

    update(){
        this.angle += 10;
    }

    onDestroy(){
        for(var i = 0; i < Phaser.Math.Between(3, 5); i++){
            this.scene.enemies.add(new SmallMeteor(this.scene, this.x, this.y, this.multi));
        }
    }
}

class SmallMeteor extends Entity{
    constructor(scene, x, y, multi) {
        super(scene, x, y, "sprMeteor", "SmallMeteor");
        this.speed = 200+(multi*50);
        this.body.velocity.y = Phaser.Math.Between(-this.speed, this.speed);
        this.body.velocity.x = Phaser.Math.Between(-this.speed, this.speed);
        this.health = 2;   
        this.score = 10+multi; 
        this.scale = 1;            
    }

    update(){
        this.angle -= 20;
    }
}



class EnemyLaser extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprLaserEnemy0");
        this.body.velocity.y = 450;
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
        this.invulTimer = new Phaser.Time.TimerEvent({ delay: 2000 });
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
                switch(this.power){
                    case 1:
                        this.setData("timerShootDelay", 10);
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x, this.y, 0));                        
                        break;
                    case 2:
                        this.setData("timerShootDelay", 9);
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x+6, this.y, 0));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x-6, this.y, 0));
                        break;
                    case 3:
                        this.setData("timerShootDelay", 9);
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x-6, this.y, -20));    
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x+6, this.y, 20));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x+6, this.y, 0));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x-6, this.y, 0));                        
                        break;
                    case 4:
                        this.setData("timerShootDelay", 8);
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x-6, this.y, -20));    
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x-6, this.y, -40)); 
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x+6, this.y, 20));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x+6, this.y, 40));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x+6, this.y, 0));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x-6, this.y, 0));                          
                        break;
                    case 5:
                        this.setData("timerShootDelay", 8);
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x-6, this.y, -20));    
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x-6, this.y, -40));    
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x-6, this.y, -60));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x+6, this.y, 20));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x+6, this.y, 40));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x+6, this.y, 60));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x+6, this.y, 0));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x-6, this.y, 0));                          
                        break;
                    case 6:
                        this.setData("timerShootDelay", 6);
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x-6, this.y, -20));    
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x-6, this.y, -40));    
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x-6, this.y, -60));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x+6, this.y, 20));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x+6, this.y, 40));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x+6, this.y, 60));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x+6, this.y, 0));
                        this.scene.playerLasers.add(new PlayerLaser(this.scene, this.x-6, this.y, 0));                          
                        break;
                    default:
                        break;
                }                             

                this.scene.sfx.laser.play(); // play the laser sound effect
                this.setData("timerShootTick", 0);
            }
        }
    }

    onHit(){        
        this.scene.sfx.hit.play();
        this.lives -= 1;
        this.power -= 2;
        if(this.power < 1) this.power = 1;
    }

    onDestroy() {
            this.scene.time.addEvent({ // go to game over scene
                delay: 1000,
                callback: function () {
                    this.scene.scene.start("SceneGameOver", 
                    { score: this.scene.player.score,
                      time: this.scene.timerText }
                    );
                },
                callbackScope: this,
                loop: false
            });
        }
}

class PlayerLaser extends Entity {
    constructor(scene, x, y, angle) {
        super(scene, x, y, "sprLaserPlayer1");        
        this.body.velocity.y = -550;
        this.body.velocity.x = +angle;
        this.scale = 2;
    }
}

class PowerUp extends Entity{
    constructor(scene, x, y, multi){
        super(scene, x, y, "sprPowerUp");
        this.body.velocity.y = 100;
        this.score = 400+(multi*100);
    }
    
    update(){
        this.angle += 5;
    }

    onDestroy(){
        this.scene.sfx.powerUp.play();
    }
}

class DummyOneUp extends Entity{
    constructor(scene, x, y){
        super(scene, x, y, "spr1up");
        this.body.velocity.y = -50;
        this.play("spr1up");
        this.on('animationcomplete', function () { this.destroy(); });
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