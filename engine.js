// CANVAS PRACTICE
// by Bence Szegvari

//0.5.0 - previous engine
//0.6.0 - code rewrite / refactor
//0.7.0 - keyboard controller
//0.8.0 - start feature
//0.8.1 - restart feature
//0.9.0 - pause on blur
//0.9.1 - code comments

//1.0.0 - first working version
//1.0.1 - sfx
//1.0.2 - background music
//1.0.3 - mute / unmute
//1.0.4 - debugging
//1.0.5 - enemy attack
//TODO 1.0.6 - images
//TODO 1.0.7 - full screen

//TODO 1.1.0 - levels
//TODO 1.1.1 - local storage

//TODO 1.2.0 - settings: difficulty
//TODO 1.2.1 - settings: key bindings
//TODO 1.2.2 - settings: controller input
//TODO 1.2.3 - settings: player settings

//TODO 1.3.0 - upgrades


// VARIABLES and SETTINGS -------------------------------------- //
var gameContainer = document.getElementById('game'),
    buttonStart = document.getElementById('btn-start'),
    buttonRestart = document.getElementById('btn-restart'),
    buttonMuteMusic = document.getElementById('btn-mute-music'),
    buttonMuteSfx = document.getElementById('btn-mute-sfx'),
    
    gameVersion = '1.0.5',
    debugging = true,
    debuggingSettings = {
        state: 'color: green',
        event: 'color: blue'
    },
    keyBindings = {
        left: 37,
        right: 39,
        up: 38,
        down: 40,
        shoot: 32,
        mute: 109
    },
    game = {},
    gameSettings = {
        width: 800,
        height: 600,
        padding: 20,
        speed: 1
    },
    player = {},
    playerSettings = {
        width: 60,
        height: 15,
        position: 40,
        speed: 1,
        color: '#ffffff',
        axisY: false
    },
    bullet = {},
    bulletSettings = {
        width: 3,
        height: 3,
        speed: 2,
        color: '#ffffff'
    },
    enemies = [],
    enemySettings = {
        width: 45,
        height: 20,
        speed: .3,
        speedIncrease: 0.1,
        step: 15,
        point: 50,
        color: '#00aa00',
        leftToRight: true,
        enemies: 40,
        enemiesInRow: 10
    },
    bomb = {},
    bombSettings = {
        width: 5,
        height: 10,
        speed: 1.5,
        dropTime: 300,
        color: '#00aa00'
    },
    background = {},
    backgroundSettings = {
        width: 960,
        height: 640,
        image: 'assets/images/level1.jpg',
        color: '#222222',
        stroke: '#000000',
        speed: .1,
        moving: true
    },
    score = {},
    highScore = {},
    scoreSettings = {
        size: 16,
        unit: 'px',
        font: 'Arial, sans-serif',
        color: '#ffffff',
        align: 'start',
        text: {
            score: 'Score: ',
            highScore: 'High score: '
        },
        highScore: 0
    },
    statusText = {},
    statusTextSettings = {
        size: 30,
        unit: 'px',
        font: 'Arial, sans-serif',
        color: '#e83300',
        align: 'center',
        text: {
            starting: 'STARTING',
            gameOver: 'GAME OVER',
            paused: 'PAUSED',
            resumed: 'RESUMED'
        }
    },
    gameInfo = {},
    gameInfoSettings = {
        version: gameVersion,
        creator: 'Bence Szegvari'
    },
    music = {},
    musicSettings = {
        mute: true,
        track: 'assets/sfx/bg-music.mp3'
    },
    sfx = {},
    sfxCollection = [],
    sfxSettings = {
        mute: true,
        shoot: 'assets/sfx/shoot.mp3',
        collide: 'assets/sfx/collide.mp3'
    };


