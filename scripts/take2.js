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
let outermostBranches = [];


const initBranchWidth = 30;
const initBranchHeight = 25;
const minBranchWidth = 4;
const minBranchHeight = 4;
const branchTaper = 0.8;
const branchTrim = 0.6;
const branchLean = 0.2; // +- 
const maxBranches = 1200;

const splitProbability = 0.12;
const pruneProbability = 0.05;
const maxBranchesBeforeSplit = 20;

const windSpeed = 0.008;
const windForce = 0.005;
let windDelta = 0;

let branchCount = 0;
let angle = 0;
let splitCount = 0;
let addedCherries = false;
let splitCountdown = maxBranchesBeforeSplit;
let branchWidth = initBranchWidth;
let branchHeight = initBranchHeight;

function init() {

	branchCount = 0;
	splitCount = 0;
	splitCountdown = maxBranchesBeforeSplit;
	branchWidth = initBranchWidth;
	branchHeight = initBranchHeight;
	addedCherries = false;
	branches = [];
	outermostBranches = [];


	palette = getRandomValueFromArray(palettes);
	const backgroundColor = getRandomValueFromArray(palette);
	renderer.backgroundColor = backgroundColor;
	palette = palette.filter(val => val != backgroundColor);

	animate();
}

function reinit() {
	stage.children.forEach(child => stage.removeChild(child));
	branches.forEach(branch => branch.destroy());
	init();
}

function createBranch(parent, position, startAngle = 0) {
	if(!position) position = {x: 0, y: -parent.branchHeight*0.8};
	const branch = new Container();
	const graphics = new Graphics();
	branch.graphics = graphics;
	branch.addChild(graphics);
	branch.pivot.set(0.5, 0);
	branch.rotation = branch.initRotation = startAngle + randomFloat(-branchLean, branchLean);
	branch.currentRotation = parent.currentRotation + branch.rotation;
	branch.position = position;

	// graphics.lineStyle(1, 0x000000, 1);
	// graphics.beginFill(getRandomValueFromArray(palette));
	graphics.beginFill(0x000000);
	graphics.drawRect(-branchWidth/2, 0, branchWidth, branchHeight);
	graphics.endFill();
	graphics.cacheAsBitmap = true;
	branch.branchHeight = branchHeight;

	parent.addChild(branch);

	branchCount ++;
	return branch;

}

function createFlower(parent) {
	const flower = new Graphics();
	flower.position = {x: 0, y: -parent.branchHeight*0.8};
	flower.beginFill(getRandomValueFromArray(palette));
	flower.drawCircle(0,0, randomFloat(4, 15));
	flower.endFill();
	flower.cacheAsBitmap = true;
	parent.addChild(flower);
}

function animate() {

	windDelta += windSpeed;

	if(branchCount == 0) {

		stage.currentRotation = 0;
		outermostBranches = [
			createBranch(stage, {x: getScreenWidth()/2, y: getScreenHeight()*0.95})
		];

	}else if(branchCount < maxBranches) {

		const newOutermostBranches = [];
		if(splitCount == 0) splitCountdown --;
		outermostBranches.forEach(branch => {
			if(splitCount > 0 && branchWidth < initBranchWidth/3 && Math.random() < pruneProbability) {
				createFlower(branch);
				splitCount --;
			}else{
				if(splitCountdown === 0 || Math.random() < splitProbability) {
					const branch1 = createBranch(branch, null, -0.4);
					const branch2 = createBranch(branch, null, 0.4);
					newOutermostBranches.push(branch1, branch2);
					branches.push(branch1, branch2);
					splitCount ++;
				}else{
					const branch1 = createBranch(branch);
					newOutermostBranches.push(branch1);
					branches.push(branch1);
				}
			}
		});
		outermostBranches = newOutermostBranches;
		if(branchWidth > minBranchWidth) branchWidth -= branchTaper;
		if(branchHeight > minBranchHeight) branchHeight -= branchTrim;
	
	}else if(!addedCherries) {
		outermostBranches.forEach(branch => {
			if(Math.random() > 0.5) createFlower(branch);
		});
		addedCherries = true;
	}

	branches.forEach((branch, i) => {
		branch.rotation = branch.initRotation + Math.cos(windDelta)*windForce*(1 + i*0.01);
	});

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