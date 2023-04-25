import {
	Group,
	Mesh,
	MeshBasicMaterial,
	Vector3,
} from 'three';
import BrokenLineGeometry from './BrokenLineGeometry.js';

const InnerRing = class extends Group {

	constructor() {
		super();
		
		const radius = 0.44;
		const lineNumber = 3;
		const offsetAngle = 36 * Math.PI / 180;
		const nodeNumber = 10;
		const lineAngle = 2 * Math.PI / 6;

		const brokenLineGeometry = new BrokenLineGeometry( 0.006, 8 );
		const deltaAngle = lineAngle / ( nodeNumber - 1 );
		for ( let i = 0; i < nodeNumber; ++ i ) {
			const angle = deltaAngle * i - lineAngle / 2;

			const x = radius * Math.cos( angle );
			const z = radius * Math.sin( angle );

			brokenLineGeometry.addNode( new Vector3( x, 0, z ) );
		}
		brokenLineGeometry.compute();

		const material = new MeshBasicMaterial( { color: 0xffffff } );

		this.rings = [];
		for ( let i = 0; i < lineNumber; ++ i ) {
			const ring = new Mesh( brokenLineGeometry, material );
			this.rings.push( ring );
			this.add( ring );

			const angle = i / lineNumber * Math.PI*2 + offsetAngle;
			ring.rotation.y = angle;
		}

		this.speed = 10 * Math.PI / 180;
	}

	update( frameData, clock ) {
		this.rotation.y = ( this.rotation.y + clock.frameTime * this.speed ) % ( Math.PI * 2 );

	}
}

export default InnerRing;