// GAME OBJECTS -------------------------------------- //
function Game() {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.width = gameSettings.width;
    this.canvas.height = gameSettings.height;
    this.canvas.setAttribute('tabindex','0');
    gameContainer.insertBefore(this.canvas, gameContainer.childNodes[0]);
    this.init = function() {
        this.x = 0;
        this.y = 0;
        this.score = 0;
        this.paused = false;
        this.end = false;
        this.frameCount = 0;
        if(debugging) { console.log('%cGame state: initialized', debuggingSettings.state) }
        this.canvas.addEventListener('keydown', function (e) {
            e.preventDefault();
            game.keys = (game.keys || []);
            game.keys[e.keyCode] = (e.type === 'keydown');
        });
        this.canvas.addEventListener('keyup', function (e) {
            e.preventDefault();
            game.keys[e.keyCode] = (e.type === 'keydown');
        });
        this.canvas.addEventListener('focus', function(e){
            e.preventDefault();
            game.end ? game.canvas.blur() : game.resume();
        });
        this.canvas.addEventListener('blur', function(e){
            e.preventDefault();
            if(!game.end) {
                game.pause();
            }
        });
    };
    this.start = function() {
        if(debugging) { console.log('%cGame state: started',debuggingSettings.state) }
        this.interval = setInterval(updateGame, gameSettings.speed);
        this.canvas.focus();
    };
    this.clear = function() {
        this.context.clearRect(this.x, this.y, this.canvas.width, this.canvas.height);
    };
    this.pause = function () {
        if(debugging) { console.log('%cGame state: paused',debuggingSettings.state) }
        this.paused = true;
        statusText.text = statusTextSettings.text.paused;
        statusText.x = gameSettings.width / 2;
        statusText.update();
    };
    this.resume = function () {
        if(debugging) { console.log('%cGame state: resumed',debuggingSettings.state) }
        this.paused = false;
        statusText.text = statusTextSettings.text.resumed;
        statusText.update();
    };
    this.stop = function() {
        if(debugging) { console.log('%cGame state: ended',debuggingSettings.state) }
        clearInterval(this.interval);
        this.clear();
        this.end = true;
        background.update();
        statusText.text = statusTextSettings.text.gameOver;
        statusText.x = gameSettings.width / 2;
        statusText.update();
        score.y = gameSettings.height / 2;
        score.x = gameSettings.width / 2;
        score.textAlign = 'center';
        if(scoreSettings.highScore < game.score) {
            scoreSettings.highScore = game.score;
        }
        highScore.text = scoreSettings.text.highScore + scoreSettings.highScore;
        highScore.y = gameSettings.height / 2 + (scoreSettings.size);
        highScore.x = gameSettings.width / 2;
        gameInfo.update();
        score.update();
        highScore.update();
        buttonRestart.style.display = 'block';
    };
}

function Component(width, height, fill, x, y, type, align) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.speedIncrease = 1;
    this.fill = fill;
    this.textAlign = align;
    this.alive = true;

    this.update = function() {
        var ctx = game.context;
        switch(this.type) {
            case 'image' :
            case 'background' :
                this.image = new Image();
                this.image.src = this.fill;
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
                if (this.type === 'background' && backgroundSettings.moving) {
                    ctx.drawImage(this.image, this.x, this.y + this.height, this.width, this.height);
                }
                break;
            case 'text' :
                ctx.font = this.width + " " + this.height;
                ctx.textAlign = this.textAlign;
                ctx.strokeStyle = backgroundSettings.stroke;
                ctx.fillStyle = this.fill;
                ctx.strokeText(this.text, this.x, this.y);
                ctx.fillText(this.text, this.x, this.y);
                break;
            case 'bullet' :
                ctx.beginPath();
                ctx.strokeStyle = this.fill;
                ctx.arc(this.x, this.y, this.width, 0, Math.PI*2);
                ctx.stroke();
                break;
            case 'bomb' :
                ctx.beginPath();
                ctx.fillStyle = this.fill;
                ctx.arc(this.x, this.y, this.width, 0, Math.PI*2);
                ctx.fill();
                break;
            default :
                ctx.strokeStyle = backgroundSettings.stroke;
                ctx.fillStyle = this.fill;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                ctx.fillRect(this.x, this.y, this.width, this.height);
                break;
        }
    };

    this.move = function() {
        this.x += this.speedX * (this.speedIncrease);
        this.y += this.speedY;
        if (this.type === 'background' && backgroundSettings.moving) {
            if (this.y >= game.y) {
                this.y = -(this.height);
            }
        }
    };

    this.collideWith = function(object) {
        var componentLeft = this.x,
            componentRight = this.x + (this.width),
            componentTop = this.y,
            componentBottom = this.y + (this.height),
            objectLeft = object.x,
            objectRight = object.x + (object.width),
            objectTop = object.y,
            objectBottom = object.y + (object.height),
            collision = true;
        if ((componentBottom < objectTop) ||
            (componentTop > objectBottom) ||
            (componentRight < objectLeft) ||
            (componentLeft > objectRight)) {
            collision = false;
        }
        if(collision && this.alive && object.alive) {
            sfx.collide.play();
            if(debugging) { console.log('%s collided with %s', this.type, object.type) }
        }
        return collision;
    };

    this.speedUp = function(increase) {
        this.speedIncrease = (this.speedIncrease * 10 + increase * 10) / 10;
    };

    this.destroy = function() {
        this.alive = false;
        this.y = gameSettings.height + 100;
        this.x = gameSettings.width + 100;
        if(debugging) { console.log('%s destroyed', this.type) }
    };
}

