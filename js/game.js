var config = {
    type: Phaser.WEBGL,
    width: 480,
    height: 600,
    backgroundColor: "black",
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    scene: [SceneMainMenu,
        SceneMain,
        SceneTest,
        SceneGameOver
    ],
    pixelArt: true,
    roundPixels: true
};

var game = new Phaser.Game(config);