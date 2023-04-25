import {
	BoxGeometry,
	CylinderGeometry,
	Group,
	Mesh,
	MeshBasicMaterial,
	Vector3,
} from 'three';
import BrokenLineGeometry from './BrokenLineGeometry.js';

const Knob = class extends Group {

	constructor() {
		super();

		this.position.z = -0.28;

		const material = new MeshBasicMaterial( { color: 0x00ffff } );

		const l = 0.05;
		const brokenline = [
			new Vector3(  0.00*l, 0.0, -1.25*l ),
			new Vector3( -3.50*l, 0.0, -1.25*l ),
			new Vector3( -3.50*l, 0.0, +1.25*l ),
			new Vector3( -0.50*l, 0.0, +2.25*l ),
			new Vector3( +0.50*l, 0.0, +2.25*l ),
			new Vector3( +3.50*l, 0.0, +1.25*l ),
			new Vector3( +3.50*l, 0.0, -1.25*l ),
			new Vector3(  0.00*l, 0.0, -1.25*l ),
		];

		{
			const geometry = new BrokenLineGeometry( 0.005, 8 );
			for ( const node of brokenline ) {
				geometry.addNode( node );
			}
			geometry.compute();

			const mesh = new Mesh( geometry, material );
			this.add( mesh );
		}

		const delta = 7 * l / ( 10 - 1 );
		for ( let i = 1, len = 10 - 1; i < len; ++ i ) {
			const value = i * delta - 7*l/2;
			const length = this.computeLength( value, l );

			const geometry = new CylinderGeometry( 0.005, 0.005, length, 8, 1, true );
			const mesh = new Mesh( geometry, material );
			mesh.rotation.x = Math.PI/2;
			mesh.position.set( value, 0, length/2 - 1.25 * l );
			this.add( mesh );
		}
	}

	computeLength( x, l ) {

		x = Math.abs( x );

		if ( 0.0 <= x && x < 0.5*l ) {
			return 2.25 * l + 1.25 * l;
		}
		else if ( 0.5*l <= x && x <= 3.5*l ) {
			return -1/3*x + ( 2.25+0.5/3 ) * l + 1.25 * l;
		}
		else {
			return 0.0;
		}
	}
}

export default Knob;