function Audio(src, type, loop) {
    this.audio = document.createElement('audio');
    this.audio.src = src;
    this.type = type;
    this.audio.setAttribute('preload', 'auto');
    this.audio.setAttribute('controls', 'none');
    this.audio.style.display = 'none';
    this.vars = {
        music: {
            button: buttonMuteMusic,
            settings: musicSettings
        },
        sfx: {
            button: buttonMuteSfx,
            settings: sfxSettings
        }
    };
    if(loop) { this.audio.loop = true; }
    gameContainer.appendChild(this.audio);
    this.muted = this.vars[this.type].settings.mute;
    this.play = function(){
        this.audio.play();
    };
    this.stop = function(){
        this.audio.pause();
    };
    this.mute = function(){
        this.audio.muted = true;
    };
    this.unmute = function(){
        this.audio.muted = false;
    };
    if(this.muted) {
        this.mute();
        this.vars[this.type].button.classList.add('muted');
    } else {
        this.unmute();
        this.vars[this.type].button.classList.remove('muted');
    }
}


// GAME FUNCTIONS  -------------------------------------- //
function loadGame() {
    game = new Game();
    game.init();

    buttonStart.style.display = 'block';

    var backgroundPosition = {
        x: -(backgroundSettings.width - gameSettings.width) / 2,
        y: -(backgroundSettings.height - gameSettings.height) / 2
    };
    background = new Component(
        backgroundSettings.width,
        backgroundSettings.height,
        backgroundSettings.image,
        backgroundPosition.x,
        backgroundPosition.y,
        'background'
    );

    var scorePosition = {
        x: gameSettings.padding,
        y: gameSettings.height - gameSettings.padding
    };
    score = new Component(
        scoreSettings.size + scoreSettings.unit,
        scoreSettings.font,
        scoreSettings.color,
        scorePosition.x,
        scorePosition.y,
        'text',
        scoreSettings.align
    );
    score.text = scoreSettings.text.score + game.score;

    var highScorePosition = {
        x: gameSettings.width / 2,
        y: gameSettings.height - gameSettings.padding
    };
    highScore = new Component(
        scoreSettings.size + scoreSettings.unit,
        scoreSettings.font,
        scoreSettings.color,
        highScorePosition.x,
        highScorePosition.y,
        'text',
        'center'
    );
    highScore.text = scoreSettings.text.highScore + scoreSettings.highScore;

    var gameInfoPosition = {
        x: gameSettings.width - gameSettings.padding,
        y: gameSettings.height - gameSettings.padding
    };
    gameInfo = new Component(
        scoreSettings.size + scoreSettings.unit,
        scoreSettings.font,
        scoreSettings.color,
        gameInfoPosition.x,
        gameInfoPosition.y,
        'text',
        'end'
    );
    gameInfo.text = 'v'+gameInfoSettings.version;

    var statusTextPosition = {
        x: gameSettings.width / 2,
        y: gameSettings.height / 2 - statusTextSettings.size
    };
    statusText = new Component(
        statusTextSettings.size + statusTextSettings.unit,
        statusTextSettings.font,
        statusTextSettings.color,
        statusTextPosition.x,
        statusTextPosition.y,
        'text',
        statusTextSettings.align
    );
    statusText.text = statusTextSettings.text.starting;

    var playerPosition = {
        x: gameSettings.width / 2 - playerSettings.width / 2,
        y: gameSettings.height - playerSettings.height - playerSettings.position
    };
    player = new Component(
        playerSettings.width,
        playerSettings.height,
        playerSettings.color,
        playerPosition.x,
        playerPosition.y,
        'player'
    );

    var enemyPosition = {
        x: gameSettings.width / 2 - (enemySettings.enemiesInRow * (enemySettings.width + gameSettings.padding)) / 2,
        y: gameSettings.padding
    };
    for (var row = 0; row < enemySettings.enemies / enemySettings.enemiesInRow; row++) {
        for (var enemy = 0; enemy < enemySettings.enemiesInRow; enemy++) {
            var enemyPositionX = enemyPosition.x + (enemy * (enemySettings.width + gameSettings.padding)),
                enemyPositionY = enemyPosition.y + (row * (enemySettings.height + gameSettings.padding));
            enemies.push(new Component(
                enemySettings.width,
                enemySettings.height,
                enemySettings.color,
                enemyPositionX,
                enemyPositionY,
                'enemy['+row+enemy+']')
            );
        }
    }

    var bulletPosition = {
        x: gameSettings.width + 10,
        y: gameSettings.height + 10
    };
    bullet = new Component(
        bulletSettings.width,
        bulletSettings.height,
        bulletSettings.color,
        bulletPosition.x,
        bulletPosition.y,
        'bullet'
    );
    bullet.alive = false;
    bullet.speedX = 0;

    var bombPosition = {
        x: -bombSettings.width - 10,
        y: -bombSettings.height - 10
    };
    bomb = new Component(
        bombSettings.width,
        bombSettings.height,
        bombSettings.color,
        bombPosition.x,
        bombPosition.y,
        'bomb'
    );
    bomb.alive = false;
    bomb.speedX = 0;

    music = new Audio(musicSettings.track, 'music', true);
    sfxCollection = [
        sfx.shoot = new Audio(sfxSettings.shoot, 'sfx'),
        sfx.collide = new Audio(sfxSettings.collide, 'sfx')
    ];
}
function startGame() {
    game.start();

    buttonStart.style.display = 'none';

    music.play();
}

