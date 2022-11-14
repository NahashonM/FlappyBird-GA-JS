'use strict'

let g_vx = 600;
let g_vy = 800;
let g_ctx = undefined;
let g_canvas = undefined;
let g_frameID = undefined
let g_is_in_view = true;

// assets
let g_bg = undefined
let g_bird = undefined 			// head of circular singly linked list
let g_pipe0 = undefined
let g_pipe1 = undefined
let g_total_assets = 0
let g_loaded_assets = 0

// rendering
let g_time = 0
let g_elapsed_time = 0

// birds
let g_bird_x = 50
let g_bird_sz = g_vx / 12

// agents
let g_human = undefined

// physics
let g_gravity = 10

// obstacles
let g_pipes = undefined			// head of singly linked list
let g_pipe_width = 50;
let g_pipe_speed = 2;
let g_add_pipe_time = 5;
let g_pipe_gap = g_bird_sz * 3;


let g_is_ai_playing = true;


window.onload = () => {
	
	g_canvas = document.getElementById("rendering-canvas")
	if(!g_canvas) {
		alert("Hi, your browser does not support HTML5 canvas")
		return
	}
	g_ctx = g_canvas.getContext("2d")

	g_canvas.width = g_vx;
	g_canvas.height = g_vy;
	
	loadAssets();
	
	// test block
	g_human = newBird()
	
	window.addEventListener("click", () => {
		g_human.velocity = -(g_gravity * 0.6 * 1.1);
	})
	
	g_frameID = window.requestAnimationFrame(mainLoop)
}

// watch for huge timestamps when tab visibilty is changed
document.addEventListener('visibilitychange', checkTabFocused);


// assets loader
const loadImage = (url) => {
	const onimageload = () => { g_loaded_assets++; }
	let img =  new Image();
	img.src = url;
	img.onload = onimageload;
	return img
}

function loadAssets() {
	g_bg = loadImage("assets/bg.png"); g_total_assets++;
	g_pipe0 = loadImage("assets/pipe0.png"); g_total_assets++;
	g_pipe1 = loadImage("assets/pipe1.png"); g_total_assets++;

	g_bird = loadImage("assets/bird-upflap.png"); g_total_assets++;
	g_bird.flink = loadImage("assets/bird-midflap.png"); g_total_assets++;
	g_bird.flink.flink = loadImage("assets/bird-downflap.png"); g_total_assets++;
	g_bird.flink.flink.flink = g_bird
}


function newBird() {
	return {
		x: g_bird_x, 
		y: (g_vy / 2 ) - g_bird_sz,
		velocity: 0,
		isAlive: true,
		score: 0,
		ga_score: 0
	}
}


function addPipe() {
	let tmp =  {
		x: g_vx + g_pipe_speed, // [x pos]
		y: randomInteger( g_bird_sz * 2 , g_vy - (g_bird_sz * 2) - g_pipe_gap  ), // [top pipe base]
		g: g_pipe_gap,
		flink: undefined,
		passed: false
	}

	if(g_pipes === undefined) {
		g_pipes = tmp
	}else {
		let next_pipe = g_pipes;

		while(next_pipe.flink !== undefined) {
			next_pipe = next_pipe.flink;
		}

		next_pipe.flink = tmp
	}
}


function removeCollidedPipe() {
	if(g_pipes) {
		let next_pipe = g_pipes;

		g_pipes = next_pipe.flink
	}
}



let drawBgXOffset = 0

function drawBackGround() {
	let scaling = g_vy / g_bg.height
	let img_w = (g_bg.width * scaling)
	let img_h = g_vy

	let offset = (drawBgXOffset % g_vx)
	
	for(var i = offset; i <= g_vx; i += img_w)
		g_ctx.drawImage(g_bg, i, 0, img_w , img_h);

	drawBgXOffset -= 1	
}


function birdPhysics(bird) {
	bird.velocity += g_gravity * g_elapsed_time * 1.6
	bird.y += bird.velocity 
}

function jump(bird) {
	bird.velocity = -(g_gravity * 0.6 * 1.1);
}


let drawBirdWingSmoothy = 0

function drawBird(bird ) {
	drawBirdWingSmoothy += g_elapsed_time

	if (drawBirdWingSmoothy > 0.07) {
		g_bird = g_bird.flink
		drawBirdWingSmoothy = 0
	}

	g_ctx.drawImage( g_bird, g_bird_x, bird.y, g_bird_sz , g_bird_sz);
}



