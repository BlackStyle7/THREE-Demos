import {
	Group,
	Mesh,
	MeshBasicMaterial,
	TorusGeometry,
	Vector2,
	Vector3,
	Shape,
	ShapeGeometry,
	DoubleSide,
	BufferGeometry,
	BufferAttribute,
	InstancedBufferGeometry,
	MeshNormalMaterial,
	RawShaderMaterial,
	InstancedMesh,
	Matrix4,
	InstancedBufferAttribute,
	DynamicDrawUsage,
} from 'three';

const matrix = new Matrix4();
const subMatrix = new Matrix4();
const ExteriorRailings = class extends Group {

	constructor() {
		super();

		// 指定三角函数曲线，以及截点坐标切线等参水
		this.sectionsParams = {
			x: 1.291,
			A: 0.2,
			w: Math.PI,
			b: 0.269,
			f: 0,
			lNumber: 20,

			radius: 0.022,
			radiusAxisAScale: 0.737,
			radiusAxisBScale: 0.627,
			radiusPower: 2.003,
			radiusWeight: 22.836,
			cNumber: 20,
		};
		const points = this.computeSectionsPoints( this.sectionsParams );

		const scale = 0.1;
		const shape = new Shape();
		shape.moveTo( points[ 0 ].x * scale, points[ 0 ].y * scale );
		for ( let i = 1, len = points.length - 1; i < len; ++ i ) {
			shape.lineTo( points[ i ].x * scale, points[ i ].y * scale );
		}
		shape.closePath();
		const sectionsgeometry = new ShapeGeometry( shape );
		sectionsgeometry.computeBoundingBox();

		// 转换纹理坐标
		// console.log( sectionsgeometry.boundingBox );
		// for ( let i = 0, len = sectionsgeometry.attributes.position.array.length/2; i < len; ++ i ) {
		// 	sectionsgeometry.attributes.uv.array[ i*2 + 0 ] = 1
		// 	sectionsgeometry.attributes.uv.array[ i*2 + 1 ] = 1;
		// }

		// 获取顶点，纹理，索引数据
		const itemPositions = sectionsgeometry.attributes.position.array;
		const itemUvs = sectionsgeometry.attributes.uv.array;
		const itemIndices = sectionsgeometry.index.array;
		sectionsgeometry.dispose();

		const positions = [];
		const uvs = [];
		const indices = [];

		// const width = 0.007 / 2;
		const width = 0.009131256206272993 / 2;

		// 添加两头平面
		let base = positions.length / 3;
		for ( let i = 0, len = itemIndices.length; i < len; i += 3 ) {
			const index = itemIndices.slice( i, i + 3 );
			indices.push( index[ 0 ] + base, index[ 1 ] + base, index[ 2 ] + base );
		}
		for ( let i = 0, len = itemPositions.length/3; i < len; ++ i ) {

			positions.push( itemPositions[ i*3 + 0 ], itemPositions[ i*3 + 1 ], itemPositions[ i*3 + 2 ] + width );
			uvs.push( itemUvs[ i*2 + 0 ], itemUvs[ i*2 + 1 ] );
		}

		base = positions.length / 3;
		for ( let i = 0, len = itemIndices.length; i < len; i += 3 ) {
			const index = itemIndices.slice( i, i + 3 );
			indices.push( index[ 0 ] + base, index[ 2 ] + base, index[ 1 ] + base );
		}
		for ( let i = 0, len = itemPositions.length / 3; i < len; ++ i ) {
			positions.push( itemPositions[ i*3 + 0 ], itemPositions[ i*3 + 1 ], itemPositions[ i*3 + 2 ] - width );
			uvs.push( itemUvs[ i*2 + 0 ], itemUvs[ i*2 + 1 ] );
		}

		// 加一圈环形
		base = positions.length / 3;
		for ( let i = 0, len = itemPositions.length/3 - 1; i < len; ++ i ) {
			const index = [
				( i + 0 ) * 2 + 0 + base,
				( i + 0 ) * 2 + 1 + base,
				( i + 1 ) * 2 + 0 + base,
				( i + 1 ) * 2 + 1 + base,
			];
			indices.push(
				index[ 0 ], index[ 1 ], index[ 3 ],
				index[ 0 ], index[ 3 ], index[ 2 ],
			);
		}
		{
			base = positions.length / 3;
			const i = itemPositions.length/3 - 1;
			const index = [
				( i + 0 ) * 2 + 0 + base,
				( i + 0 ) * 2 + 1 + base,
				0 + base,
				1 + base,
			];
			indices.push(
				index[ 0 ], index[ 1 ], index[ 3 ],
				index[ 0 ], index[ 3 ], index[ 2 ],
			);
		}
		for ( let i = 0, len = itemPositions.length/3; i < len; ++ i ) {
			positions.push(
				itemPositions[ i*3 + 0 ], itemPositions[ i*3 + 1 ], itemPositions[ i*3 + 2 ] - width,
				itemPositions[ i*3 + 0 ], itemPositions[ i*3 + 1 ], itemPositions[ i*3 + 2 ] + width,
			);
			uvs.push(
				itemUvs[ i*2 + 0 ], itemUvs[ i*2 + 1 ],
				itemUvs[ i*2 + 0 ], itemUvs[ i*2 + 1 ],
			);
		}

		const count = 256;

		const geometry = new InstancedBufferGeometry();
		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( positions ), 3 ) );
		geometry.setAttribute( 'uv', new BufferAttribute( new Float32Array( uvs ), 2 ) );
		geometry.setAttribute( 'value', new InstancedBufferAttribute( new Float32Array( new Array( count ).fill( 0 ) ), 1 ) );
		geometry.setIndex( indices );

		geometry.computeVertexNormals();

		geometry.attributes.value.setUsage( DynamicDrawUsage );

		// const material = new MeshNormalMaterial();
		const material = new RawShaderMaterial( {
			uniforms: {

			},
			vertexShader: `#version 300 es
				precision mediump sampler2DArray;
				#define varying out
				#define texture2D texture
				precision highp float;
				precision highp int;

				#define HIGH_PRECISION
				#define SHADER_NAME MeshNormalMaterial
				#define USE_INSTANCING

				uniform mat4 modelMatrix;
				uniform mat4 modelViewMatrix;
				uniform mat4 projectionMatrix;
				uniform mat4 viewMatrix;
				uniform mat3 normalMatrix;
				uniform vec3 cameraPosition;
				uniform bool isOrthographic;

				in mat4 instanceMatrix;
				in vec3 position;
				in vec3 normal;
				in vec2 uv;
				in float value;
				
				varying vec3 vNormal;
				varying vec2 vUv;
				varying float vValue;
				void main() {
					vValue = value;
					vUv = uv;

					vec3 n = normal;
					vNormal = normalize( normalMatrix * mat3( instanceMatrix ) * n );
					
					// mat3 m = mat3( instanceMatrix );
					// n /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
					// n = m * n;
					// n = normalMatrix * n;
					// vNormal = normalize( n );

					gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4( position, 1.0 );
				}
			`,
			fragmentShader: `#version 300 es
				precision highp float;
				precision highp int;

				in vec3 vNormal;
				in vec2 vUv;
				in float vValue;
				
				out vec4 FragColor;
				void main() {
					FragColor = vec4( normalize( vNormal ) * 0.5 + 0.5, 1.0 );

					float valueA = 0.5;
					float valueB = 1.0;
					float value = mix( valueA, valueB, vValue );

					FragColor.rgb *= value;
					
					// FragColor = vec4( vec3( vUv.y * 100.0 ), 1.0 );
				}
			`,
		} );

		const mesh = new InstancedMesh( geometry, material, count );

		const r = 0.88;
		for ( let i = 0, len = count; i < len; ++ i ) {

			const angle = i / len * Math.PI*2;
			const x = r * Math.cos( angle );
			const z = r * Math.sin( angle );

			matrix.identity();
			matrix.multiply( subMatrix.makeRotationY( Math.PI ) );
			matrix.multiply( subMatrix.makeTranslation( x, 0, z ) );
			matrix.multiply( subMatrix.makeRotationY( -angle ) );

			mesh.setMatrixAt( i, matrix );
		}

		this.add( mesh );
	}
	
	update( frameData, clock ) {
		for ( let i = 0, len = frameData.length/2; i < len; ++ i ) {

			this.children[0].geometry.attributes.value.array[ i ] = frameData[ i*2 + 0 ] / 255;
		}
		this.children[0].geometry.attributes.value.needsUpdate = true;
		// thi.s
	}

	// 主函数
	mainFunction( x = 0, params = {} ) {
		return params.A * Math.cos( params.w * x + params.f ) + params.b;
	}

	// 主函数导数
	mainDerivatives( x = 0, params = {} ) {
		return -params.A * params.w * Math.sin( params.w * x + params.f );
	}

	computeCirParams( x, y, k, params = {} ) {
		
		const {
			radius,
			radiusAxisAScale,
			radiusAxisBScale,
		} = params;

		const p = new Vector2( x, y );
		const v = new Vector2( 1, k ); v.normalize();
		const n = new Vector2( v.y, -v.x ); n.normalize();

		const radiusA = new Vector2().copy( v ); radiusA.multiplyScalar( +radiusAxisAScale * radius );
		const radiusB = new Vector2().copy( n ); radiusB.multiplyScalar( -radiusAxisBScale * radius );
		
		const center = new Vector2().copy( radiusB );
		center.multiplyScalar( -1 );
		center.add( p );

		return { radiusA, radiusB, center }
	}

	// 计算横截面节点
	computeSectionsPoints( option = {} ) {
		
		const {
			x,  // 主函数节点
			A,  // 主函数振幅
			w,  // 主函
			f,
			b,  // 主函数上下偏移
			lNumber,
			radius,  // 接头圆半径
			radiusAxisAScale,  // 接头圆切线方向缩放
			radiusAxisBScale,  // 接头圆垂线方向缩放
			radiusPower,  // 接头圆半径扩散指数
			radiusWeight,  // 接头圆半径扩散系数
			cNumber,
		} = option;

		const points = [];  // 存储中间点

		// 插值主函数
		const lPoints = [];
		for ( let i = 0, len = lNumber; i < len; ++ i ) {
			const point = new Vector3();

			point.x = 0 + i * x/(len-1);
			point.y = this.mainFunction( point.x, { A, w, f, b } );

			lPoints.push( point );
		}

		// 根据主函数计算接头的圆
		const { radiusA, radiusB, center } = this.computeCirParams(
			x,
			this.mainFunction( x, { A, w, f, b } ),
			this.mainDerivatives( x, { A, w, f, b } ),
			{ radius, radiusAxisAScale, radiusAxisBScale },
		);

		const radiusOffset = angle => {
			const x = angle / ( Math.PI*2 );
			return radiusWeight * x ** radiusPower + 1;
		}

		const cPoints = [];
		const vecA = new Vector2(), vecB = new Vector2(), vec = new Vector2();
		for ( let i = 0, len = cNumber; i < len; ++ i ) {

			const angle = 0 + i * (2*Math.PI)/(len-1);

			vecA.copy( radiusA ); vecA.multiplyScalar( Math.sin( angle ) );
			vecB.copy( radiusB ); vecB.multiplyScalar( Math.cos( angle ) );
			vec.copy( vecA ); vec.add( vecB );
			vec.multiplyScalar( radiusOffset( angle ) );
			vec.add( center );

			if ( vec.y > 0 ) {
				const point = new Vector3( vec.x, vec.y, 0 );
				cPoints.push( point );
			} else {

				const s = new Vector2( cPoints[ cPoints.length-1 ].x, cPoints[ cPoints.length-1 ].y );
				const e = vec;
				
				const point = new Vector3( (s.x-e.x)*s.y/(e.y-s.y) + s.x, 0, 0 );
				cPoints.push( point );
				
				break;
			}

		}

		// 添加各个顶点, 拼成一圈
		let target = undefined;

		target = [ ...lPoints ]; target.pop();
		for ( let i = 0, len = target.length; i < len; ++ i ) {
			const point = new Vector3().copy( target[ i ] );
			point.x *= +1; point.y *= +1; point.z *= +1;
			points.push( point );
		}
		
		target = [ ...cPoints ]; target.pop();
		for ( let i = 0, len = target.length; i < len; ++ i ) {
			const point = new Vector3().copy( target[ i ] );
			point.x *= +1; point.y *= +1; point.z *= +1;
			points.push( point );
		}
		
		target = [ ...cPoints ]; target.reverse(); target.pop();
		for ( let i = 0, len = target.length; i < len; ++ i ) {
			const point = new Vector3().copy( target[ i ] );
			point.x *= +1; point.y *= -1; point.z *= +1;
			points.push( point );
		}
		
		target = [ ...lPoints ]; target.reverse(); target.pop();
		for ( let i = 0, len = target.length; i < len; ++ i ) {
			const point = new Vector3().copy( target[ i ] );
			point.x *= +1; point.y *= -1; point.z *= +1;
			points.push( point );
		}
		
		target = [ ...lPoints ]; target.pop();
		for ( let i = 0, len = target.length; i < len; ++ i ) {
			const point = new Vector3().copy( target[ i ] );
			point.x *= -1; point.y *= -1; point.z *= +1;
			points.push( point );
		}
		
		target = [ ...cPoints ]; target.pop();
		for ( let i = 0, len = target.length; i < len; ++ i ) {
			const point = new Vector3().copy( target[ i ] );
			point.x *= -1; point.y *= -1; point.z *= +1;
			points.push( point );
		}
		
		target = [ ...cPoints ]; target.reverse(); target.pop();
		for ( let i = 0, len = target.length; i < len; ++ i ) {
			const point = new Vector3().copy( target[ i ] );
			point.x *= -1; point.y *= +1; point.z *= +1;
			points.push( point );
		}
		
		target = [ ...lPoints ]; target.reverse(); target.pop();
		for ( let i = 0, len = target.length; i < len; ++ i ) {
			const point = new Vector3().copy( target[ i ] );
			point.x *= -1; point.y *= +1; point.z *= +1;
			points.push( point );
		}

		points.push( points[ 0 ] );

		return points;
	}

	draw = ( points ) => {
		const { canvas, cxt } = this;
		const { width, height, scale } = canvas;
		cxt.clearRect( 0, 0, width, height );
	
		cxt.save();
		cxt.translate( canvas.width/2, canvas.height/2 );
		cxt.scale( +1, -1 );

		cxt.strokeStyle = 'red';
		cxt.fillStyle = 'red';
		cxt.lineWidth = 1;
		
		cxt.beginPath();
		cxt.moveTo( points[ 0 ].x * scale, points[ 0 ].y * scale );
		for ( let i = 0, len = points.length; i < len; ++ i ) {
			cxt.lineTo( points[ i ].x * scale, points[ i ].y * scale );
		}
		cxt.stroke();


		this.cxt.restore();

	}

	// createGUI( parentGUI ) {

	// 	this.gui = parentGUI.addFolder( 'Center ring section' );
	// 	this.gui.open();
	// 	this.gui.add( this.canvas, 'scale', 100, 300, 1 ).onChange( this.draw );
	// 	this.gui.add( this, 'x', 1.0, 2.0, 0.001 ).onChange( this.draw );
	// 	this.gui.add( this, 'A', 0.0, 1.0, 0.001 ).onChange( this.draw );
	// 	this.gui.add( this, 'T', 0.0, 2.0*Math.PI, 0.001 ).onChange( this.draw );
	// 	this.gui.add( this, 'height', 0.0, 1.0, 0.001 ).onChange( this.draw );
	// 	this.gui.add( this, 'radius', 0.001, 0.050, 0.001 ).onChange( this.draw );
	// 	this.gui.add( this, 'radiusAxisAScale', 0.0, 2.0, 0.001 ).onChange( this.draw );
	// 	this.gui.add( this, 'radiusAxisBScale', 0.0, 2.0, 0.001 ).onChange( this.draw );
	// 	this.gui.add( this, 'radiusPower', 0.0, 4.0, 0.001 ).onChange( this.draw );
	// 	this.gui.add( this, 'radiusWeight', 1.0, 50.0, 0.001 ).onChange( this.draw );
	// }
}

export default ExteriorRailings;