function restartGame() {
    game.stop();
    game.clear();
    game = {};
    gameInfo = {};
    player = {};
    enemies = [];
    bullet = {};
    bomb = {};
    background = {};
    score = {};
    statusText = {};
    music = {};
    sfx = {};
    sfxCollection = [];
    gameContainer.innerHTML = '';
    buttonRestart.style.display = 'none';
    if(debugging) {
        console.clear();
        console.log('%cGame state: restarted',debuggingSettings.state);
    }
    loadGame();
    startGame();
}

function updateGame() {
    game.clear();

    if (enemies.length * enemySettings.point === game.score || bomb.collideWith(player)) {
        game.stop();
        return;
    }

    if (game.paused) {
        background.update();
        score.update();
        highScore.update();
        gameInfo.update();
        statusText.update();
    } else {
        game.frameCount += 1;

        background.speedX = 0;
        backgroundSettings.moving ? background.speedY = backgroundSettings.speed : background.speedY = 0;

        player.speedX = 0;
        player.speedY = 0;

        if (game.keys) {
            if (game.keys[keyBindings.left] && player.x > game.x) {
                player.speedX = -playerSettings.speed;
                background.speedX = backgroundSettings.speed;
            }
            if (game.keys[keyBindings.right] && player.x + (playerSettings.width) < gameSettings.width) {
                player.speedX = playerSettings.speed;
                background.speedX = -backgroundSettings.speed;
            }
            if (playerSettings.axisY) {
                if (game.keys[keyBindings.down] && player.y + (playerSettings.height) < gameSettings.height) {
                    player.speedY = playerSettings.speed;
                    background.speedY = -backgroundSettings.speed;
                }
                if (game.keys[keyBindings.up] && player.y > game.y) {
                    player.speedY = -playerSettings.speed;
                    background.speedY = backgroundSettings.speed;
                }
            }
            if (game.keys[keyBindings.shoot]) {
                shoot(player);
            }
        }

        background.move();
        background.update();

        player.move();
        player.update();

        bullet.alive ? bullet.speedY = -bulletSettings.speed : bullet.speedY = 0;
        if (bullet.alive && (bullet.y <= game.y)) {
            bullet.destroy();
        }

        bullet.move();
        bullet.update();

        var enemySpeedUp = false;
        for (var index = 0; index < enemies.length; index++) {
            if (enemies[index].alive) {
                if (enemies[index].x <= game.x) {
                    enemySettings.leftToRight = true;
                    enemySpeedUp = true;
                } else if (enemies[index].x + (enemies[index].width) >= gameSettings.width) {
                    enemySettings.leftToRight = false;
                    enemySpeedUp = true;
                }
            }
        }
        for (var enemy = 0; enemy < enemies.length; enemy++) {
            enemies[enemy].speedY = 0;
            enemies[enemy].speedX = 0;

            if (enemies[enemy].alive) {

                if (player.collideWith(enemies[enemy]) || enemies[enemy].y + (enemies[enemy].height) > gameSettings.height) {
                    game.stop();
                    return;
                }
                if (bullet.collideWith(enemies[enemy])) {
                    game.score += enemySettings.point;
                    enemies[enemy].destroy();
                    bullet.destroy();
                }

                if (enemySpeedUp) {
                    enemies[enemy].speedUp(enemySettings.speedIncrease);
                    enemies[enemy].speedY = enemySettings.step;
                    if(debugging) { console.log('Speed of enemies increased to', enemies[enemy].speedIncrease) }
                }

                enemySettings.leftToRight ?
                    enemies[enemy].speedX = enemySettings.speed :
                    enemies[enemy].speedX = -enemySettings.speed;
            }
            enemies[enemy].move();
            enemies[enemy].update();
        }
        if((game.frameCount / bombSettings.dropTime) % 1 === 0) {
            var randomEnemy = Math.floor(Math.random()*(enemies.length+1));
            if(enemies[randomEnemy].alive) {
                shoot(enemies[randomEnemy]);
            }
        }

        bomb.alive ? bomb.speedY = bombSettings.speed : bomb.speedY = 0;
        if (bomb.y + (bomb.height) >= gameSettings.height) {
            bomb.destroy();
        }

        if (bomb.collideWith(bullet)) {
            if(bullet.alive && bomb.alive) {
                bullet.destroy();
                bomb.destroy();
            }
        }

        bomb.move();
        bomb.update();

        score.text = scoreSettings.text.score + game.score;
        score.update();

        gameInfo.update();
        highScore.update();
    }
}


