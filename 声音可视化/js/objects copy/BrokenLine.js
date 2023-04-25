import {
	Color,
    Group,
	Mesh,
	Vector3,
	RawShaderMaterial,
} from 'three';
import BrokenLineGeometry from './BrokenLineGeometry.js';

const BrokenLine = class extends Group {

	constructor() {
		super();

		const x = 0.3;
		const d = 0.1;
		const brokenLineNodes = [
			new Vector3( -x * 3/2, 0.000, +x * 3**0.5 + d ),
			new Vector3( -x * 1/2, 0.005,           0 + d ),
			new Vector3( +x * 1/2, 0.005,           0 + d ),
			new Vector3( +x * 3/2, 0.000, +x * 3**0.5 + d ),
		];
		const brokenLineGeometry = new BrokenLineGeometry( 0.003, 8 );
		const brokenLineMaterial = new RawShaderMaterial( {
			uniforms: {
				color: { value: new Color( 0x00ffff ) },
			},
			vertexShader: `#version 300 es

				in vec3 position;
				in vec3 normal;
				in vec2 uv;

				uniform mat4 projectionMatrix;
				uniform mat4 modelViewMatrix;

				out vec2 vUv;
				out vec4 fragColor;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
			`,
			fragmentShader: `#version 300 es
				precision mediump float;
				in vec2 vUv;
				uniform vec3 color;
				out vec4 fragColor;
				void main() {
					// vec2 uv = vUv;

					// float value = ( uv.x - 0.5 ) * 2.0;
					// value = abs( pow( value, 1.0 ) );
					fragColor = vec4( color, 1.0 );
					// fragColor = vec4( value, 0.0, 0.0, 1.0 );
				}
			`,
		} );
		for ( let i = 0, len = brokenLineNodes.length; i < len; ++ i ) {

			brokenLineGeometry.addNode( brokenLineNodes[ i ] );
		}
		brokenLineGeometry.compute();

		const transformations = [
			{ scale: new Vector3( +1, +1, +1 ), position: new Vector3( 0, +0.015, 0 ) },
			{ scale: new Vector3( +1, -1, +1 ), position: new Vector3( 0, -0.015, 0 ) },
			{ scale: new Vector3( -1, -1, -1 ), position: new Vector3( 0, -0.015, 0 ) },
			{ scale: new Vector3( -1, +1, -1 ), position: new Vector3( 0, +0.015, 0 ) },
		];
		this.brokenLines = [];
		for ( const { scale, position } of transformations ) {
			const brokenLine = new Mesh( brokenLineGeometry, brokenLineMaterial );
			this.brokenLines.push( brokenLine );
			this.add( brokenLine );

			brokenLine.scale.copy( scale );
			brokenLine.position.copy( position );
		}
	}

	createGUI( parentGUI ) {

	}
}

export default BrokenLine;