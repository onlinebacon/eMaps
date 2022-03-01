import ShaderRenderer from './shader-renderer.js'; 
import loadImage from './load-image.js';
import Projections from './projections.js';
import ColorPicker from './color-picker.js';

const canvas = document.querySelector('canvas');
const wrapper = document.querySelector('.canvas-wrapper');

const select = {
	img: document.querySelector('#image_source'),
	srcMap: document.querySelector('#source_mapping'),
	dstMap: document.querySelector('#target_mapping'),
};

const images = `
	AE-north.jpg
	equirectangular.jpg
	gall-peters.jpg
`.trim().split(/\s*\n\s*/).map(
	name => ({
		name, img: null,
		colorPicker: null,
	}),
);

let colorPicker;
let toNormal;
let toCoord;
let renderer;

const retrieveImage = async (obj, index) => {
	const { name } = obj;
	const img = await loadImage(`./img/${name}`);
	select.img.innerHTML += `<option value="${index}">${name}</option>`;
	obj.img = img;
	obj.colorPicker = new ColorPicker(img);
};

const handleImgUpdate = () => {
	const item = images[select.img.value];
	colorPicker = item.colorPicker;
	if (renderer) renderer.update();
};

const handleSrcUpdate = () => {
	const projection = Projections[select.srcMap.value];
	toNormal = projection.toNormal;
	if (renderer) renderer.update();
};

const handleDstUpdate = () => {
	const projection = Projections[select.dstMap.value];
	toCoord = projection.toCoord;
	canvas.height = Math.round(canvas.width/projection.ratio);
	wrapper.style.height = canvas.height + 'px';
	wrapper.style.width = canvas.width + 'px';
	if (renderer) renderer.update();
};

const sortImages = () => {
	const options = [ ...select.img.children ];
	options.sort((a, b) => a.getAttribute('index') - b.getAttribute('index'));
	select.img.innerHTML = options.map(option => option.outerHTML).join('');
};

const main = async() => {
	Projections.forEach((projection, index) => {
		const { id, label } = projection;
		const option = `<option value="${index}">${label}</option>`;
		select.srcMap.innerHTML += option;
		select.dstMap.innerHTML += option;
	});
	await Promise.all(images.map(retrieveImage));
	sortImages();
	canvas.width = 512;
	canvas.height = 512;
	handleImgUpdate();
	handleSrcUpdate();
	handleDstUpdate();
	renderer = new ShaderRenderer({
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
	renderer.update();
	document.querySelector('#image_source').oninput = handleImgUpdate;
	document.querySelector('#source_mapping').oninput = handleSrcUpdate;
	document.querySelector('#target_mapping').oninput = handleDstUpdate;
	document.querySelector('.buttons input').onclick = () => {
		renderer.reset();
	};
};

main().catch(console.error);
