const D45 = Math.PI/4;
const D90 = Math.PI/2;
const D180 = Math.PI;
const D360 = Math.PI*2;

const AENorth = {
	id: 'ae-north',
	label: 'AE (North)',
	ratio: 1,
	toNormal: (lat, lon) => {
		const rad = 0.25 - lat/D360;
		const nx = 0.5 + Math.sin(lon)*rad;
		const ny = 0.5 + Math.cos(lon)*rad;
		return [ nx, ny ];
	},
	toCoord: (x, y) => {
		const dx = x - 0.5;
		const dy = y - 0.5;
		const rad = Math.sqrt(dx*dx + dy*dy);
		return [
			(0.5 - rad*2)*D180,
			dx >= 0 ? Math.acos(dy/rad) : - Math.acos(dy/rad),
		];
	},
};

const Equirectangular = {
	id: 'equirectangular',
	label: 'Equirectangular',
	ratio: 2,
	toNormal: (lat, lon) => [
		lon/D360 + 0.5,
		0.5 - lat/D180,
	],
	toCoord: (x, y) => [
		(0.5 - y)*D180,
		(x - 0.5)*D360,
	],
};

const GallPeters = {
	id: 'gall-peters',
	label: 'Gall-Peters',
	ratio: Math.PI/2,
	toNormal: (lat, lon) => [
		0.5 + lon/D360,
		0.5 - Math.sin(lat)*0.5,
	],
	toCoord: (x, y) => [
		Math.asin(1 - y*2),
		(x - 0.5)*D360,
	],
};

export default [
	AENorth,
	Equirectangular,
	GallPeters,
];
