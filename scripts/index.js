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
const renderer = PIXI.autoDetectRenderer(
	getScreenWidth()/getPixelDensity(), 
	getScreenHeight()/getPixelDensity(), 
	{
		resolution: getPixelDensity(),
		transparent: false,
		backgroundColor: 0x333333,
		antialiasing: true,
	}
);
const canvas = renderer.view;
$app.append(canvas);


const stageWrapper = new Container();

function init() {
	console.log('Hello world');
	console.log($app);

	stageWrapper.addChild(createTriangle());

	animate();
}


function createTriangle(opts = {}) {
	const { color = 0xCCCCCC, angle = 45, startPos = {x: 50, y: 50}, distance = 50 } = opts;

	const triangle = new Graphics();
	triangle.lineStyle(1, 0xFFFFFF, 1);
	triangle.beginFill(color);
	triangle.moveTo(0,0);
	triangle.lineTo(distance/2, distance/2);
	triangle.lineTo(distance, 0);
	triangle.lineTo(0,0);
	triangle.endFill();
	triangle.position = startPos;
	triangle.pivot.set(0,0);
	triangle.rotation = angle/180*Math.PI;
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