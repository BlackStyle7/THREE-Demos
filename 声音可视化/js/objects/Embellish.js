import {
	Color,
    Group,
	Mesh,
	Vector3,
	MeshBasicMaterial,
    SphereGeometry,
} from 'three';
import BrokenLineGeometry from './BrokenLineGeometry.js';

const Embellish = class extends Group {

	constructor() {
		super();

        // 创建几何
        const l = 0.025;
		const brokenLineNodes = [
			new Vector3( +l, 0, -l ),
			new Vector3(  0, 0,  0 ),
			new Vector3( +l, 0, +l ),
		];
		const brokenLineGeometry = new BrokenLineGeometry( 0.003, 8 );
		for ( let i = 0, len = brokenLineNodes.length; i < len; ++ i ) {

			brokenLineGeometry.addNode( brokenLineNodes[ i ] );
		}
		brokenLineGeometry.compute();

        const sphereGeometry = new SphereGeometry( 0.005, 8, 8 );

        
		const material = new MeshBasicMaterial( { color: 0xdd44cc } );

		const brokenLineTransformations = [
			{ scale: new Vector3( +1, +1, +1 ), position: new Vector3( +0.25, 0, 0 ) },
			{ scale: new Vector3( -1, +1, +1 ), position: new Vector3( -0.25, 0, 0 ) },
		];
		this.brokenLines = [];
		for ( const { scale, position } of brokenLineTransformations ) {
			const brokenLine = new Mesh( brokenLineGeometry, material );
			this.brokenLines.push( brokenLine );
			this.add( brokenLine );

			brokenLine.scale.copy( scale );
			brokenLine.position.copy( position );
		}

        const pointTransformations = [
			{ scale: new Vector3( +1, +1, +1 ), position: new Vector3( +0.35, 0, +0.20 ) },
			{ scale: new Vector3( +1, +1, +1 ), position: new Vector3( -0.35, 0, +0.20 ) },
			{ scale: new Vector3( +1, +1, +1 ), position: new Vector3( +0.35, 0, -0.20 ) },
			{ scale: new Vector3( +1, +1, +1 ), position: new Vector3( -0.35, 0, -0.20 ) },
        ];
        this.points = [];
		for ( const { scale, position } of pointTransformations ) {
			const point = new Mesh( sphereGeometry, material );
			this.points.push( point );
			this.add( point );

			point.scale.copy( scale );
			point.position.copy( position );
		}
	}

	createGUI( parentGUI ) {

	}
}

export default Embellish;