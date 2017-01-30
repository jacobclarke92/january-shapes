import { autoDetectRenderer, Container, Graphics } from 'pixi.js'
import $ from 'jquery'
import dat from 'dat.gui/build/dat.gui'
import palettes from './constants/palettes'
import treePresets, { defaultVars } from './constants/treePresets'
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
let stage = new Container();
stageWrapper.addChild(stage);

let palette = [];
let branches = [];
let flowers = [];
let outermostBranches = [];
let branchColor = 0x000000;

const vars = Object.assign({}, defaultVars, {
	Reset: () => reinit(),
	RandomizeColor: () => recolor(),
});

let windForce = vars.initWindForce;
let windDelta = 0;

let branchCount = 0;
let angle = 0;
let addedCherries = false;
let branchWidth = vars.initBranchWidth;
let branchHeight = vars.initBranchHeight;

console.log(treePresets);
const gui = new dat.GUI({load: treePresets});
gui.remember(vars);

const guiBranchSize = gui.addFolder('Branch Size');
guiBranchSize.add(vars, 'initBranchWidth', 1, 150);
guiBranchSize.add(vars, 'initBranchHeight', 1, 150);
guiBranchSize.add(vars, 'minBranchWidth', 1, 50);
guiBranchSize.add(vars, 'minBranchHeight', 1, 50);
guiBranchSize.add(vars, 'branchTaper', 0.1, 2);
guiBranchSize.add(vars, 'branchTrim', 0.1, 2);
guiBranchSize.add(vars, 'branchOverlap', 0.4, 1.2);

const guiBranchLogic = gui.addFolder('Branch Logic');
guiBranchLogic.add(vars, 'maxBranches', 100, 10000);
guiBranchLogic.add(vars, 'minSplitAngle', 0.05, Math.PI/2);
guiBranchLogic.add(vars, 'maxSplitAngle', 0.05, Math.PI/2);
guiBranchLogic.add(vars, 'branchLean', 0.001, Math.PI/2);
guiBranchLogic.add(vars, 'splitProbability', 0, 1);
guiBranchLogic.add(vars, 'pruneProbability', 0, 1);
guiBranchLogic.add(vars, 'splitToLifeRatio', 0, 1);

const guiWind = gui.addFolder('Wind');
guiWind.add(vars, 'windSpeed', 0.001, 0.6);
guiWind.add(vars, 'initWindForce', 0.001, 0.6);

gui.add(vars, 'RandomizeColor');
gui.add(vars, 'Reset');




let initedColorPick = false;
function init() {

	branchCount = 0;
	branchWidth = vars.initBranchWidth;
	branchHeight = vars.initBranchHeight;
	windForce = vars.initWindForce;
	addedCherries = false;
	branches = [];
	flowers = [];
	outermostBranches = [];

	if(!initedColorPick) {
		pickColors();
		initedColorPick = true;
	}

	animate();
}

function pickColors() {
	palette = getRandomValueFromArray(palettes);
	const backgroundColor = getRandomValueFromArray(palette);
	renderer.backgroundColor = backgroundColor;
	palette = palette.filter(val => val != backgroundColor);
	branchColor = getRandomValueFromArray(palette);
	palette = palette.filter(val => val != branchColor);
}

function reinit() {
	flowers.forEach(flower => {
		stage.removeChild(flower);
		flower.cacheAsBitmap = false;
		flower.destroy(true);
	});
	branches.forEach(branch => {
		if(branch.parent) branch.parent.removeChild(branch);
		branch.graphics.cacheAsBitmap = false;
		branch.destroy(true);
	});
	stageWrapper.removeChild(stage);
	stage.destroy();
	stage = new Container();
	stageWrapper.addChild(stage);
	init();
}

function createBranch(parent, position, startAngle = 0) {
	if(!position) position = {x: 0, y: -parent.branchHeight*vars.branchOverlap};
	const branch = new Container();
	const graphics = new Graphics();
	branch.graphics = graphics;
	branch.addChild(graphics);
	// branch.pivot.set(0.5, 0);
	branch.rotation = branch.initRotation = startAngle + randomFloat(-vars.branchLean, vars.branchLean);
	branch.currentRotation = parent.currentRotation + branch.rotation;
	branch.position = position;

	drawBranch(graphics, branchColor, branchWidth, branchHeight);

	branch.branchWidth = branchWidth;
	branch.branchHeight = branchHeight;
	branch.timesSplit = parent.timesSplit || 0;
	branch.family = (parent.family || 0) + 1;

	parent.addChild(branch);

	branchCount ++;
	return branch;

}

function drawBranch(graphics, color, width, height) {
	// graphics.lineStyle(1, 0x000000, 1);
	graphics.beginFill(color);
	graphics.drawRect(-width/2, -height, width, height);
	graphics.endFill();
	graphics.cacheAsBitmap = true;
}

