import ShaderRenderer from './shader-renderer.js'; 
import loadImage from './load-image.js';
import Projections from './projections.js';
import ColorPicker from './color-picker.js';

const canvas = document.querySelector('canvas');
const wrapper = document.querySelector('.canvas-wrapper');

let canvasWidth = 512;
let currentRatio;
const updateRatio = (ratio) => {
	currentRatio = ratio;
	const width = canvasWidth;
	const height = Math.round(width/ratio);
	canvas.width = width;
	canvas.height = height;
	wrapper.style.width = width + 'px';
	wrapper.style.height = height + 'px';
};

let colorPicker;
let toNormal;
let toCoord;

const renderer = new ShaderRenderer({
	canvas,
	box: [0, 1, 1, 0],
	shader: (ax, ay, bx, by) => {
		const x = (ax + bx)*0.5;
		const y = (ay + by)*0.5;
		const [ lat, lon ] = toCoord(x, y);
		const [ px, py ] = toNormal(lat, lon);
		return colorPicker.getPoint(px, py);
	},
});

const renderIfReady = () => {
	if (colorPicker == null) return;
	if (toNormal == null) return;
	if (toCoord == null) return;
	renderer.update();
};

const select = {
	img: document.querySelector('#image_source'),
	src: document.querySelector('#source_mapping'),
	dst: document.querySelector('#target_mapping'),
};

const colorPickerMap = {};
const getColorPicker = async (name) => {
	let colorPicker = colorPickerMap[name];
	if (colorPicker !== undefined) {
		return colorPicker;
	}
	const img = await loadImage(`./img/${name}`);
	colorPicker = new ColorPicker(img);
	colorPickerMap[name] = colorPicker;
	return colorPicker;
};

const imageFiles = `
	AE-north.jpg
	equirectangular.jpg
	gall-peters.jpg
`.trim().split(/\s*\n\s*/);

const retrieveImage = async (obj, index) => {
	const { name } = obj;
	const img = await loadImage(`./img/${name}`);
	select.img.innerHTML += `<option value="${index}">${name}</option>`;
	obj.img = img;
	obj.colorPicker = new ColorPicker(img);
};

const handleImageUpdate = async () => {
	const name = select.img.value;
	colorPicker = await getColorPicker(name);
	renderIfReady();
};

const handleSrcUpdate = () => {
	const index = select.src.value*1;
	toNormal = Projections[index].toNormal;
	renderIfReady();
};

const handleDstUpdate = () => {
	const index = select.dst.value*1;
	const projection = Projections[index];
	toCoord = projection.toCoord;
	updateRatio(projection.ratio);
	renderIfReady();
};

const main = async() => {
	updateRatio(1);
	imageFiles.forEach(name => {
		select.img.innerHTML += `<option value="${name}">${name}</option>`;
	});
	Projections.forEach((projection, index) => {
		const { id, label } = projection;
		const option = `<option value="${index}">${label}</option>`;
		select.src.innerHTML += option;
		select.dst.innerHTML += option;
	});
	document.querySelector('.buttons input').onclick = () => {
		renderer.reset();
	};
	handleImageUpdate();
	handleSrcUpdate();
	handleDstUpdate();
	select.img.oninput = handleImageUpdate;
	select.src.oninput = handleSrcUpdate;
	select.dst.oninput = handleDstUpdate;
	const inputWidth = document.querySelector('#canvas_width');
	inputWidth.onchange = () => {
		const { value } = inputWidth;
		if (!/^\d+$/.test(value)) return;
		canvasWidth = Number(value);
		updateRatio(currentRatio);
		renderIfReady();
	};
};

main().catch(console.error);
