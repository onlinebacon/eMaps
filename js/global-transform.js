const {
	sin, cos, tan, asin, acos, atan,
	PI, sqrt, exp, log,
} = Math;

const toRad = (deg) => deg/180*PI;

const mulMat3Mat3 = (a, b, dst = new Array(9)) => {
	const [ aix, aiy, aiz, ajx, ajy, ajz, akx, aky, akz ] = a;
	const [ bix, biy, biz, bjx, bjy, bjz, bkx, bky, bkz ] = b;
	dst[0] = aix*bix + aiy*bjx + aiz*bkx;
	dst[1] = aix*biy + aiy*bjy + aiz*bky;
	dst[2] = aix*biz + aiy*bjz + aiz*bkz;
	dst[3] = ajx*bix + ajy*bjx + ajz*bkx;
	dst[4] = ajx*biy + ajy*bjy + ajz*bky;
	dst[5] = ajx*biz + ajy*bjz + ajz*bkz;
	dst[6] = akx*bix + aky*bjx + akz*bkx;
	dst[7] = akx*biy + aky*bjy + akz*bky;
	dst[8] = akx*biz + aky*bjz + akz*bkz;
	return dst;
};

const mulVec3Mat3 = ([ x, y, z ], m, dst = new Array(3)) => {
	const [ ix, iy, iz, jx, jy, jz, kx, ky, kz ] = m;
	dst[0] = x*ix + y*jx + z*kx;
	dst[1] = x*iy + y*jy + z*ky;
	dst[2] = x*iz + y*jz + z*kz;
	return dst;
};

const xyzToCoord = ([ x, y, z ]) => {
	const lat = asin(y);
	const rad = sqrt(x*x + z*z);
	if (rad === 0) return [ lat, 0 ];
	const temp = acos(z/rad);
	const lon = x >= 0 ? temp : -temp;
	return [ lat, lon ];
};

const coordToXYZ = ([ lat, lon ], dst = new Array(3)) => {
	const rad = cos(lat);
	dst[0] = rad*sin(lon);
	dst[1] = sin(lat);
	dst[2] = rad*cos(lon);
	return dst;
};

const buildRollMatrix = (a, b, dst = new Array(9)) => {
	const [ aLat, aLon ] = a;
	
	// Reverse A longitude
	const sinALon = sin(aLon);
	const cosALon = cos(aLon);
	let mat = [
		cosALon, 0, sinALon,
		0, 1, 0,
		-sinALon, 0, cosALon,
	];
	let inv = [
		cosALon, 0, -sinALon,
		0, 1, 0,
		sinALon, 0, cosALon,
	];

	// Reverse A latitude
	const sinALat = sin(aLat);
	const cosALat = cos(aLat);
	mulMat3Mat3(mat, [
		1, 0, 0,
		0, cosALat, sinALat,
		0, -sinALat, cosALat,
	], mat);
	mulMat3Mat3([
		1, 0, 0,
		0, cosALat, -sinALat,
		0, sinALat, cosALat,
	], inv, inv);

	// Find azimuth to B
	let [ x, y, z ] = mulVec3Mat3(coordToXYZ(b), mat);
	let rad = sqrt(x*x + y*y);
	let azm = rad === 0 ? 0 : acos(y/rad)*(x >= 0 ? 1 : -1);

	// Change B azimuth to zero
	const sinAzm = sin(azm);
	const cosAzm = cos(azm);
	mulMat3Mat3(mat, [
		cosAzm, sinAzm, 0,
		-sinAzm, cosAzm, 0,
		0, 0, 1,
	], mat);
	mulMat3Mat3([
		cosAzm, -sinAzm, 0,
		sinAzm, cosAzm, 0,
		0, 0, 1,
	], inv, inv);
	y = y*cosAzm + x*sinAzm; // x = 0, z unchanged

	// Find angular separation
	rad = sqrt(y*y + z*z);
	let ang = acos(z/rad)*(y >= 0 ? 1 : -1);
	const sinAng = sin(ang);
	const cosAng = cos(ang);

	// Build final matrix
	mulMat3Mat3(mat, [
		1, 0, 0,
		0, cosAng, -sinAng,
		0, sinAng, cosAng,
	], mat);
	mulMat3Mat3(mat, inv, dst);

    return dst;
};

const baseTransform = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
];

const currentTransform = [
	1, 0, 0,
	0, 1, 0,
	0, 0, 1,
];

const temp = [ 0, 0, 0 ];

export const getStatic = (coord) => {
	coordToXYZ(coord, temp);
	mulVec3Mat3(temp, baseTransform, temp);
    return xyzToCoord(temp);
};

export const getCurrent = (coord) => {
	coordToXYZ(coord, temp);
	mulVec3Mat3(temp, currentTransform, temp);
    return xyzToCoord(temp);
};

export const applyMotion = (a, b) => {
	buildRollMatrix(b, a, currentTransform);
	mulMat3Mat3(
		baseTransform,
		currentTransform,
		currentTransform,
	);
};

export const fixMotion = (a, b) => {
	buildRollMatrix(b, a, currentTransform);
	mulMat3Mat3(
		baseTransform,
		currentTransform,
		baseTransform,
	);
	for (let i=0; i<9; ++i) {
		currentTransform[i] = baseTransform[i];
	}
};

export const reset = () => {
	baseTransform.fill(0);
	currentTransform.fill(0);
	for (let i=0; i<3; ++i){
		baseTransform[i*4] = 1;
		currentTransform[i*4] = 1;
	}
};
