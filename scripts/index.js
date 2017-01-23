import { autoDetectRenderer, Container, Graphics } from 'pixi.js'
import $ from 'jquery'
import palettes from './palettes'
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
		backgroundColor: 0x333333,
		antialias: true,
	}
);
const canvas = renderer.view;
$app.append(canvas);


const stageWrapper = new Container();

const radToDeg = rad => rad*180/Math.PI;
const degToRad = deg => deg/180*Math.PI;
const randomFloat = (min, max) => min + Math.random()*(max-min);
const randomInt = (min, max) => min + Math.round(Math.random()*(max-min));
const getRandomValueFromArray = array => array[Math.floor(Math.random()*array.length)];

const groups = [];

function init() {
	console.log('Hello world');
	console.log($app);

	let palette = getRandomValueFromArray(palettes);
	const backgroundColor = getRandomValueFromArray(palette);
	renderer.backgroundColor = backgroundColor;
	palette = palette.filter(val => val != backgroundColor);

	const rows = 100;
	const cols = 45;
	const paddingY = 300;

	const rowHeight = (getScreenHeight() + paddingY*2) / rows;

	const baseAngle = 20;

	const minDist = 5;
	const maxDist = 50;
	const maxDistAmount = maxDist - minDist;

	for(let n=0; n < rows; n ++) {

		const startPos = {x: -120, y: -paddingY + rowHeight*n};
		const angleRange = randomInt(5, 40);
		const startTheta = Math.random()*Math.PI;
		const thetaIncrement = 0.5;

		const group = {
			baseAngle,
			startPos,
			angleRange,
			startTheta,
			thetaIncrement,
			triangles: [],
		};

		let theta = startTheta;
		let prevTriangle = null;
		let position = {x: startPos.x, y: startPos.y};

		for(let i=0; i<cols; i ++) {
			theta += thetaIncrement;
			const color = getRandomValueFromArray(palette);
			const angle = baseAngle + Math.cos(theta)*angleRange;
			const distance = randomInt(minDist, maxDist);
			let scaleY = (Math.random() > 0.5 ? -1 : 1) * randomFloat(0.5, 2);
			scaleY *= (maxDistAmount-(distance-minDist))/maxDistAmount;
			const triangle = createTriangle({position, distance, angle, color, scaleY});
			triangle.prevTriangle = prevTriangle;
			prevTriangle = triangle;
			stageWrapper.addChild(triangle);
			group.triangles.push(triangle);

			position.x += Math.cos(degToRad(angle))*distance;
			position.y += Math.sin(degToRad(angle))*distance;
		}

		groups.push(group);

	}

	$app.on('click', () => randomiseColors());

	animate();
}


function createTriangle(opts = {}) {
	const { color = 0xCCCCCC, angle = 45, position = {x: 50, y: 50}, distance = 50, scaleY = 1, scaleX = 1 } = opts;

	const triangle = new Graphics();
	triangle.angle = angle;
	triangle.distance = distance;
	

	if(distance < 12) {
		drawCircle(triangle, color, distance);
	}else{
		drawTriangle(triangle, color, distance);
		triangle.scale.set(scaleX, scaleY)
	}
	
	

	triangle.position = position;
	triangle.pivot.set(0,0);
	triangle.rotation = angle/180*Math.PI;
	triangle.cacheAsBitmap = true;
	return triangle;
}

function drawCircle(triangle, color, distance) {
	triangle.lineStyle(0, 0xFFFFFF, 1);
	triangle.beginFill(color);
	triangle.drawCircle(distance/2, 0, distance/2);
	triangle.endFill();
}

function drawTriangle(triangle, color, distance) {
	triangle.lineStyle(0, 0xFFFFFF, 1);
	triangle.beginFill(color);
	triangle.moveTo(0,0);
	triangle.lineTo(distance/2, distance/2);
	triangle.lineTo(distance, 0);
	triangle.lineTo(0,0);	
	triangle.endFill();
}

function randomiseColors() {
	let palette = getRandomValueFromArray(palettes);
	const backgroundColor = getRandomValueFromArray(palette);
	renderer.backgroundColor = backgroundColor;
	palette = palette.filter(val => val != backgroundColor);

	for(let group of groups) {
		for(let triangle of group.triangles) {
			const color = getRandomValueFromArray(palette);
			triangle.cacheAsBitmap = false;
			triangle.clear();
			if(triangle.distance < 12) {
				drawCircle(triangle, color, triangle.distance);
			}else{
				drawTriangle(triangle, color, triangle.distance);
			}
			triangle.cacheAsBitmap = true;
		}
	}
}

function animate() {

	for(let group of groups) {
		const { triangles, thetaIncrement, baseAngle, angleRange } = group;
		group.startTheta += 0.02;
		let theta = group.startTheta;
		for(let triangle of triangles) {
			const { prevTriangle } = triangle;
			theta += group.thetaIncrement;
			if(!triangle.prevTriangle) {
				triangle.position = group.startPos;
			}else{
				const angle = baseAngle + Math.cos(theta)*angleRange;
				triangle.position.x = prevTriangle.position.x + Math.cos(prevTriangle.rotation)*prevTriangle.distance;
				triangle.position.y = prevTriangle.position.y + Math.sin(prevTriangle.rotation)*prevTriangle.distance;
				triangle.rotation = degToRad(angle);
			}
		}
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