function createFlower(parent) {
	const radius = randomFloat(4, 20) * ((parent.branchHeight / vars.initBranchHeight)/0.35);
	const flower = new Graphics();
	flower.position = {x: 0, y: -parent.branchHeight*0.8};
	flower.beginFill(getRandomValueFromArray(palette));
	flower.drawCircle(0,0, radius);
	flower.endFill();
	flower.cacheAsBitmap = true;
	flower.radius = radius;
	parent.flower = flower;
	parent.addChild(flower);
}

function recolor() {
	pickColors();
	branches.forEach(branch => {
		branch.graphics.cacheAsBitmap = false;
		branch.graphics.clear();
		drawBranch(branch.graphics, branchColor, branch.branchWidth, branch.branchHeight);
		if(branch.flower) {
			branch.flower.cacheAsBitmap = false;
			branch.flower.clear();
			branch.flower.beginFill(getRandomValueFromArray(palette));
			branch.flower.drawCircle(0,0, branch.flower.radius);
			branch.flower.endFill();
			branch.flower.cacheAsBitmap = true;
		}
	});
}


function shedFlowers() {
	flowers = [];
	branches.forEach(branch => {
		if(branch.flower) {
			const flower = branch.flower;
			const flowerGlobalPos = flower.worldTransform;
			const flowerPosition = {x: flowerGlobalPos.tx, y: flowerGlobalPos.ty};
			branch.removeChild(flower);
			stage.addChild(flower);
			flower.position = flower.realPosition = flowerPosition;
			flower.speed = {x: randomFloat(-5, 5), y: randomFloat(-1, -5)};
			flower.delta = {x: Math.random()*Math.PI, y: Math.random()*Math.PI};
			flower.deltaForce = {x: randomFloat(0, 30), y: randomFloat(0, 30)};
			flower.deltaSpeed = {x: randomFloat(0, 0.2), y: randomFloat(0, 0.2)};
			flowers.push(flower);
		}
	});
}

function animate() {

	windDelta += vars.windSpeed;

	if(branchCount == 0) {

		stage.currentRotation = 0;
		const branch = createBranch(stage, {x: getScreenWidth()/2, y: getScreenHeight()*0.92});
		outermostBranches = [branch];
		branches = [branch];

	}else if(branchCount < vars.maxBranches) {

		const newOutermostBranches = [];
		outermostBranches.forEach(branch => {
			const splitsOverLife = branch.timesSplit/branch.family;
			if(branch.timesSplit > 3 && branchWidth < vars.initBranchWidth/3 && Math.random() < vars.pruneProbability) {
				createFlower(branch);
			}else{
				if(Math.random() < vars.splitProbability || splitsOverLife <= vars.splitToLifeRatio) {
					// if(branch.timesSplit/branch.family <= 0.1) console.log('FORCE SPLIT');
					const splitAngle = randomFloat(vars.minSplitAngle, vars.maxSplitAngle);
					const branch1 = createBranch(branch, null, -splitAngle);
					const branch2 = createBranch(branch, null, splitAngle);
					branch1.timesSplit = branch2.timesSplit = branch.timesSplit + 1;
					newOutermostBranches.push(branch1, branch2);
					branches.push(branch1, branch2);
				}else{
					const branch1 = createBranch(branch);
					newOutermostBranches.push(branch1);
					branches.push(branch1);
				}
			}
		});
		outermostBranches = newOutermostBranches;
		if(branchWidth > vars.minBranchWidth) branchWidth -= vars.branchTaper;
		if(branchHeight > vars.minBranchHeight) branchHeight -= vars.branchTrim;
	
	}else if(!addedCherries) {
		outermostBranches.forEach(branch => {
			if(Math.random() > 0.35) createFlower(branch);
		});
		addedCherries = true;
	}

	branches.forEach((branch, i) => {
		branch.rotation = branch.initRotation + Math.cos(windDelta)*windForce*(1 + i*0.01);
	});

	if(flowers.length) {
		windForce += (0.5 - windForce) / 50;
		windDelta = windDelta%(Math.PI*2);
		windDelta += (Math.PI - windDelta) / 50;
		
		flowers.forEach(flower => {
			flower.realPosition.x += flower.speed.x;
			flower.realPosition.y += flower.speed.y;
			flower.delta.x += flower.deltaSpeed.x;
			flower.delta.y += flower.deltaSpeed.y;
			flower.position.x = flower.realPosition.x + Math.cos(flower.delta.x)*flower.deltaForce.x;
			flower.position.y = flower.realPosition.y + Math.sin(flower.delta.y)*flower.deltaForce.y;
		})
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
// $(window).on('click', reinit);
$(canvas).on('click', () => {
	if(flowers.length) reinit();
	else shedFlowers();
});
