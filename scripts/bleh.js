import { autoDetectRenderer, Container, Graphics } from 'pixi.js'
import $ from 'jquery'
import palettes from './constants/palettes'
import { 
	addResizeCallback, 
	getPixelDensity, 
	getScreenWidth, 
	getScreenHeight 
} from './utils/screenUtils'
import {
	radToDeg,
	degToRad,
	randomInt,
	randomFloat,
	getRandomValueFromArray,
	getDist,
} from './utils/mathUtils'

// Init PIXI renderer
const $app = $('#app');
const renderer = autoDetectRenderer(
	getScreenWidth()/getPixelDensity(), 
	getScreenHeight()/getPixelDensity(), 
	{
		resolution: getPixelDensity(),
		transparent: false,
		backgroundColor: 0x333333,
		antialias: true,
	}
);
const canvas = renderer.view;
$app.append(canvas);


const stageWrapper = new Container();
const stage = new Container();
stageWrapper.addChild(stage);
let shapes = [];
let palette = [];
let angle = 0;
const easeSpeed = 30;


function init() {

	
	// shapes = [];
	
	palette = getRandomValueFromArray(palettes);
	const backgroundColor = getRandomValueFromArray(palette);
	renderer.backgroundColor = backgroundColor;
	palette = palette.filter(val => val != backgroundColor);
	
	angle = Math.random()*Math.PI;

	animate();
}

function reinit() {
	init();
	shapes.forEach(shape => createShape(shape));
}

const getRandomPosition = () => ({
	x: randomInt(0, getScreenWidth()*1.2), 
	y: randomInt(0, getScreenWidth()*1.2)
});

const innerDist = getScreenWidth()*0.25;
const outerDist = getScreenWidth()*0.4;
const getStartingPosition = () => {
	const centerPoint = {x: getScreenWidth()/2, y: getScreenHeight()/2};
	let position = getRandomPosition();
	let distance = getDist(centerPoint, position);
	while(distance > innerDist && distance < outerDist) {
		position = getRandomPosition();
		distance = getDist(centerPoint, position);
	}
	return position;
}

function createShape(shape = null) {
	const startingPosition = getStartingPosition();
	if(!shape) {
		shape = new Graphics();
		shape.position = shape.realPosition = shape.aimPosition = startingPosition;
	}else{
		shape.aimPosition = startingPosition;
	}
	
	shape.pivot.set(0.5);
	shape.rotation = angle + randomFloat(-0.1, 0.1);
	const width = randomInt(4, 30);
	const height = randomInt(10, 50);
	shape.lineStyle(1, getRandomValueFromArray(palette), 1);
	shape.beginFill(getRandomValueFromArray(palette));
	shape.drift = {x: randomFloat(0,5), y: randomFloat(0,5)};
	shape.thetaSpeed = randomFloat(-0.05, 0.05);
	shape.theta = Math.random()*Math.PI*2;
	if(Math.random() < 0.5) {
		shape.drawRect(-width/2, -height/2, width, height);
	}else{
		shape.drawCircle(0, 0, width);
	}
	shape.endFill();
	shape.cacheAsBitmap = true;

	// this causes a lot of processing
	// shape.interactive = true;
	// shape.on('mouseover', () => {
	// 	shape.aimPosition = getRandomPosition();
	// });
	
	return shape;
}

function animate() {

	if(shapes.length < 3000) {
		for(let i=0; i<25; i++) {
			const shape = createShape();
			shapes.push(shape);
			stage.addChild(shape);
		}
	}


	for(let shape of shapes) {
		shape.theta += shape.thetaSpeed;
		shape.realPosition.x += (shape.aimPosition.x - shape.realPosition.x) / easeSpeed;
		shape.realPosition.y += (shape.aimPosition.y - shape.realPosition.y) / easeSpeed;
		shape.position.x = shape.realPosition.x + Math.cos(shape.theta)*shape.drift.x;
		shape.position.y = shape.realPosition.y + Math.sin(shape.theta)*shape.drift.y;
	}

	renderer.render(stageWrapper);
	window.requestAnimationFrame(animate);
}



function handleResize(width, height) {
	renderer.resize(
		width/getPixelDensity(), 
		height/getPixelDensity()
	);
}

addResizeCallback(handleResize);
$(window).ready(init);
$(window).on('click', reinit);