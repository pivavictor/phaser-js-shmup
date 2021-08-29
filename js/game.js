var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    backgroundColor: "black",
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                x: 0,
                y: 0
            },
            debug: false
        }
    },
    scene: [SceneMainMenu,
        ScenePause,
        SceneMain,
        SceneClear,
        SceneGameOver
    ],
    pixelArt: true,
    roundPixels: true
};

var game = new Phaser.Game(config);