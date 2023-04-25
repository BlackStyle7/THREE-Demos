import {
	BufferAttribute,
	BufferGeometry,
	Group,
	MeshBasicMaterial,
	Mesh,
	Vector3,
	DoubleSide,
	MeshNormalMaterial,
	DynamicDrawUsage,
	Color,
} from 'three';

const vec = new Vector3();
const VertexCurtain = class extends Group {

	constructor() {
		super();

		const vertices = [];
		const uvs = [];
		const indices = [];

		this.computeVertexData( vertices, uvs, indices );

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );
		geometry.setAttribute( 'uvs', new BufferAttribute( new Float32Array( uvs ), 2 ) );
		geometry.setIndex( indices );
		geometry.computeVertexNormals();

		geometry.attributes.position.setUsage( DynamicDrawUsage );

		const material = new MeshBasicMaterial( {
			color: new Color( 'rgb( 184, 96, 234 )' ),
			side: DoubleSide,
			transparent: true,
			opacity: 0.6,
		} );

		this.curtain = new Mesh( geometry, material );
		this.curtain.rotation.y = 0.5208;
		this.add( this.curtain );
	}

	computeVertexData( vertices, uvs, indices ) {

		const count = 512 * 3;
		const index = [ 0, 0, 0, 0 ];
		let base = vertices.length / 3;
		for ( let i = 0, len = count - 1; i < len; ++ i ) {
			index.splice(
				0, 4,
				( i + 0 ) * 2 + 1 + base,
				( i + 1 ) * 2 + 1 + base,
				( i + 1 ) * 2 + 0 + base,
				( i + 0 ) * 2 + 0 + base,
			);

			indices.push(
				index[0],  index[1],  index[2],
				index[0],  index[2],  index[3],
			);
		}

		const radius = 0.60 * 0.975;
		for ( let i = 0, len = count; i < len; ++ i ) {
			
			const angle = Math.PI*2.0 * i / ( len - 1 )
			vec.set( radius * Math.cos( angle ), 0.0, radius * Math.sin( angle ) );
			vertices.push(
				vec.x, 0.0, vec.z,
				vec.x, 0.0, vec.z,
			);
		}
	}

	update( frameData ) {

		const { position } = this.curtain.geometry.attributes;
		for ( let i = 0, len = frameData.length; i < len; ++ i ) {

			const value = frameData[ i ] / 255 * 0.3;
			position.array[ i*6 + 512*6*0 + 4 ] = value;
			position.array[ i*6 + 512*6*1 + 4 ] = value;
			position.array[ i*6 + 512*6*2 + 4 ] = value;
		}
		position.needsUpdate = true;
	}

	createGUI( parentGUI ) {

		this.gui = parentGUI.addFolder( 'Vertex Curtain' );
		// this.gui.open();
		this.gui.add( this.curtain.scale, 'x', 0.0, 1.0 ).onChange( value => { this.curtain.scale.z = value } ).name( 'radius' );
		this.gui.add( this.curtain.rotation, 'y', 0.4, 1.0 ).name( 'rotation' );
	}
}

export default VertexCurtain;