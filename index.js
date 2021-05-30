// setting the environment for the game   
let config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    // Phaser 3 uses different libraris to implement its physics, like in this case arcade.js, but its also possible to use other libraries like matter.js 
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: false
        }
    },
    // preload, create and update methods are the main functions for the game flow
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Variables declared to be used later in my functions (global Variables)
let player;
let coins;
let bombs;
let platforms;
let cursors;
let score = 0;
let scoreText;
let gameOver = false;
let newGame;
let spaceBar;

// create an instance of Game. (creates a game)
let game = new Phaser.Game(config);

// In preload function all the Images are going to be preloaded for the game
function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('bomb', 'assets/bomb.png');

    // A sprite sheet is an image that consists of several smaller images (sprites) and/or animations.
    this.load.spritesheet('banditIdle', 'assets/Bandit_Idle_resized.png', {frameWidth: 100, frameHeight: 100})
    this.load.spritesheet('banditRun', 'assets/Bandit_Run_resized.png', { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('coin', 'assets/coin.png', {frameWidth: 25, frameHeight: 22})
    
}

function create() {

    if(gameOver){
        this.add.text(350, 150, 'Game Over', { fontSize: "60px", fill: '#d90202' });
    };

    // add image background
    this.add.image(500, 300, 'sky');

    // add platforms
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 586, 'ground').setScale(3).refreshBody();

    platforms.create(1000, 400, 'ground')
    platforms.create(0, 400, 'ground')
    platforms.create(520, 250, 'ground')
    platforms.create(1100, 150, 'ground')
    platforms.create(-100, 150, 'ground')

    // I create all my animations for my character and coins
    this.anims.create({
        key: 'right-idle',
        frames: this.anims.generateFrameNumbers('banditIdle', { start: 0, end: 3 } ),
        frameRate: 10,
        repeat: -1 
    });

    this.anims.create({
        key: 'left-idle',
        frames: this.anims.generateFrameNumbers('banditIdle', { start: 4, end: 7 } ),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'right-run',
        frames: this.anims.generateFrameNumbers('banditRun', { start: 0, end: 5 } ),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'left-run',
        frames: this.anims.generateFrameNumbers('banditRun', { start: 6, end: 11 } ),
        frameRate: 10,
        repeat: -1
    })
    
    this.anims.create({
        key: 'myCoin',
        frames: this.anims.generateFrameNumbers('coin', {start: 0, end: 5}),
        frameRate: 10,
        repeat: -1
    })


    // add player
    player = this.physics.add.sprite(500, 450, 'banditIdle').setSize(35, 35).setOffset(30, 60).play('right-idle')
    // player = this.physics.add.sprite(500, 450, 'banditIdle').setSize(35, 35).play('right-idle')
    // player = this.physics.add.sprite(500, 450, 'banditIdle').play('right-idle')

    // player bounce after landing from jump
    player.setBounce(0.2)

    // player will nor fall out of the screengame
    player.setCollideWorldBounds(true)
    // Calling the animation to initilize our player
    
    
    
    //  Input Events will allow to use the cursors in my Key Board
    cursors = this.input.keyboard.createCursorKeys();
    spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    //  Some coins to collect, 15 in total, evenly spaced 69 pixels apart along the x axis
    coins = this.physics.add.group({
        key: 'coin',
        repeat: 14,
        setXY: { x: 15, y: 0, stepX: 69}
    });

    // In total there will be 15 coins, one parent, and 14 children
    coins.children.iterate(function (child){

        //  Each coin has a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        // calling the animation for the coins
        child.play('myCoin')
    })

    //  create a group for bombs
    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#f2f2f2' });

    //  Collide the player, the coins and the bombs with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(coins, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the coins, if it does call the collectCoin() function
    this.physics.add.overlap(player, coins, collectCoin, null, this);

    // If the player collide with a bomb, call the hitBomb() function
    this.physics.add.collider(player, bombs, hitBomb, null, this)
}




// after being preloaded and created, my update() function will allow me move my character over the world with some conditions
function update() {
    
    // variable gameOver will be set up to true when the character touchs a bomb, that means, the update function will stop and show the message "Game Over"
    if(gameOver){
        return  this.add.text(350, 150, 'Game Over', { fontSize: "60px", fill: '#d90202' });
    };

    // isDown key has a boolean as value, and it will be set up to "true" ebery time the menssioned keyboard coursor is pressed 
    if(cursors.left.isDown){
        // if this condition is true the character will move to the left, (to the minus value in the axis "X")
        player.setVelocityX(-160);
        // animation function will be called as well
        player.anims.play('left-run', true) 
    }

    else if(cursors.right.isDown){

        player.setVelocityX(160);
        player.anims.play('right-run', true)
    } 

    else {
        // character stops when no key coursor is pressed
        player.setVelocityX(0);
        
        // character will return to an idle animation
        const key = player.anims.currentAnim.key;
        const parts = key.split('-');
        const direction = parts[0];

        player.anims.play(`${direction}-idle`, true)
    };
        
    // in this condition, the jump of my character will be set up
    if (cursors.up.isDown && player.body.touching.down){
        player.setVelocityY(-330);
    }; 

};


function collectCoin (player, coin){

    // coin is going to desaper when the player touchs it
    coin.disableBody(true, true);

    // the score will increase 10 points ebery time the character riches a coin
    score += 10;
    scoreText.setText('Score: ' + score)

    //  A new batch of coins to collect
    if(coins.countActive(true) === 0){
        coins.children.iterate(function(child){
            child.enableBody(true, child.x, 0, true, true);
        });
    };
    
    // if character gets a coin in the left side of the screen (between 0 and 500 pixel), a bomb will appear on the right side of the screen(between 500 and 1000 pixel) 
    // Phaser.Math.Between(range1, range2) ===> similar to a random function in Phaser 3
    let x = (player.x < 500) ? Phaser.Math.Between(500, 1000) : Phaser.Math.Between(0, 500);

    // once the value of "x" axis is set up, One new bomb will appear ebery time the character gets 5 coins
    
    if (coins.countActive(true) === 10  || coins.countActive(true) === 5 || coins.countActive(true) === 1){

        let bomb = bombs.create(x, 16, 'bomb');

        // bounce value for bombs
        bomb.setBounce(1);
        
        // bombs will not fall out the world
        bomb.setCollideWorldBounds(true);

        // velocity for bombs, "x" axis a random velocity between -200(left) and 200(right), "y" will be 20
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

        bomb.allowGravity = false
    } 
}

// function to define when character touchs a bomb
function hitBomb(player, bomb){

    // once the character touchs a bomb, the game will be paused
    this.physics.pause();

    // character will get red color
    player.setTint(0xff0000);

    // game over when character touchs bomb
    gameOver = true
}