let drawPipesTimeKeep = g_add_pipe_time
function drawPipes() {
	// check if head is out of screen || we have no pipes
	if( g_pipes === undefined ||
		(g_pipes.x + g_pipe_width) < 0 ) {
		
		if(g_pipes) {		// remove out of screen pipe
			let tmp = g_pipes.flink
			g_pipes.flink = undefined;		// clear flink from ous pipe
			g_pipes = tmp
		}
	}
	drawPipesTimeKeep += g_elapsed_time;

	if(drawPipesTimeKeep > g_add_pipe_time) {
		addPipe();
		drawPipesTimeKeep = 0;
	}
	
	let next_pipe = g_pipes;
	while(next_pipe !== undefined) {
		// draw pipe
		next_pipe.x -= g_pipe_speed

		g_ctx.drawImage( g_pipe1, next_pipe.x, 0, g_pipe_width, next_pipe.y);

		let tmp_y = next_pipe.y + next_pipe.g
		g_ctx.drawImage( g_pipe0, next_pipe.x, tmp_y, 
			g_pipe_width, g_vy - tmp_y );


		next_pipe = next_pipe.flink
	}
}

function drawText(text, x, y, font_size = 16) {
	g_ctx.font = font_size + 'px Console';
    g_ctx.fillStyle = 'red';
    g_ctx.fillText( text , x, y);
}


// returns [isCollided, hasPassedPipe]
function testCollition( bird ) {

	let bx1 = bird.x, bx2 = bird.x + g_bird_sz
	let by1 = bird.y, by2 = bird.y + g_bird_sz

	let isCollided = false
	let hasPassedPipe = false

	if (by1 <= 0 || by2 >= g_vy) isCollided = true		// floor & ceiling collision

	let next_pipe = g_pipes;
	while(next_pipe !== undefined) {

		if(next_pipe.passed) {				// we passed you arleady
			next_pipe = next_pipe.flink;
			continue
		}

		if ( bx2 < next_pipe.x ) break;		// pipe is far away and so are the rest

		let p1x1 = next_pipe.x
		let p1x2 = p1x1 + g_pipe_width, p1y2 = next_pipe.y
		let p2y1 = p1y2 + next_pipe.g

		if ( bx1 > p1x2 ) {							// bird has passed new obstacle
			hasPassedPipe = true;
			next_pipe.passed = true;
			next_pipe = next_pipe.flink;
			continue;
		}

		if ( by1 > p1y2 && by2 < p2y1 ) {			// bird is in gap
			next_pipe = next_pipe.flink
			continue;
		}

		isCollided = true
		break;
	}

	return [isCollided, hasPassedPipe]
}


// Get distance gap height and size of nearest pipe
function getNearPipeRect() {

	let next_pipe = g_pipes;
	while(next_pipe !== undefined) {

		if(next_pipe.passed) {				// no neeed for passed pipe
			next_pipe = next_pipe.flink;
			continue
		}

		let s = next_pipe.x - (g_bird_x + g_bird_sz)
		s = (s > 0)? s : 0;								// distance to bird

		let h0 = g_vy - (next_pipe.y + next_pipe.g) 	// gap height from floor
		let h1 = next_pipe.g							// distance btwn top & bottom pip
		let v = g_pipe_speed							// pipe speed [pipes move not bird]

		return[s, h0, h1, v]
	}

	return [0,0,0,0]
}



function checkTabFocused() {
	if (document.visibilityState === 'visible') g_is_in_view = true
	else g_is_in_view = false
}


// render time
let old_timeStamp = 0;
function mainLoop(timestamp) {
	g_elapsed_time = (timestamp - old_timeStamp) / 1000;		// elapsed time in secs
    old_timeStamp = timestamp;
	g_time += g_elapsed_time;

	if ( !g_is_in_view ) {
		window.requestAnimationFrame(mainLoop)
		return
	}

	// render bg
	drawBackGround();

	// call controllers
	let should_request_frame = false
	if (g_is_ai_playing) {
		should_request_frame = geneticAlgorithmController()
	} else {
		should_request_frame = humanController()
	}

	if(should_request_frame)
		g_frameID = window.requestAnimationFrame(mainLoop)

}








function randomInteger (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}


function randomReal (min, max) {
    return Math.random() * (max - min + 1) + min;
}
