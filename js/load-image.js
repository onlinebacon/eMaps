export default (src) => new Promise((done, fail) => {
	const image = document.createElement('img');
	image.onload = () => done(image);
	image.onerror = (error) => fail(error);
	image.src = src;
});
