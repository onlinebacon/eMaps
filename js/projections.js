const {
	sin, cos, tan, asin, acos, atan,
	PI, sqrt, exp, log,
} = Math;

const D45 = PI/4;
const D90 = PI/2;
const D180 = PI;
const D360 = PI*2;

const AENorth = {
	label: 'Azm. Eq. (North)',
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
		if (rad > 0.5) {
			return [ NaN, NaN ];
		}
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
	toCoord: (x, y) => {
		if (x < 0 || x > 1 || y < 0 || y > 1) {
			return [ NaN, NaN ];
		}
		return [
			(0.5 - y)*D180,
			(x - 0.5)*D360,
		];
	},
};

const GallPeters = {
	label: 'Gall-Peters',
	ratio: PI/2,
	toNormal: (lat, lon) => [
		0.5 + lon/D360,
		0.5 - sin(lat)*0.5,
	],
	toCoord: (x, y) => {
		if (x < 0 || x > 1 || y < 0 || y > 1) {
			return [ NaN, NaN ];
		}
		return [
			asin(1 - y*2),
			(x - 0.5)*D360,
		];
	},
};

const AESouth = {
	label: 'Azm. Eq. (South)',
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
		if (rad > 0.5) {
			return [ NaN, NaN ];
		}
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
	toCoord: (x, y) => {
		if (x < 0 || x > 1 || y < 0 || y > 1) {
			return [ NaN, NaN ];
		}
		return [
			(atan(exp((0.5 - y)*D360)) - D45)*2,
			x*D360 - D180,
		];
	},
};

const Globe = {
	label: 'Globe (orthographic)',
	ratio: 1,
	toCoord: (x, y) => {
		const dx = (x - 0.5)*2;
		const dy = (0.5 - y)*2;
		const rad = sqrt(dx*dx + dy*dy);
		if (rad > 1) {
			return [ NaN, NaN ];
		}
		const lat = asin(dy);
		const lon = asin(dx/cos(lat));
		return [ lat, lon ];
	},
};

const calcStereographicProjectedRadius = (maxLat) => {
	return 2*cos(maxLat)/(1 + sin(maxLat));
};

const stereographicProjectedRadius = calcStereographicProjectedRadius(-D90/3);

const Stereographic = {
	label: 'Stereographic',
	ratio: 1,
	toCoord: (x, y) => {
		const nx = x*2 - 1;
		const ny = y*2 - 1;
		const rad = sqrt(nx*nx + ny*ny);
		const lon = acos(ny/rad)*(nx >= 0 ? 1 : -1);
		const r = rad*stereographicProjectedRadius;
		const mSqr = r*r/4;
		const a = 1 + mSqr;
		const b = 2*mSqr;
		const c = mSqr - 1;
		const lat = asin((sqrt(b*b - 4*a*c) - b)/(2*a));
		return [ lat, lon ];
	},
};

export default [
	AENorth,
	AESouth,
	Stereographic,
	Equirectangular,
	GallPeters,
	Mercator,
	Globe,
];
