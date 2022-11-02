import ShaderRenderer from './shader-renderer.js'; 
import loadImage from './load-image.js';
import Projections from './projections.js';
import ColorPicker from './color-picker.js';
import * as GlobalTransform from './global-transform.js';

const canvas = document.querySelector('canvas');
const wrapper = document.querySelector('.canvas-wrapper');

const LEFT_BUTTON_MASK = 1;

let canvasWidth = 800;
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
		const [ lat, lon ] = GlobalTransform.getCurrent(toCoord(x, y));
		const [ px, py ] = toNormal(lat, lon);
		return colorPicker.getPoint(px, py);
	},
});

let startClick = null;

const releaseClick = (e) => {
	if (startClick === null) return;
	const x = e.offsetX;
	const y = e.offsetY;
	const coord = GlobalTransform.getStatic(
		toCoord(...renderer.pxToVal(x, y)),
	);
	GlobalTransform.fixMotion(startClick.coord, coord);
	startClick = null;
	renderer.update();
};

canvas.addEventListener('mousedown', (e) => {
	const x = e.offsetX;
	const y = e.offsetY;
	if (!e.ctrlKey || !(e.buttons & LEFT_BUTTON_MASK)) {
		return;
	}
	const coord = GlobalTransform.getCurrent(
		toCoord(...renderer.pxToVal(x, y)),
	);
	startClick = { coord };
});

canvas.addEventListener('mousemove', (e) => {
	if (!(e.buttons & LEFT_BUTTON_MASK) || !startClick) {
		releaseClick(e);
		return;
	}
	const x = e.offsetX;
	const y = e.offsetY;
	const coord = GlobalTransform.getStatic(
		toCoord(...renderer.pxToVal(x, y)),
	);
	GlobalTransform.applyMotion(startClick.coord, coord);
	renderer.update();
});

canvas.addEventListener('mouseup', (e) => {
	if (e.buttons & LEFT_BUTTON_MASK) {
		releaseClick(e);
		return;
	}
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

const getImg = (name) => {
	return loadImage(`./img/${name}`);
};

const getColorPicker = async (name) => {
	return new ColorPicker(await getImg(name));
};

const imageFiles = `
	AE-north.jpg
	AE-south.jpg
	equirectangular.jpg
	gall-peters.jpg
	mercator.jpg
	custom
`.trim().split(/\s*\n\s*/);

const fileToImage = (file) => new Promise((done, fail) => {
	const reader = new FileReader();
	const img = document.createElement('img');
	reader.onload = () => {
		img.src = reader.result;
		done(img);
	};
	reader.readAsDataURL(file);
});

const handleImageUpdate = async () => {
	const name = select.img.value;
	if (name !== 'custom') {
		colorPicker = await getColorPicker(name);
		renderIfReady();
		return;
	}
	const input = document.createElement('input');
	input.display = 'none';
	input.setAttribute('type', 'file');
	input.setAttribute('accept', 'image/*');
	document.body.appendChild(input);
	input.onchange = async () => {
		const [ file ] = input.files;
		const img = await fileToImage(file);
		colorPicker = new ColorPicker(img);
		renderIfReady();
	};
	input.click();
	input.remove();
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
		const { id, label, toNormal, toCoord } = projection;
		const option = `<option value="${index}">${label}</option>`;
		if (toNormal) {
			select.src.innerHTML += option;
		}
		if (toCoord) {
			select.dst.innerHTML += option;
		}
	});
	document.querySelector('.buttons input').onclick = () => {
		GlobalTransform.reset();
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
	inputWidth.value = canvasWidth;
};

main().catch(console.error);
