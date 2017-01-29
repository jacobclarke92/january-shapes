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

let palette = [];
let branches = [];

let counter = 0;
let angle = 0;
let branchWidth = 40;
let branchHeight = 40;
let minBranchWidth = 2;
let minBranchHeight = 2;
let branchTaper = 1;
let branchTrim = 1;
let branchLean = 0.3; // +- 

function init() {

	counter = 0;
	branchWidth = 40;
	branchHeight = 40;


	palette = getRandomValueFromArray(palettes);
	const backgroundColor = getRandomValueFromArray(palette);
	renderer.backgroundColor = backgroundColor;
	palette = palette.filter(val => val != backgroundColor);
	
	stage.currentRotation = 0;
	createBranch(stage, {x: getScreenWidth()/2, y: getScreenHeight()*0.95});

	animate();
}

function createBranch(parent, position, startAngle = 0) {
	if(!position) position = {x: 0, y: -parent.branchHeight*0.8};
	const branch = new Graphics();
	branch.pivot.set(0.5, 0);
	branch.rotation = startAngle + randomFloat(-branchLean, branchLean);
	branch.currentRotation = parent.currentRotation + branch.rotation;
	branch.position = position;

	branch.lineStyle(0, 0x000000, 1);
	// branch.beginFill(getRandomValueFromArray(palette));
	branch.beginFill(0x000000);
	branch.drawRect(-branchWidth/2, 0, branchWidth, branchHeight);
	branch.endFill();
	// branch.cacheAsBitmap = true;
	branch.branchHeight = branchHeight;

	if(branchWidth > minBranchWidth) branchWidth -= branchTaper;
	if(branchHeight > minBranchHeight) branchHeight -= branchTrim;

	parent.addChild(branch);

	counter ++;
	if(counter < 100) {
		if(Math.random() < 0.25) {
			createBranch(branch, null, -0.2);
			createBranch(branch, null, 0.2);
		}else{
			createBranch(branch);
		}
	}
}

function animate() {


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