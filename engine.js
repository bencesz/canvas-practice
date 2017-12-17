/* ------------------------------------------------ */
/*    CANVAS PRACTICE                               */
/*    by Bence Szegvári                             */
/*    https://github.com/bencesz/canvas-practice    */
/* ------------------------------------------------ */

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
//1.0.6 - config refactoring
//1.0.7 - additional key bindings, explosion, enhanced debugging
//1.0.8 - start screen
//1.0.9 - text refactoring

//TODO 1.1.0 - levels
//TODO 1.1.1 - local storage
//TODO 1.1.2 - images

//TODO 1.2.0 - settings: difficulty
//TODO 1.2.1 - settings: key bindings
//TODO 1.2.2 - settings: controller input
//TODO 1.2.3 - settings: player settings

//TODO 1.3.0 - upgrades


// VARIABLES and SETTINGS -------------------------------------- //
var config = {},
    Config = function() {
        // Game info
        this.version = '1.0.9';
        this.author = 'Bence Szegvári';
        this.date = '2017';
        this.url = 'https://github.com/bencesz/canvas-practice';

        // Debugging (using console)
        this.debugging = true;

        // HTML elements
        this.gameContainer = document.getElementById('game');
        this.startScreen = document.getElementById('start-screen');
        this.playScreen = document.getElementById('play-screen');
        this.playScore = document.getElementById('play-score');
        this.playHighScore = document.getElementById('play-high-score');
        this.playHits = document.getElementById('play-hits');
        this.playBestHits = document.getElementById('play-best-hits');
        this.playTime = document.getElementById('play-time');
        this.playBestTime = document.getElementById('play-best-time');
        this.pauseScreen = document.getElementById('pause-screen');
        this.endScreen = document.getElementById('end-screen');
        this.endTitleWin = document.getElementById('end-title-win');
        this.endTitleLose = document.getElementById('end-title-lose');
        this.endScore = document.getElementById('end-score');
        this.endHighScore = document.getElementById('end-high-score');
        this.endHits = document.getElementById('end-hits');
        this.endBestHits = document.getElementById('end-best-hits');
        this.endTime = document.getElementById('end-time');
        this.endBestTime = document.getElementById('end-best-time');
        this.buttonPause = document.getElementById('btn-pause');
        this.buttonResume = document.getElementById('btn-resume');
        this.buttonRestart = document.getElementById('btn-restart');
        this.buttonMuteMusic = document.getElementById('btn-mute-music');
        this.buttonMuteSfx = document.getElementById('btn-mute-sfx');
        this.textVersion = document.getElementById('version');
        this.textAuthor = document.getElementById('author');
        this.textDate = document.getElementById('date');

        this.resolution = {
            width: 1024,
            height: 640
        };


        // Game settings
        this.settings = {
            game: {
                width: this.resolution.width,
                height: this.resolution.height,
                padding: 20,
                speed: 1
            },

            background: {
                width: this.resolution.width + 100,
                height: this.resolution.width / 1.5,    // 1.5 ratio
                image: 'assets/images/level1.jpg',
                color: '#222222',
                stroke: '#000000',
                speed: -0.1
            },

            keyBindings: {
                left: 37,           // Left arrow
                right: 39,          // Right arrow
                up: 38,             // Up arrow
                down: 40,           // Down arrow
                shoot: 32,          // Space
                pause: 80,          // p
                toggleMusic: 77,    // m
                toggleSfx: 83,      // s
                restart: 82         // r
            },

            player: {
                width: 60,
                height: 15,
                position: 40,
                speed: 1,
                color: '#ffffff',
                axisY: false
            },

            bullet: {
                width: 3,
                height: 3,
                speed: 2,
                color: '#fff000'
            },

            enemy: {
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

            bomb: {
                width: 5,
                height: 10,
                speed: 1.5,
                dropTime: 300,
                point: 100,
                color: '#e83300'
            },

            explosion: {
                color: 'rgba(255,255,255,.5)',
                size: 30
            },

            score: {
                highScore: 0,
                bestTime: 0,
                bestHits: 0
            },

            music: {
                mute: false,
                track: 'assets/sfx/bg-music.mp3'
            },

            sfx: {
                mute: false,
                shoot: 'assets/sfx/shoot.mp3',
                collide: 'assets/sfx/collide.mp3'
            },

            debugging: {
                state: 'color: green;font-size:14px',
                object: 'color: blue',
                passive: 'color:grey',
                destroyed: 'color:orange',
                event: 'font-weight:bold',
                welcome: 'color:#083eee;text-transform:uppercase;font-size:18px'
            }
        };

        // Game elements
        this.game = {};
        this.player = {};
        this.bullet = {};
        this.enemies = [];
        this.bomb = {};
        this.explosion = {};
        this.background = {};
        this.music = {};
        this.sfx = {};
        this.sfxCollection = [];
    };


// GAME OBJECTS -------------------------------------- //
function Game() {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.width = config.settings.game.width;
    this.canvas.height = config.settings.game.height;
    this.canvas.setAttribute('tabindex','0');
    this.init = function() {
        this.x = 0;
        this.y = 0;
        this.score = 0;
        this.paused = false;
        this.keys = [];
        this.end = false;
        this.frameCount = 0;
        this.time = config.settings.game.speed * config.settings.enemy.enemies * 20;
        this.enemies = config.settings.enemy.enemies;
        this.actions = {
            mutingMusic: false,
            mutingSfx: false,
            pausing: false,
            resuming: false,
            restarting: false
        };
        config.gameContainer.insertBefore(this.canvas, config.gameContainer.childNodes[0]);
        if(config.debugging) { console.log('%cDebugging mode: %cenabled', config.settings.debugging.state, config.settings.debugging.event) }
                        else { console.log('%cDebugging mode: %cdisabled', config.settings.debugging.state, config.settings.debugging.event) }
        if(config.debugging) { console.log('%cGame state: %cinitialized', config.settings.debugging.state, config.settings.debugging.event) }
    };
    this.pause = function () {
        if(config.debugging) { console.log('%cGame state: %cpaused',config.settings.debugging.state, config.settings.debugging.event) }
        this.paused = true;
        config.buttonResume.style.display = 'block';
        config.buttonPause.style.display = 'none';
        config.pauseScreen.style.display = 'flex';
    };
    this.resume = function () {
        if(config.debugging && this.paused) { console.log('%cGame state: %cresumed',config.settings.debugging.state, config.settings.debugging.event) }
        this.paused = false;
        config.buttonPause.style.display = 'block';
        config.buttonResume.style.display = 'none';
        config.pauseScreen.style.display = 'none';
    };
    this.start = function() {
        if(config.debugging) { console.log('%cGame state: %cstarted',config.settings.debugging.state, config.settings.debugging.event) }
        config.playBestHits.innerText = config.settings.score.bestHits.toString();
        config.playBestTime.innerText = config.settings.score.bestTime.toString();
        config.playHighScore.innerText = config.settings.score.highScore.toString();
        this.resume();
        this.interval = setInterval(updateGame, config.settings.game.speed);
        this.timeCounter = setInterval(function(){
            if(config.game.paused || config.game.end) return;
            config.game.time--;
        }, 100);
        this.canvas.focus();
        this.canvas.addEventListener('keydown', function (e) {
            e.preventDefault();
            config.game.keys = (config.game.keys || []);
            config.game.keys[e.keyCode] = (e.type === 'keydown');
        });
        this.canvas.addEventListener('keyup', function (e) {
            e.preventDefault();
            if(e.keyCode !== config.settings.keyBindings.restart) {
                config.game.keys[e.keyCode] = (e.type === 'keydown');
            }
        });
        this.canvas.addEventListener('focus', function(e){
            e.preventDefault();
            if(config.game.end) {
                config.game.canvas.blur();
                return;
            }
            config.game.resume();
        });
        this.canvas.addEventListener('blur', function(e){
            e.preventDefault();
            if(config.game.end) return;
            config.game.pause();
        });
    };
    this.clear = function() {
        this.context.clearRect(this.x, this.y, this.canvas.width, this.canvas.height);
    };
    this.stop = function() {
        if(config.debugging) { console.log('%cGame state: %cended',config.settings.debugging.state, config.settings.debugging.event) }
        this.end = true;
        clearInterval(this.timeCounter);
        clearInterval(this.interval);
        this.clear();
        config.background.update();

        if(config.game.enemies === 0) {
            config.endTitleLose.style.display = 'none';
            config.endTitleWin.style.display = 'block';
            if(config.settings.score.bestHits < config.game.score){
                config.settings.score.bestHits = config.game.score;
            }
            if(config.settings.score.bestTime < config.game.time){
                config.settings.score.bestTime = config.game.time;
            }
            if(config.settings.score.highScore < (config.game.score + config.game.time)) {
                config.settings.score.highScore = (config.game.score + config.game.time);
            }
        } else {
            config.endTitleWin.style.display = 'none';
            config.endTitleLose.style.display = 'block';
            config.game.time = 0;
            if(config.settings.score.highScore < config.game.score) {
                config.settings.score.bestHits = config.game.score;
                config.settings.score.highScore = config.game.score;
            }
        }
        config.endHits.innerText = config.game.score.toString();
        config.endTime.innerText = config.game.time.toString();
        config.endScore.innerText = (config.game.score + config.game.time).toString();
        config.endBestHits.innerText = config.settings.score.bestHits.toString();
        config.endBestTime.innerText = config.settings.score.bestTime.toString();
        config.endHighScore.innerText = config.settings.score.highScore.toString();

        config.endScreen.style.display = 'flex';
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
    this.lineWidth = 1;

    this.update = function() {
        var ctx = config.game.context;
        switch(this.type) {
            case 'image' :
            case 'background' :
                this.image = new Image();
                this.image.src = this.fill;
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
                ctx.lineWidth = this.lineWidth;
                if (this.type === 'background' && config.settings.background.speed !== 0) {
                    var positionY = (config.settings.background.speed > 0) ? this.y + this.height : this.y - this.height;
                    ctx.drawImage(this.image, this.x, positionY, this.width, this.height);
                }
                break;
            case 'text' :
                ctx.font = this.width + " " + this.height;
                ctx.textAlign = this.textAlign;
                ctx.strokeStyle = config.settings.background.stroke;
                ctx.fillStyle = this.fill;
                ctx.lineWidth = this.lineWidth;
                ctx.strokeText(this.text, this.x, this.y);
                ctx.fillText(this.text, this.x, this.y);
                break;
            case 'bullet' :
                ctx.beginPath();
                ctx.strokeStyle = this.fill;
                ctx.lineWidth = this.lineWidth;
                ctx.arc(this.x, this.y, this.width, 0, Math.PI*2);
                ctx.stroke();
                break;
            case 'explosion' :
                ctx.beginPath();
                ctx.strokeStyle = this.fill;
                ctx.lineWidth = this.lineWidth;
                if(this.alive && this.width <= config.settings.explosion.size) {
                    this.width = this.width + config.settings.explosion.size/100;
                    this.lineWidth = this.lineWidth - config.settings.explosion.size/100;
                } else {
                    this.lineWidth = config.settings.explosion.size;
                    this.width = 0;
                    this.alive = false;
                }
                ctx.arc(this.x, this.y, this.width, 0, Math.PI*2);
                ctx.stroke();
                break;
            case 'bomb' :
                ctx.beginPath();
                ctx.fillStyle = this.fill;
                ctx.lineWidth = this.lineWidth;
                ctx.arc(this.x, this.y, this.width, 0, Math.PI*2);
                ctx.fill();
                break;
            default :
                ctx.strokeStyle = config.settings.background.stroke;
                ctx.fillStyle = this.fill;
                ctx.lineWidth = this.lineWidth;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                ctx.fillRect(this.x, this.y, this.width, this.height);
                break;
        }
    };

    this.explode = function(x, y){
        this.x = x;
        this.y = y;
        this.width = 0;
        this.lineWidth = config.settings.explosion.size;
        this.alive = true;
    };

    this.move = function() {
        this.x += this.speedX * (this.speedIncrease);
        this.y += this.speedY;
        if (this.type === 'background' && config.settings.background.speed !== 0) {
            if (config.settings.background.speed > 0 && this.y >= config.game.y) {
                this.y = -(this.height);
            } else if (config.settings.background.speed < 0 && this.y <= config.game.y) {
                this.y = this.height;
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
            config.sfx.collide.play();
            if(config.debugging) { console.log('%c%s %ccollided with %c%s', config.settings.debugging.object, this.type, config.settings.debugging.event, config.settings.debugging.object, object.type) }
        }
        return collision;
    };

    this.speedUp = function(increase) {
        this.speedIncrease = (this.speedIncrease * 10 + increase * 10) / 10;
    };

    this.destroy = function(enemy) {
        this.alive = false;
        this.y = enemy ? -100 : config.settings.game.height + 100;
        this.x = enemy ? -100 : config.settings.game.width + 100;
        if(config.debugging) { console.log('%c%s %cdestroyed', config.settings.debugging.object, this.type, config.settings.debugging.destroyed) }
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
            button: config.buttonMuteMusic,
            settings: config.settings.music
        },
        sfx: {
            button: config.buttonMuteSfx,
            settings: config.settings.sfx
        }
    };
    if(loop) { this.audio.loop = true; }
    config.gameContainer.appendChild(this.audio);
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
function initGame() {
    config = new Config();
    console.log('%cWelcome under the hood!', config.settings.debugging.welcome);
    config.textAuthor.innerText = config.author;
    config.textAuthor.setAttribute('href',config.url);
    config.textDate.innerText = config.date;
    config.textVersion.innerText = config.version;
    loadGame();
}

function loadGame() {
    config.game = new Game();
    config.game.init();

    var backgroundPosition = {
        x: -(config.settings.background.width - config.settings.game.width) / 2,
        y: -(config.settings.background.height - config.settings.game.height) / 2
    };
    config.background = new Component(
        config.settings.background.width,
        config.settings.background.height,
        config.settings.background.image,
        backgroundPosition.x,
        backgroundPosition.y,
        'background'
    );

    var playerPosition = {
        x: config.settings.game.width / 2 - config.settings.player.width / 2,
        y: config.settings.game.height - config.settings.player.height - config.settings.player.position
    };
    config.player = new Component(
        config.settings.player.width,
        config.settings.player.height,
        config.settings.player.color,
        playerPosition.x,
        playerPosition.y,
        'player'
    );

    var enemyPosition = {
        x: config.settings.game.width / 2 - (config.settings.enemy.enemiesInRow * (config.settings.enemy.width + config.settings.game.padding)) / 2,
        y: config.settings.game.padding
    };
    for (var row = 0; row < config.settings.enemy.enemies / config.settings.enemy.enemiesInRow; row++) {
        for (var enemy = 0; enemy < config.settings.enemy.enemiesInRow; enemy++) {
            var enemyPositionX = enemyPosition.x + (enemy * (config.settings.enemy.width + config.settings.game.padding)),
                enemyPositionY = enemyPosition.y + (row * (config.settings.enemy.height + config.settings.game.padding));
            config.enemies.push(new Component(
                config.settings.enemy.width,
                config.settings.enemy.height,
                config.settings.enemy.color,
                enemyPositionX,
                enemyPositionY,
                'enemy['+row+enemy+']')
            );
        }
    }

    var bulletPosition = {
        x: config.settings.game.width + 10,
        y: config.settings.game.height + 10
    };
    config.bullet = new Component(
        config.settings.bullet.width,
        config.settings.bullet.height,
        config.settings.bullet.color,
        bulletPosition.x,
        bulletPosition.y,
        'bullet'
    );
    config.bullet.alive = false;
    config.bullet.speedX = 0;

    var bombPosition = {
        x: -config.settings.bomb.width - 10,
        y: -config.settings.bomb.height - 10
    };
    config.bomb = new Component(
        config.settings.bomb.width,
        config.settings.bomb.height,
        config.settings.bomb.color,
        bombPosition.x,
        bombPosition.y,
        'bomb'
    );
    config.bomb.alive = false;
    config.bomb.speedX = 0;

    var explosionPosition = {
        x: -1000,
        y: -1000
    };
    config.explosion = new Component(
        0,
        0,
        config.settings.explosion.color,
        explosionPosition.x,
        explosionPosition.y,
        'explosion'
    );
    config.explosion.alive = false;
    config.explosion.width = 0;

    config.music = new Audio(config.settings.music.track, 'music', true);
    config.sfxCollection = [
        config.sfx.shoot = new Audio(config.settings.sfx.shoot, 'sfx'),
        config.sfx.collide = new Audio(config.settings.sfx.collide, 'sfx')
    ];
}

function startGame() {
    config.game.start();

    config.startScreen.style.display = 'none';
    config.pauseScreen.style.display = 'none';
    config.playScreen.style.display = 'flex';
    config.buttonRestart.style.display = 'block';

    config.music.play();
}

function restartGame() {
    config.game.stop();
    config.game.clear();
    config.game = {};
    config.player = {};
    config.enemies = [];
    config.bullet = {};
    config.bomb = {};
    config.explosion = {};
    config.background = {};
    config.music = {};
    config.sfx = {};
    config.sfxCollection = [];
    config.gameContainer.innerHTML = '';
    config.endScreen.style.display = 'none';
    console.clear();
    if(config.debugging) {
        console.log('%cGame state: %crestarted',config.settings.debugging.state, config.settings.debugging.event);
    }
    loadGame();
    startGame();
}

function updateGame() {
    config.game.clear();

    if (config.game.enemies === 0 || config.bomb.collideWith(config.player)) {
        config.game.stop();
        return;
    }

    if (config.game.paused) {
        config.background.update();
        config.explosion.update();
        if (config.game.keys) {
            gameControls();
        }
    } else {
        config.game.frameCount += 1;

        config.background.speedX = 0;
        config.settings.background.speed !== 0 ? config.background.speedY = config.settings.background.speed : config.background.speedY = 0;

        config.player.speedX = 0;
        config.player.speedY = 0;

        if (config.game.keys) {
            if (config.game.keys[config.settings.keyBindings.left] && config.player.x > config.game.x) {
                config.player.speedX = -config.settings.player.speed;
                config.background.speedX = (config.settings.background.speed > 0) ? config.settings.background.speed : -config.settings.background.speed;
            }
            if (config.game.keys[config.settings.keyBindings.right] && config.player.x + (config.settings.player.width) < config.settings.game.width) {
                config.player.speedX = config.settings.player.speed;
                config.background.speedX = -config.settings.background.speed;
                config.background.speedX = (config.settings.background.speed > 0) ? -config.settings.background.speed : config.settings.background.speed;
            }
            if (config.settings.player.axisY) {
                if (config.game.keys[config.settings.keyBindings.down] && config.player.y + (config.settings.player.height) < config.settings.game.height) {
                    config.player.speedY = config.settings.player.speed;
                    config.background.speedY = (config.settings.background.speed > 0) ? -config.settings.background.speed : config.settings.background.speed;
                }
                if (config.game.keys[config.settings.keyBindings.up] && config.player.y > config.game.y) {
                    config.player.speedY = -config.settings.player.speed;
                    config.background.speedY = (config.settings.background.speed > 0) ? config.settings.background.speed : -config.settings.background.speed;
                }
            }
            if (config.game.keys[config.settings.keyBindings.shoot]) {
                shoot(config.player);
            }
            gameControls();
        }

        config.background.move();
        config.background.update();

        config.player.move();
        config.player.update();

        config.bullet.alive ? config.bullet.speedY = -config.settings.bullet.speed : config.bullet.speedY = 0;
        if (config.bullet.alive && (config.bullet.y <= config.game.y)) {
            config.bullet.destroy(false);
        }

        config.bullet.move();
        config.bullet.update();

        var enemySpeedUp = false;
        for (var index = 0; index < config.enemies.length; index++) {
            if (config.enemies[index].alive) {
                if (config.enemies[index].x <= config.game.x) {
                    config.settings.enemy.leftToRight = true;
                    enemySpeedUp = true;
                } else if (config.enemies[index].x + (config.enemies[index].width) >= config.settings.game.width) {
                    config.settings.enemy.leftToRight = false;
                    enemySpeedUp = true;
                }
            }
        }
        for (var enemy = 0; enemy < config.enemies.length; enemy++) {
            config.enemies[enemy].speedY = 0;
            config.enemies[enemy].speedX = 0;

            if (config.enemies[enemy] && config.enemies[enemy].alive) {

                if (config.player.collideWith(config.enemies[enemy]) || config.enemies[enemy].y + (config.enemies[enemy].height) > config.settings.game.height) {
                    config.explosion.explode(config.player.x + config.player.width/2, config.player.y + config.player.height/2);
                    config.game.stop();
                    return;
                }
                if (config.bullet.collideWith(config.enemies[enemy])) {
                    config.game.score += config.settings.enemy.point;
                    config.explosion.explode(config.enemies[enemy].x + config.enemies[enemy].width/2, config.enemies[enemy].y + config.enemies[enemy].height/2);
                    config.enemies[enemy].destroy(true);
                    config.game.enemies--;
                    if(config.debugging) { console.log('%cEnemies left: ', config.settings.debugging.passive, config.game.enemies) }
                    config.bullet.destroy(false);
                }

                if (enemySpeedUp) {
                    config.enemies[enemy].speedUp(config.settings.enemy.speedIncrease);
                    config.enemies[enemy].speedY = config.settings.enemy.step;
                    if(config.debugging) { console.log('%cSpeed of enemies increased to', config.settings.debugging.passive, config.enemies[enemy].speedIncrease) }
                }

                config.settings.enemy.leftToRight ?
                    config.enemies[enemy].speedX = config.settings.enemy.speed :
                    config.enemies[enemy].speedX = -config.settings.enemy.speed;
            }
            config.enemies[enemy].move();
            config.enemies[enemy].update();
        }
        if((config.game.frameCount / config.settings.bomb.dropTime) % 1 === 0) {
            var randomEnemy = Math.floor(Math.random()*(config.enemies.length+1));
            if(config.enemies[randomEnemy] && config.enemies[randomEnemy].alive) {
                shoot(config.enemies[randomEnemy]);
            }
        }

        config.bomb.alive ? config.bomb.speedY = config.settings.bomb.speed : config.bomb.speedY = 0;
        if (config.bomb.y + (config.bomb.height) >= config.settings.game.height) {
            config.bomb.destroy(true);
        }

        if (config.bomb.collideWith(config.bullet)) {
            if(config.bullet.alive && config.bomb.alive) {
                config.game.score += config.settings.bomb.point;
                config.explosion.explode(config.bomb.x + config.bomb.width/2, config.bomb.y + config.bomb.height/2);
                config.bullet.destroy(false);
                config.bomb.destroy(true);
            }
        }

        config.bomb.move();
        config.bomb.update();

        config.explosion.update();

        config.playHits.innerText = config.game.score.toString();
        config.playTime.innerText = config.game.time.toString();
        config.playScore.innerText = (config.game.score + config.game.time).toString();
    }
}

function resumeGame() {
    config.game.canvas.focus();
}

function toggleMusic() {
    if(config.settings.music.mute) {
        config.buttonMuteMusic.classList.remove('muted');
        config.music.unmute();
        if(config.debugging) { console.log('%cMusic: %cunmuted', config.settings.debugging.state, config.settings.debugging.event) }
    } else {
        config.buttonMuteMusic.classList.add('muted');
        config.music.mute();
        if(config.debugging) { console.log('%cMusic: %cmuted', config.settings.debugging.state, config.settings.debugging.event) }
    }
    config.settings.music.mute = !config.settings.music.mute;
    config.game.canvas.focus();
}

function toggleSfx() {
    if(config.settings.sfx.mute) {
        config.buttonMuteSfx.classList.remove('muted');
        for (var unmuted = 0; unmuted < config.sfxCollection.length; unmuted++) {
            config.sfxCollection[unmuted].unmute();
        }
        if(config.debugging) { console.log('%cSFX: %cunmuted', config.settings.debugging.state, config.settings.debugging.event) }

    } else {
        config.buttonMuteSfx.classList.add('muted');
        for (var muted = 0; muted < config.sfxCollection.length; muted++) {
            config.sfxCollection[muted].mute();
        }
        if(config.debugging) { console.log('%cSFX: %cmuted', config.settings.debugging.state, config.settings.debugging.event) }
    }
    config.settings.sfx.mute = !config.settings.sfx.mute;
    config.game.canvas.focus();
}

function shoot(origin) {
    switch(origin.type) {
        case 'player':
            if(!config.bullet.alive) {
                if (config.debugging) { console.log('%c%s %cshot %c%s', config.settings.debugging.object, origin.type, config.settings.debugging.event, config.settings.debugging.object, config.bullet.type); }
                config.bullet.x = origin.x + (origin.width / 2);
                config.bullet.y = origin.y;
                config.sfx.shoot.stop();
                config.sfx.shoot.play();
                config.bullet.alive = !config.bullet.alive;
            }
            break;
        default :
            if(!config.bomb.alive) {
                if (config.debugging) { console.log('%c%s %cdropped %c%s', config.settings.debugging.object, origin.type, config.settings.debugging.event, config.settings.debugging.object, config.bomb.type); }
                config.bomb.x = origin.x + (origin.width / 2);
                config.bomb.y = origin.y + (origin.height);
                config.sfx.shoot.stop();
                config.sfx.shoot.play();
                config.bomb.alive = !config.bomb.alive;
            }
            break;
    }
}

function gameControls() {
    if (config.game.keys[config.settings.keyBindings.toggleMusic] && !config.game.actions.mutingMusic) {
        config.game.actions.mutingMusic = true;
        toggleMusic();
        setTimeout(function() {
            config.game.actions.mutingMusic = false;
        },300);
    }
    if (config.game.keys[config.settings.keyBindings.toggleSfx] && !config.game.actions.mutingSfx) {
        config.game.actions.mutingSfx = true;
        toggleSfx();
        setTimeout(function() {
            config.game.actions.mutingSfx = false;
        },300);
    }
    if (config.game.keys[config.settings.keyBindings.pause] && !config.game.actions.pausing) {
        config.game.actions.pausing = true;
        config.game.paused ? config.game.resume() : config.game.pause();
        setTimeout(function() {
            config.game.actions.pausing = false;
        },300);
    }
    if (config.game.keys[config.settings.keyBindings.restart] && !config.game.actions.restarting) {
        config.game.actions.restarting= true;
        restartGame();
        setTimeout(function() {
            config.game.actions.restarting = false;
        },300);
    }
}