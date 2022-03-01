export default class ColorPicker {
	constructor(img) {
		const { width, height } = img;
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);
		const imageData = ctx.getImageData(0, 0, width, height);
		const { data } = imageData;
		const colors = new Array(width*height);
		for (let y=0; y<height; ++y) {
			for (let x=0; x<width; ++x) {
				const index = y*width + x;
				const i = index*4;
				const r = data[i + 0];
				const g = data[i + 1];
				const b = data[i + 2];
				colors[index] = `rgb(${r}, ${g}, ${b})`;
			}
		}
		this.width = width;
		this.height = height;
		this.colors = colors;
	}
	getPoint(nx, ny) {
		const { width, height, colors } = this;
		const x = nx*width|0;
		const y = ny*height|0;
		if (x < 0 || x >= width || y < 0 || y >= height) {
			return '#777';
		}
		return colors[y*width + x];
	}
}
