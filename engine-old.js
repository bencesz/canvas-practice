// VERSION 0.5
// by Bence Szegvári
// TO DO
// - Collision
// - multiple bullets
// - moving background


// Initialize game --------------------------------
init = function() {
	// Setting up canvas
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	// Game settings
	aircraft = {
		x : 0,			// Aircraft offset x
		y : 60,			// Aircraft offset y
		w : 40,			// Aircraft width
		h : 20,			// Aircraft height
		col : 4,		// Aircraft columns
		row : 5,		// Aircraft rows
		marginx : 20,	// Aircraft vertical spacing
		marginy : 20,	// Aircraft horizontal spacing
		speed : 350, 	// Aircraft speed in milliseconds
		increase : 25,	// Aircraft speed increase when hitting wall
		step : 10,		// Aircraft movement in pixels
		right : true,	// Aircraft movement direction (default true)
		color : {
			type : "fix",		// Aircraft color type (fix/random)
			value : "#121212"	// Aircraft color code (HEX)
		}
	};
	gun = {
		w : 80,			// Gun width
		h : 20,			// Gun height
		x : 400,		// Gun offset x
		y : 500,		// Gun offset y
		cannon : {
			w : 20,		// Cannon width
			h : 10 		// Cannon height
		},
		step : 20		// Cannon movement in pixels
	};
	bullet = {
		w : 5,			// Bullet width
		h : 5,			// Bullet height
		x : 0,			// Bullet offset x
		y : 0,			// Bullet offset y			
		speed : 100, 	// Bullet speed
		step : 20
	};
	paused = true;		// Game state
	bulletExists = false;

	startButton = document.getElementById('btn-start');
	stopButton = document.getElementById('btn-stop');
	
	// Draw Game
	gun.x = (canvas.width-gun.w)/2;
	drawGun(gun.x);
	txtRender("Start game");

	// Add event listeners
	window.addEventListener('keydown', moveGun, true);
	
	stopButton.addEventListener('click', function() {
        tick(true);
        startButton.style.display='block';
        this.style.display='none';
        txtRender("Paused");
        paused = true;
      }, false);

	startButton.addEventListener('click', function() {
        // Initiate ticker
        timer = setInterval(function () {
			tick();
		},aircraft.speed);
        stopButton.style.display='block';
        this.style.display='none';
        this.innerHTML='Resume';
        txtRender("");
        paused = false;
      }, false);

}
// Initialze game --------------------------------

// General functions -----------------------------
tick = function(stop) {
	console.log(aircraft.y+(aircraft.h*aircraft.row+aircraft.marginy*(aircraft.row-1)),gun.y-gun.cannon.h);
	if(stop) {
		clearInterval(timer);
		if(bulletExists) {
			clearInterval(shot);
			bulletExists=false;
		}
	} else if(aircraft.y+(aircraft.h*aircraft.row+aircraft.marginy*(aircraft.row-1))>=gun.y-gun.cannon.h) {
		gameOver();
	} else {
		drawGun(gun.x);
		moveAircraft();
	}
}
gameOver = function() {
	clearInterval(timer);
	txtRender("Game Over...");
	startButton.style.display="block";
	startButton.innerHTML="Restart";
	stopButton.style.display="none";
}
txtRender = function(text) {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	textW = ctx.measureText(text).width;
	textH = 20;
	textX = canvas.width/2 - textW/2;
	textY = canvas.height/2 - textH/2;
	ctx.font = textH+"px sans-serif";
	ctx.fillText(text, textX, textY);
}
// General functions -----------------------------


// Draw function ----------------------------------
drawRect = function(x,y,w,h) {
	if(aircraft.color.type=="random") {
		aircraft.color.value = "#"+Math.floor(Math.random()*(9 - 0))+Math.floor(Math.random()*(9 - 0))+Math.floor(Math.random()*(9 - 0))+Math.floor(Math.random()*(9 - 0))+Math.floor(Math.random()*(9 - 0))+Math.floor(Math.random()*(9 - 0));
	}
	ctx.fillStyle = aircraft.color.value;
	ctx.fillRect(x,y,w,h);
}
// Draw function ----------------------------------


// Gun --------------------------------------------
drawGun = function(x,erase) {
	if(erase) {
		ctx.clearRect(gun.x, gun.y-gun.cannon.h, gun.w, gun.y+gun.cannon.h);
	} else {
		drawRect(x,gun.y,gun.w,gun.h);
		drawRect(x+(gun.w-gun.cannon.w)/2,gun.y-gun.cannon.h,gun.cannon.w,gun.cannon.h);
	}
}
moveGun = function(evt) {
	if(!paused) {
		switch (evt.keyCode) {
			// Left arrow press
			case 37:
				if(gun.x > 0) {
					drawGun(gun.x,true);
					gun.x = gun.x-gun.step;
					drawGun(gun.x);
				}
				break;
			// Right arrow press
			case 39:
				if(gun.x < (canvas.width-gun.w)) {
					drawGun(gun.x,true);
					gun.x = gun.x+gun.step;
					drawGun(gun.x);
				}
				break;
			// Space arrow press
			case 32:
				if(!bulletExists) {
					bullet.x = gun.x+gun.w/2;
					bullet.y = gun.y-gun.cannon.h-bullet.h;
					shootBullet();
				}
				break;
		}
	}
}
// Gun --------------------------------------------


// Bullet -----------------------------------------
drawBullet = function(y,erase) {
	if(erase){
		ctx.clearRect(bullet.x, y, bullet.w, bullet.h);	
	} else {
		drawRect(bullet.x,y,bullet.w,bullet.h);
	}
}
shootBullet = function() {
		shot = setInterval(function(){
			if(bullet.y>0) {
				bulletExists = true;
				drawBullet(bullet.y,true);
				bullet.y = bullet.y-bullet.step;
				drawBullet(bullet.y);
			} else {
				clearInterval(shot);
				bulletExists = false;
			}
		},bullet.speed);
}
// Bullet -----------------------------------------


// Aircraft ---------------------------------------
drawAircraft = function(x,y,erase) {
	for(r=0;r<aircraft.row;r++){
		for(c=0;c<aircraft.col;c++) {
			drawy = r*(aircraft.h+aircraft.marginy)+y;
			drawx = c*(aircraft.w+aircraft.marginx)+x;

			if(erase) {
				ctx.clearRect(drawx,drawy,aircraft.w,aircraft.h);
			} else {
				drawRect(drawx,drawy,aircraft.w,aircraft.h);
			}			
		}
	}
}
moveAircraft = function() {
	drawAircraft(aircraft.x,aircraft.y,true);
	if(aircraft.right) {
		aircraft.x = aircraft.x+aircraft.step;
		if(canvas.width <= aircraft.x+(aircraft.col*aircraft.w+(aircraft.col-1)*aircraft.marginx)-aircraft.step) {
			moveDown(false);
		}
	} else if(aircraft.x <= 0) {
		moveDown(true);
	} else {
		aircraft.x = aircraft.x-aircraft.step;
	}
	drawAircraft(aircraft.x,aircraft.y);
	moveDown = function(right) {
		aircraft.y = aircraft.y+aircraft.h;
		if(right) {
			aircraft.right = true;
		} else {
			aircraft.right = false;
			aircraft.x = aircraft.x-aircraft.step;
		}
		aircraft.speed = aircraft.speed-aircraft.increase;
		clearInterval(timer);
		timer = setInterval(function () {
			tick();
		},aircraft.speed);
	}
}
// Aircraft --------------------------------------


// Collision function ----------------------------
collision = function() {
	
}
// Collision function ----------------------------