import {
	Group,
	BoxGeometry,
	MeshBasicMaterial,
	Mesh,
	TorusGeometry,
	CylinderGeometry,
	Vector3,
	Color,
	Matrix4,
	RawShaderMaterial,
	MeshNormalMaterial,
} from 'three';
import BrokenLineGeometry from './BrokenLineGeometry.js';

const vec = new Vector3();
const subVec = new Vector3();
const matrix = new Matrix4();
const subMatrix = new Matrix4();
const toRadian = Math.PI / 180;
const ExternalLine = class extends Group {

	constructor() {
		super();

		this.position.set( 0.0, -0.1, 0.0 );

		// 计算上半部分圆圈的环形节点和插值坐标
		this.circRingLayout = this.computeCircRingLayout();
		this.lineRingLayout = this.computeLineRingLayout();

		this.materials = [
			new MeshBasicMaterial(  { color: new Color( 'rgb( 194, 106, 244 )' ) } ),
			new RawShaderMaterial( {
				transparent: true,
				uniforms: {
					color: { value: new Color( 'rgb( 194, 106, 244 )' ) },
					weight: { value: 1.1107 },
					opacity: { value: 0.6129 },
				},
				vertexShader: `#version 300 es
				precision highp float;
				precision highp int;
	
				uniform mat4 modelViewMatrix;
				uniform mat4 projectionMatrix;
				uniform mat3 normalMatrix;
				uniform mat4 modelMatrix;
	
				in vec3 position;
				in vec3 normal;
				in vec2 uv;
				
				out vec3 vPositionWC;
				out vec3 vCenter;
				out vec3 vNormal;
				out vec2 vUv;
				void main() {
					vUv = uv;
	
					vec3 n = normal;
					vNormal = normalize( normalMatrix * n );
					vCenter = vec3( modelMatrix * vec4( 0.0, 0.0, 0.0, 1.0 ) );
	
					vec4 coordinated = vec4( position, 1.0 );
					vec4 positionWC = modelMatrix * coordinated;
					vPositionWC = positionWC.xyz;

					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
				`,
				fragmentShader: `#version 300 es
					precision highp float;
					precision highp int;

					const float PI = acos( 0.0 ) * 2.0;
					const float PI2 = PI * 2.0;
	
					in vec3 vPositionWC;
					in vec3 vCenter;
					in vec3 vNormal;
					in vec2 vUv;

					uniform vec3 color;
					uniform float weight;
					uniform float opacity;
					
					out vec4 FragColor;
					void main() {

						vec3 v = normalize( vPositionWC - vCenter * 1.0 );

						// 求当前片元相对于坐标圆点的角度
						float angle = mod( ( atan( v.z, v.x ) + PI2 ), PI2 );
						float alpha = angle / PI2;  // 归算到 [ 0, 1 ] 便于后续处理

						alpha = fract( alpha * 4.0 );  // 分段
						alpha = alpha * 2.0 - 1.0;  // 映射到 [ -1, +1 ]
						alpha = pow( abs( alpha ), weight );
						alpha = 0.5 * cos( PI * alpha ) + 0.5;

						// FragColor = vec4( normalize( vNormal ) * 0.5 + 0.5, alpha * opacity );
						FragColor = vec4( color, alpha * opacity );
					}
				`,
			} ),
		];

		// 构造中心部分圆环参数
		const circRingAngle = 25 * toRadian;
		const circRingAngles = [
			{ angle: circRingAngle + Math.PI/2*1, delta: Math.PI-circRingAngle*2 },
			{ angle: circRingAngle + Math.PI/2*3, delta: Math.PI-circRingAngle*2 },
		];

		// 构建外部圆环参数
		const lineRingAngle = 32 * toRadian;
		const lineRingAngles = [
			{ angle: lineRingAngle + Math.PI/2*1, delta: Math.PI-lineRingAngle*2 },
			{ angle: lineRingAngle + Math.PI/2*3, delta: Math.PI-lineRingAngle*2 },
		];
		
		// 将环参数整合在一起并加入渲染队列
		const ringParams = [
			{ node: this.circRingLayout.nodes[ 0 ], angle: circRingAngles[ 0 ].angle, delta: circRingAngles[ 0 ].delta, materialId: 1 },
			{ node: this.circRingLayout.nodes[ 0 ], angle: circRingAngles[ 1 ].angle, delta: circRingAngles[ 1 ].delta, materialId: 1 },
			{ node: this.circRingLayout.nodes[ 1 ], angle: circRingAngles[ 0 ].angle, delta: circRingAngles[ 0 ].delta, materialId: 1 },
			{ node: this.circRingLayout.nodes[ 1 ], angle: circRingAngles[ 1 ].angle, delta: circRingAngles[ 1 ].delta, materialId: 1 },
			{ node: this.circRingLayout.nodes[ 2 ], angle: circRingAngles[ 0 ].angle, delta: circRingAngles[ 0 ].delta, materialId: 1 },
			{ node: this.circRingLayout.nodes[ 2 ], angle: circRingAngles[ 1 ].angle, delta: circRingAngles[ 1 ].delta, materialId: 1 },
			{ node: this.circRingLayout.nodes[ 3 ], angle: 0, delta: Math.PI*2, materialId: 1 },
			
			{ node: this.lineRingLayout.nodes[ 0 ], angle: 0, delta: Math.PI*2, materialId: 1 },
			{ node: this.lineRingLayout.nodes[ 1 ], angle: lineRingAngles[ 0 ].angle, delta: lineRingAngles[ 0 ].delta, materialId: 1 },
			{ node: this.lineRingLayout.nodes[ 1 ], angle: lineRingAngles[ 1 ].angle, delta: lineRingAngles[ 1 ].delta, materialId: 1 },
			{ node: this.lineRingLayout.nodes[ 2 ], angle: lineRingAngles[ 0 ].angle, delta: lineRingAngles[ 0 ].delta, materialId: 1 },
			{ node: this.lineRingLayout.nodes[ 2 ], angle: lineRingAngles[ 1 ].angle, delta: lineRingAngles[ 1 ].delta, materialId: 1 },
			{ node: this.lineRingLayout.nodes[ 3 ], angle: lineRingAngles[ 0 ].angle, delta: lineRingAngles[ 0 ].delta, materialId: 1 },
			{ node: this.lineRingLayout.nodes[ 3 ], angle: lineRingAngles[ 1 ].angle, delta: lineRingAngles[ 1 ].delta, materialId: 1 },
		];
		// // 根据参数
		// const ringGeometrys = ringParams.map( param => this.getRingGeometry( param.node, param.angle, param.delta, this.materials[ param.materialId ] ) );
		for ( const param of ringParams ) {
			this.addRing( param.node, param.angle, param.delta, this.materials[ param.materialId ] );
		}

		// 创建线
		const lineParams = [
			{ nodes: this.circRingLayout.points, angle: circRingAngles[ 0 ].angle + circRingAngles[ 0 ].delta*0, materialId: 1 },
			{ nodes: this.circRingLayout.points, angle: circRingAngles[ 0 ].angle + circRingAngles[ 0 ].delta*1, materialId: 1 },
			{ nodes: this.circRingLayout.points, angle: circRingAngles[ 1 ].angle + circRingAngles[ 1 ].delta*0, materialId: 1 },
			{ nodes: this.circRingLayout.points, angle: circRingAngles[ 1 ].angle + circRingAngles[ 1 ].delta*1, materialId: 1 },
			
			{ nodes: this.lineRingLayout.points, angle: (40)*toRadian, materialId: 1 },
			{ nodes: this.lineRingLayout.points, angle: (180-40)*toRadian, materialId: 1 },
			{ nodes: this.lineRingLayout.points, angle: (180+40)*toRadian, materialId: 1 },
			{ nodes: this.lineRingLayout.points, angle: (360-40)*toRadian, materialId: 1 },

			{ nodes: this.lineRingLayout.points, angle: lineRingAngles[ 0 ].angle + lineRingAngles[ 0 ].delta*0, materialId: 1 },
			{ nodes: this.lineRingLayout.points, angle: lineRingAngles[ 0 ].angle + lineRingAngles[ 0 ].delta*1, materialId: 1 },
			{ nodes: this.lineRingLayout.points, angle: lineRingAngles[ 1 ].angle + lineRingAngles[ 1 ].delta*0, materialId: 1 },
			{ nodes: this.lineRingLayout.points, angle: lineRingAngles[ 1 ].angle + lineRingAngles[ 1 ].delta*1, materialId: 1 },
		];
		for ( const param of lineParams ) {
			this.addLine( param.nodes, param.angle, this.materials[ param.materialId ] );
		}
	}

	createGUI( parentGUI ) {
		
		this.gui = parentGUI.addFolder( 'External Line' );
		this.gui.add( this.materials[ 1 ].uniforms.weight, 'value', 0.1, 3.0 ).name( 'weight' );
		this.gui.add( this.materials[ 1 ].uniforms.opacity, 'value', 0.1, 1.0 ).name( 'opacity' );
	}

	// 添加一条线
	addLine( nodes, angle, material ) {

		const geometry = new BrokenLineGeometry( 0.005, 12 );
		for ( const node of nodes ) {
			geometry.addNode( node );
		}
		geometry.compute();

		matrix.identity();
		matrix.multiply( subMatrix.makeRotationY( angle ) );

		const vertices = geometry.attributes.position.array;
		for ( let i = 0, len = vertices.length; i < len; i += 3 ) {
			vec.set( ...vertices.slice( i, i+3 ) );
			vec.applyMatrix4( matrix );
			
			vertices[ i + 0 ] = vec.x;
			vertices[ i + 1 ] = vec.y;
			vertices[ i + 2 ] = vec.z;

		}
		this.add( new Mesh( geometry, material ) );
	}

	// 添加一个环
	addRing( node, alpha, delta, material ) {

		const raidus = node.x;
		const geometry = new TorusGeometry( raidus, 0.005, 12, 60, delta );

		matrix.identity();
		matrix.multiply( subMatrix.makeTranslation( 0.0, node.y, 0.0 ) );
		matrix.multiply( subMatrix.makeRotationY( alpha ) );
		matrix.multiply( subMatrix.makeRotationX( -Math.PI / 2 ) );

		const vertices = geometry.attributes.position.array;
		for ( let i = 0, len = vertices.length; i < len; i += 3 ) {
			vec.set( ...vertices.slice( i, i+3 ) );
			vec.applyMatrix4( matrix );
			
			vertices[ i + 0 ] = vec.x;
			vertices[ i + 1 ] = vec.y;
			vertices[ i + 2 ] = vec.z;

		}
		this.add( new Mesh( geometry, material ) );
	}

	// 计算下半部分圆环的布局参数
	computeLineRingLayout() {

		// 确定下部分环的倾斜方向
		const start = this.circRingLayout.nodes[ 0 ].clone();
		const end = new Vector3( 1.75, -0.15, 0 );

		vec.copy( end ); vec.sub( start );
		const length = vec.length();
		vec.normalize();
		
		const points = [ 0.0, 0.5, 1.0 ].map( interval => {
			const l = interval;
			const point = vec.clone(); point.multiplyScalar( l ); point.add( start );
			return point;
		} );

		const nodes = [ 0, 3, 5, 7 ].map( interval => {
			interval = 0.5 + interval / 7 * 0.5;
			const l = interval * length;
			const point = vec.clone(); point.multiplyScalar( l ); point.add( start );
			return point;
		} );
	
		return { nodes, points };
	}

	// 计算上半部分圆环的布局参数
	computeCircRingLayout() {

		const nodes = [];
		const points = [];

		// 布局参数
		const params = {
			center: new Vector3( 0.0, -0.3, 0.0 ),  // 布局圆圆心
			radius: 1.28,  // 布局圆半径
			// alpha: 3.151267873219528 * toRadian,  // 布局点位总弧长
			alpha: 4 * toRadian,  // 布局点位总弧长
			intervals: [ 0, 1, 2, 3.5 ],  // 各个点的间隔
			scale: 0.3,  // 纵轴缩放
			beta: 0 * toRadian,  // 偏移角度
		}

		// 由于圆心沿 Y 轴移动，基础节点沿圆移动，以角度体现出来
		const beta = params.beta + Math.asin( Math.abs( params.center.y ) / params.radius );

		const setPoint = ( interval, point ) => {
			const angle = interval * params.alpha + beta;

			point.set( Math.cos( angle ), Math.sin( angle ), 0.0 );
			point.multiplyScalar( params.radius );
			point.y = params.scale * ( point.y + params.center.y ) - params.center.y;
			point.add( params.center );
		}

		// 计算中间结点
		for ( let i = 0, len = params.intervals.length; i < len; ++ i ) {
			const point = new Vector3();
			setPoint( params.intervals[ i ], point );
			nodes.push( point );
		}

		// 计算插值点
		for ( let i = 0, len = params.intervals.length - 1; i < len; ++ i ) {
			const [ intervalA, intervalB ] = params.intervals.slice( i, i + 2 );
			
			const n = 4;  // 插值点密度
			const deltaInterval = ( intervalB - intervalA ) / n;
			for ( let j = 0; j < n; ++ j ) {
				const interval = intervalA + deltaInterval * j;

				const point = new Vector3();
				setPoint( interval, point );
				points.push( point );
			}
		}
		points.push( new Vector3().copy( nodes[ nodes.length - 1 ] ) );
		
		// 修正头尾坐标, 因为线是有宽度的，如果直接 points 会和 nodes 生成的环割裂，不闭合
		vec.copy( points[ 0 ] ); vec.sub( points[ 1 ] );
		vec.normalize(); vec.multiplyScalar( 0.004 ); vec.add( points[ 0 ] );
		points[ 0 ].copy( vec );

		vec.copy( points[ points.length-1 ] ); vec.sub( points[ points.length-2 ] );
		vec.normalize(); vec.multiplyScalar( 0.004 ); vec.add( points[ points.length-1 ] );
		points[ points.length-1 ].copy( vec );

		return { nodes, points };
	}

}

export default ExternalLine;