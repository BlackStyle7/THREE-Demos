import {
	Group,
	BoxGeometry,
	MeshBasicMaterial,
	Mesh,
	TorusGeometry,
	CylinderGeometry,
	Vector3,
	Color,
} from 'three';
import BrokenLineGeometry from './BrokenLineGeometry.js';

const toRadian = Math.PI / 180;
const OuterRing = class extends Group {

	constructor() {
		super();

		this.ringParams = {
			alpha: 32 * toRadian,
		}
	
		const ringAngles = [
			{ radiusA: this.ringParams.alpha, radiusB: Math.PI - this.ringParams.alpha },
			{ radiusA: Math.PI + this.ringParams.alpha, radiusB: Math.PI*2 - this.ringParams.alpha },
		];

		const radiusA = 1.53, radiusB = 1.8;
		this.radii = [ 0, 3, 5, 7 ].map( ( interval, i ) => radiusA + ( radiusB - radiusA ) / 7 * interval );

		// const material = new MeshBasicMaterial( { color: 0xdd44cc } );
		const material = new MeshBasicMaterial(  { color: new Color( 'rgb( 194, 106, 244 )' ) } );
		for ( const { radiusA, radiusB } of ringAngles ) {

			for ( let i = 1, len = this.radii.length; i < len; ++ i ) {

				const radius = this.radii[ i ]
				const geometry = new TorusGeometry( radius, 0.005, 12, 60, radiusB - radiusA );
				const mesh = new Mesh( geometry, material );
				mesh.rotation.set( Math.PI/2, 0.0, radiusA + Math.PI/2 );
		
				this.add( mesh );
			}
		}
		const mesh = new Mesh( new TorusGeometry( this.radii[ 0 ], 0.005, 12, 100 ), material );
		mesh.rotation.set( Math.PI/2, 0.0, radiusA + Math.PI/2 );
		this.add( mesh );

		this.lines = [];
		const lineGeometry = new CylinderGeometry( 0.005, 0.005, 1, 8 );
		const r = 1.75;
		for ( const ringAngle of ringAngles ) {
			for ( const key in ringAngle ) {
				const radius = ringAngle[ key ];

				const line = new Mesh( lineGeometry, material );
				this.lines.push( line );
				line.rotation.set( Math.PI/2, 0, -radius );
				line.position.set( r*Math.sin( radius ), 0.0, r*Math.cos( radius ) );
				this.add( line );
			}
		}
	}
}

export default OuterRing;