const {
	sin, cos, tan, asin, acos, atan,
	PI, sqrt, exp, log,
} = Math;

const D45 = PI/4;
const D90 = PI/2;
const D180 = PI;
const D360 = PI*2;

const AENorth = {
	label: 'AE (North)',
	ratio: 1,
	toNormal: (lat, lon) => {
		const rad = 0.25 - lat/D360;
		const nx = 0.5 + sin(lon)*rad;
		const ny = 0.5 + cos(lon)*rad;
		return [ nx, ny ];
	},
	toCoord: (x, y) => {
		const dx = x - 0.5;
		const dy = y - 0.5;
		const rad = sqrt(dx*dx + dy*dy);
		return [
			(0.5 - rad*2)*D180,
			dx >= 0 ? acos(dy/rad) : - acos(dy/rad),
		];
	},
};

const Equirectangular = {
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
	label: 'Gall-Peters',
	ratio: PI/2,
	toNormal: (lat, lon) => [
		0.5 + lon/D360,
		0.5 - sin(lat)*0.5,
	],
	toCoord: (x, y) => [
		asin(1 - y*2),
		(x - 0.5)*D360,
	],
};

const AESouth = {
	label: 'AE (south)',
	ratio: 1,
	toNormal: (lat, lon) => {
		const rad = 0.25 + lat/D360;
		const x = 0.5 + sin(lon)*rad;
		const y = 0.5 - cos(lon)*rad;
		return [ x, y ];
	},
	toCoord: (x, y) => {
		const dx = x - 0.5;
		const dy = 0.5 - y;
		const rad = sqrt(dx*dx + dy*dy);
		const lat = rad*D360 - D90;
		const lon = dx >= 0 ? acos(dy/rad) : - acos(dy/rad);
		return [ lat, lon ];
	},
};

const Mercator = {
	label: 'Mercator',
	ratio: 1,
	toNormal: (lat, lon) => [
		0.5 + lon/D360,
		0.5 - log(tan(D45 + lat/2))/D360,
	],
	toCoord: (x, y) => [
		(atan(exp((0.5 - y)*D360)) - D45)*2,
		x*D360 - D180,
	],
};

const PeirceQuincuncial = {
	label: 'Peirce Quincuncial',
	ratio: 1,
	toNormal: (lat, lon) => {
		return [ 0, 0 ];
	},
	toCoord: (x, y) => {
		return [ 0, 0 ];
	},
};

export default [
	AENorth,
	Equirectangular,
	GallPeters,
	AESouth,
	Mercator,
	PeirceQuincuncial,
];
