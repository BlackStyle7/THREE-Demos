
import {
	Color,
    Group,
	Mesh,
	TorusGeometry,
	CapsuleGeometry,
	MeshBasicMaterial,
	CylinderGeometry,
	Vector3,
} from 'three';

const CenterAxis = class extends Group {

	constructor() {
		super();

		// 胖线
		this.fatAxis = new Mesh(
			new CapsuleGeometry( 0.01, 1, 8, 8 ),
			new MeshBasicMaterial( { color: 0x00ffff } ),
		);
		this.add( this.fatAxis );

		// 廋线
		this.thinAxisA = new Mesh(
			new CylinderGeometry( 0.006, 0.006, 0.5, 8, 1 ),
			new MeshBasicMaterial( { color: 0x00ffff } ),
		);
		this.thinAxisA.position.set( 0, 0.75, 0 );
		this.add( this.thinAxisA );
		this.thinAxisB = new Mesh(
			new CylinderGeometry( 0.006, 0.006, 0.5, 8, 1 ),
			new MeshBasicMaterial( { color: 0x00ffff } ),
		);
		this.thinAxisB.position.set( 0, -0.75, 0 );
		this.add( this.thinAxisB );

		// 线头
		this.lineCap = new Mesh(
			new CylinderGeometry( 0.006, 0.006, 0.01, 8, 1 ),
			new MeshBasicMaterial( { color: 0xff0000 } ),
		);
		this.lineCap.position.set( 0, 1.005, 0 );
		this.add( this.lineCap );

		const ringMaterial = new MeshBasicMaterial( { color: new Color( 90/255, 225/255, 190/255 ) } );
		const ringsParam = [
			{ radius: 0.04, position: new Vector3( 0, 0.0 + 0.05, 0 ) },
			{ radius: 0.03, position: new Vector3( 0, 0.1 + 0.05, 0 ) },
			{ radius: 0.02, position: new Vector3( 0, 0.2 + 0.05, 0 ) },
		];
		for ( const param of ringsParam ) {

			const ring = new Mesh( new TorusGeometry( param.radius, 0.006, 8, 13 ), ringMaterial );
			ring.rotation.x = -Math.PI / 2;
			ring.position.copy( param.position );
			this.add( ring );
		}
	}

	createGUI( parentGUI ) {

	}
}

export default CenterAxis;