import { autoDetectRenderer, loader, Container, Graphics, Sprite } from 'pixi.js'
import { RGBSplitFilter } from 'pixi-filters'
import $ from 'jquery'
import throttle from 'lodash/throttle'

import { 
	addResizeCallback, 
	getPixelDensity, 
	getScreenWidth, 
	getScreenHeight 
} from './utils/screenUtils'

// Init PIXI renderer
const $app = $('#app');
const renderer = autoDetectRenderer(
	getScreenWidth()/getPixelDensity(), 
	getScreenHeight()/getPixelDensity(), 
	{
		resolution: getPixelDensity(),
		transparent: false,
		backgroundColor: 0x241e3d,
		antialias: true,
	}
);
const canvas = renderer.view;
$app.append(canvas);

const stageWrapper = new Container();
const stage = new Container();
const stageScale = 0.1;
stageWrapper.addChild(stage);

const sprites = {};
let mouseOffsetX = 0;
let mouseOffsetY = 0;

function init() {

	loader.once('complete', handleLoaderComplete);
	loader.add('tentacle', 'assets/tentacle.png');
	loader.add('eye1', 'assets/eye1.png');
	loader.add('eye2', 'assets/eye2.png');
	loader.add('bigsound', 'assets/bigsound.png');
	loader.add('alien1', 'assets/alien1.png');
	loader.add('alien2', 'assets/alien2.png');
	loader.add('alien3', 'assets/alien3.png');

	loader.load();

	$(window).on('mousemove', handleMouseMove)
}

function handleLoaderComplete(loader, resources) {

	Object.keys(resources).forEach(key => {
		const sprite = new Sprite(resources[key].texture);
		sprite.anchor.set(0.5);
		sprite.theta = Math.random()*Math.PI*2;
		sprite.thetaSpeed = Math.random()*0.05;
		sprite.drift = {x: 5 + Math.random()*30, y: 5 + Math.random()*30};
		sprite.ease = {x: 2 + Math.random()*20, y: 2 + Math.random()*20};
		sprite.rgbFilter = new RGBSplitFilter();
		sprite.rgbFilter.blue = sprite.rgbFilter.green = sprite.rgbFilter.red = {x: 0, y: 0};
		sprites[key] = sprite;
		stage.addChild(sprite);
	});

	stage.scale.set(stageScale);

	initScene();

	animate();
}

function initScene() {

	const w = getScreenWidth() / getPixelDensity() / stageScale;
	const h = getScreenHeight() / getPixelDensity() / stageScale;
	const w2 = w/2;
	const h2 = h/2;

	sprites.bigsound.basePosition = sprites.bigsound.position = {x: w2, y: h2};
	sprites.bigsound.ease = {x: 50, y: 50};
	sprites.bigsound.drift = {x: 2, y: 2};
	sprites.alien1.basePosition = sprites.alien1.position = {x: w2 - 1600, y: h2};
	sprites.alien2.basePosition = sprites.alien2.position = {x: w2 - 900, y: h2 - 600};
	sprites.alien3.basePosition = sprites.alien3.position = {x: w2 + 1100, y: h2 + 300};
	sprites.eye1.basePosition = sprites.eye1.position = {x: w2 + 700, y: h2 - 900};
	sprites.eye2.basePosition = sprites.eye2.position = {x: w2 - 250, y: h2 + 750};
	sprites.tentacle.basePosition = sprites.tentacle.position = {x: w2 - 400, y: h2 - 350};
	sprites.tentacle.ease = {x: 40, y: 40};
	sprites.tentacle.drift = {x: 5, y: 5};

}

const handleMouseMove = throttle(event => {
	mouseOffsetX = event.pageX - getScreenWidth()/2;
	mouseOffsetY = event.pageY - getScreenHeight()/2;
}, 1000/60);


	
function animate() {

	Object.keys(sprites).forEach(key => {
		const sprite = sprites[key];
		sprite.theta += sprite.thetaSpeed;
		sprite.position.x = sprite.basePosition.x + Math.cos(sprite.theta)*sprite.drift.x + mouseOffsetX/sprite.ease.x;
		sprite.position.y = sprite.basePosition.y + Math.sin(sprite.theta)*sprite.drift.y + mouseOffsetY/sprite.ease.y;

		if(!sprite.fucked && Math.random() < 0.005) {
			sprite.fucked = true;
			sprite.rgbFilter.red.x = -Math.random()*5;
			sprite.rgbFilter.blue.x = Math.random()*5;
			sprite.filters= [sprite.rgbFilter];
			setTimeout(() => {
				sprite.fucked = false;
				sprite.filters = [];
			}, 20 + Math.random()*200);
		}
	});

	renderer.render(stageWrapper);
	window.requestAnimationFrame(animate);
}

function handleResize(width, height) {
	renderer.resize(
		width/getPixelDensity(), 
		height/getPixelDensity()
	);
	initScene();
}

addResizeCallback(handleResize);
$(window).ready(init);