function toggleMusic() {
    if(musicSettings.mute) {
        buttonMuteMusic.classList.remove('muted');
        music.unmute();
        if(debugging) { console.log('%cMusic unmuted', debuggingSettings.event) }
    } else {
        buttonMuteMusic.classList.add('muted');
        music.mute();
        if(debugging) { console.log('%cMusic muted', debuggingSettings.event) }
    }
    musicSettings.mute = !musicSettings.mute;
    game.canvas.focus();
}

function toggleSfx() {
    if(sfxSettings.mute) {
        buttonMuteSfx.classList.remove('muted');
        for (var unmuted = 0; unmuted < sfxCollection.length; unmuted++) {
            sfxCollection[unmuted].unmute();
        }
        if(debugging) { console.log('%cSFX unmuted', debuggingSettings.event) }

    } else {
        buttonMuteSfx.classList.add('muted');
        for (var muted = 0; muted < sfxCollection.length; muted++) {
            sfxCollection[muted].mute();
        }
        if(debugging) { console.log('%cSFX muted', debuggingSettings.event) }
    }
    sfxSettings.mute = !sfxSettings.mute;
    game.canvas.focus();
}


function shoot(origin) {
    switch(origin.type) {
        case 'player':
            if(!bullet.alive) {
                if (debugging) { console.log('%c%s shot', debuggingSettings.event, origin.type); }
                bullet.x = origin.x + (origin.width / 2);
                bullet.y = origin.y;
                sfx.shoot.play();
                bullet.alive = !bullet.alive;
            }
            break;
        default :
            if(!bomb.alive) {
                if (debugging) { console.log('%s shot', origin.type); }
                bomb.x = origin.x + (origin.width / 2);
                bomb.y = origin.y + (origin.height);
                sfx.shoot.play();
                bomb.alive = !bomb.alive;
            }
            break;
    }
}