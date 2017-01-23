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
const randomInt = (min, max) => min + Math.floor(Math.random()*(max-min));
const getRandomValueFromArray = array => array[Math.floor(Math.random()*array.length)];

function init() {
	console.log('Hello world');
	console.log($app);

	let palette = getRandomValueFromArray(palettes);
	const backgroundColor = getRandomValueFromArray(palette);
	renderer.backgroundColor = backgroundColor;
	palette = palette.filter(val => val != backgroundColor);

	const rows = 50;
	const cols = 36;
	const paddingY = 200;

	const rowHeight = (getScreenHeight() + paddingY*2) / rows;

	const baseAngle = 20;

	for(let n=0; n < rows; n ++) {

		const startPos = {x: -20, y: -paddingY + rowHeight*n};
		const angleRange = randomInt(-20, 20);
		let theta = Math.random()*Math.PI;

		for(let i=0; i<cols; i ++) {
			theta += 0.5;
			const color = getRandomValueFromArray(palette);
			const angle = baseAngle + Math.cos(theta)*angleRange;
			const distance = randomInt(10, 30);
			const triangle = createTriangle({startPos, distance, angle, color});
			triangle.scale.y = (Math.random() > 0.5 ? -1 : 1) * randomFloat(0.5, 1);
			stageWrapper.addChild(triangle);

			startPos.x = startPos.x + Math.cos(degToRad(angle))*distance;
			startPos.y = startPos.y + Math.sin(degToRad(angle))*distance;
		}

	}

	animate();
}


function createTriangle(opts = {}) {
	const { color = 0xCCCCCC, angle = 45, startPos = {x: 50, y: 50}, distance = 50 } = opts;

	const triangle = new Graphics();
	triangle.lineStyle(0, 0xFFFFFF, 1);
	triangle.beginFill(color);
	triangle.moveTo(0,0);
	triangle.lineTo(distance/2, distance/2);
	triangle.lineTo(distance, 0);
	triangle.lineTo(0,0);
	triangle.endFill();
	triangle.position = startPos;
	triangle.pivot.set(0,0);
	triangle.rotation = angle/180*Math.PI;
	triangle.cacheAsBitmap = true;
	return triangle;
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