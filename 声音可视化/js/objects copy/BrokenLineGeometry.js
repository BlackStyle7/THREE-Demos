
import {
	BoxGeometry,
	BufferGeometry,
	PerspectiveCamera,
	MeshBasicMaterial,
	Vector3,
	Mesh,
	Color,
	BufferAttribute,
} from 'three';

const camera = new PerspectiveCamera();
const vec = new Vector3();
const vecPrev = new Vector3();
const vecNext = new Vector3();
const vecA = new Vector3();
const vecB = new Vector3();
const normal = new Vector3();
const majorAxis = new Vector3();  // 长轴
const minorAxis = new Vector3();  // 短轴
const direction = new Vector3();
const BrokenLineGeometry = class extends BufferGeometry {

	constructor( radius = 0, segments = 3 ) {
		super();

		this.radius = radius;
		this.segments = segments;

		this.basicSectionNodes = [];
		const delta = Math.PI * 2 / this.segments;
		for ( let i = 0; i < this.segments; ++ i ) {
			const angle = i * delta - delta / 2;

			const x = Math.cos( angle );
			const y = Math.sin( angle );
			this.basicSectionNodes.push( new Vector3( x, y, 0 ) );
		}

		this.nodes = [];
		// normal
		// position
		// uv
	}

	// 计算第一个截面
	computeFirstSection( nextSection ) {

		const prev = this.nodes[ 0 ];
		const curr = this.nodes[ 0 ];
		const next = this.nodes[ 1 ];
		
		// 两头方向向量
		vecPrev.copy( curr ); vecPrev.sub( prev ); vecPrev.normalize();
		vecNext.copy( next ); vecNext.sub( curr ); vecNext.normalize();

		// 计算切面法线
		normal.copy( vecPrev ); normal.add( vecNext ); normal.normalize();

		// 获取截面短轴
		minorAxis.copy( nextSection.minorAxis ); minorAxis.normalize();
		minorAxis.multiplyScalar( this.radius );

		// 计算截面长轴
		majorAxis.copy( minorAxis ); majorAxis.cross( normal ); majorAxis.normalize();
		const l = this.radius / Math.cos( vecNext.angleTo( normal ) );
		majorAxis.multiplyScalar( l );

		return {
			center: curr,
			normal: new Vector3().copy( normal ),
			minorAxis: new Vector3().copy( minorAxis ),
			majorAxis: new Vector3().copy( majorAxis ),
		}
	}

	// 计算最后一个截面
	computeLastSection( prevSection ) {

		const prev = this.nodes[ this.nodes.length - 2 ];
		const curr = this.nodes[ this.nodes.length - 1 ];
		const next = this.nodes[ this.nodes.length - 1 ];
		
		// 两头方向向量
		vecPrev.copy( curr ); vecPrev.sub( prev ); vecPrev.normalize();
		vecNext.copy( next ); vecNext.sub( curr ); vecNext.normalize();

		// 计算切面法线
		normal.copy( vecPrev ); normal.add( vecNext ); normal.normalize();

		// 获取截面短轴
		minorAxis.copy( prevSection.minorAxis ); minorAxis.normalize();
		minorAxis.multiplyScalar( this.radius );

		// 计算截面长轴
		majorAxis.copy( minorAxis ); majorAxis.cross( normal ); majorAxis.normalize();
		const l = this.radius / Math.cos( vecPrev.angleTo( normal ) );
		majorAxis.multiplyScalar( l );

		return {
			center: curr,
			normal: new Vector3().copy( normal ),
			minorAxis: new Vector3().copy( minorAxis ),
			majorAxis: new Vector3().copy( majorAxis ),
		}
	}

	// 计算中间过程截面
	computeSection( i ) {

		const prev = this.nodes[ i - 1 ];
		const curr = this.nodes[ i + 0 ];
		const next = this.nodes[ i + 1 ];
		
		// 两头方向向量
		vecPrev.copy( curr ); vecPrev.sub( prev ); vecPrev.normalize();
		vecNext.copy( next ); vecNext.sub( curr ); vecNext.normalize();

		// 计算切面法线
		normal.copy( vecPrev ); normal.add( vecNext ); normal.normalize();

		// 计算切面短轴
		minorAxis.copy( vecNext ); minorAxis.cross( vecPrev ); minorAxis.normalize();
		minorAxis.multiplyScalar( this.radius );

		// 计算切面长轴
		majorAxis.copy( minorAxis ); majorAxis.cross( normal ); majorAxis.normalize();
		const l = this.radius / Math.cos( vecNext.angleTo( normal ) );
		majorAxis.multiplyScalar( l );

		return {
			center: curr,
			normal: new Vector3().copy( normal ),
			minorAxis: new Vector3().copy( minorAxis ),
			majorAxis: new Vector3().copy( majorAxis ),
		}
		
		
		// const vectorNext = new Vector3();
		// vector.copy( target );
		// vector.sub( center );
		// vector.multiplyScalar( sign );
		// vector.add( center );

		// camera.position.copy( center );
		// camera.up.set( 0.0, 1.0, 0.0 );
		// camera.lookAt( vector.x, vector.y, vector.z );
		// camera.updateMatrixWorld();

		// const points = [];

		// const delta = Math.PI * 2 / this.segments;
		// for ( let i = 0; i < this.segments; ++ i ) {

		// 	const angle = i * delta - delta / 2;
		// 	const x = this.radius * Math.cos( angle );
		// 	const y = this.radius * Math.sin( angle );

		// 	const point = new Vector3( x, y, 0 );
		// 	point.applyMatrix4( camera.matrixWorld );

		// 	points.push( point );
		// }

		// return points;
	}

	computeSections() {

		const sections = [];
		for ( let i = 1, len = this.nodes.length; i < len - 1; ++ i ) {

			sections.push( this.computeSection( i ) );
		}
		sections.unshift( this.computeFirstSection( sections[ 0 ]  ) );
		sections.push( this.computeLastSection( sections[ sections.length - 1 ] ) );

		// 将横截面转换为各个结点
		for ( let j = 0, lenJ = sections.length; j < lenJ; ++ j ) {
			const section = sections[ j ];

			// 设置相机
			camera.position.copy( section.center );
			camera.up.copy( section.minorAxis );
			vec.copy( section.center ); vec.add( section.normal );
			camera.lookAt( vec );
			camera.updateMatrixWorld();

			const minor = section.minorAxis.length();
			const major = section.majorAxis.length();

			sections[ j ] = [];
			for ( let i = 0, lenI = this.basicSectionNodes.length; i < lenI; ++ i ) {
				const node = this.basicSectionNodes[ i ];
				
				vec.copy( node );
				vec.x *= major; vec.y *= minor;
				vec.applyMatrix4( camera.matrixWorld );

				sections[ j ].push( new Vector3().copy( vec ) );
			}
		}

		return sections;
	}

	// 添加一个节点
	addNode( node ) {
		this.nodes.push( node.clone() );
	}

	addLineCap( center, section, vertices, uvs, indices, pre, sign = true ) {

		const base = vertices.length / 3;

		for ( let i = 0; i < this.segments; ++ i ) {

			if ( sign ) {
				indices.push( base + 0, base + i + 1, base + Math.max( (base + i + 2)%(this.segments+1), 1 ) );
			} else {
				indices.push( base + 0, base + Math.max( (base + i + 2)%(this.segments+1), 1 ), base + i + 1 );
			}
		}

		vertices.push( center.x, center.y, center.z );
		uvs.push( pre, 1 );
		for ( const point of section ) {
			vertices.push( point.x, point.y, point.z );
			uvs.push( pre, 0 );
		}
	}

	addLine( originSection, targetSection, vertices, uvs, indices, preA, preB ) {

		const base = vertices.length / 3;

		// 遍历各个分段
		const index = [];
		// 1 - 0
		// |   |
		// 2 - 3
		for ( let i = 0; i < this.segments; ++ i ) {
			index[ 0 ] = base + ( i + 1 ) % this.segments * 2 + 1;
			index[ 1 ] = base + ( i + 0 ) % this.segments * 2 + 1;
			index[ 2 ] = base + ( i + 0 ) % this.segments * 2 + 0;
			index[ 3 ] = base + ( i + 1 ) % this.segments * 2 + 0;

			indices.push(
				index[ 0 ], index[ 2 ], index[ 1 ],
				index[ 0 ], index[ 3 ], index[ 2 ],
			);
		}

		for ( let i = 0; i < this.segments; ++ i ) {
			vertices.push(
				originSection[ i ].x, originSection[ i ].y, originSection[ i ].z,
				targetSection[ i ].x, targetSection[ i ].y, targetSection[ i ].z,
			);
			
			uvs.push(
				preA, 0,
				preB, 0,
			);
		}
	}

	computePres() {

		const pres = [ 0 ];
		for ( let i = 1, len = this.nodes.length; i < len; ++ i ) {

			vec.copy( this.nodes[ i-1 ] );
			pres[ i ] = pres[ i-1 ] + vec.distanceTo( this.nodes[ i ] );
		}

		for ( let i = 0, len = pres.length; i < len; ++ i ) {
			pres[ i ] = pres[ i ] / pres[ len-1 ];
		}

		return pres;
	}

	// 根据当前节点更新顶点坐标
	compute() {

		// 计算各个横截面信息
		const sections = this.computeSections();

		const pres = this.computePres();

		const vertices = [];
		const uvs = [];
		const indices = [];

		// 两头
		let nodeIndex = 0;
		this.addLineCap( this.nodes[ nodeIndex ], sections[ nodeIndex ], vertices, uvs, indices, pres[ nodeIndex ], true );
		nodeIndex = this.nodes.length - 1;
		this.addLineCap( this.nodes[ nodeIndex ], sections[ nodeIndex ], vertices, uvs, indices, pres[ nodeIndex ], false );
		// 中间线体
		for ( let i = 0, len = this.nodes.length - 1; i < len; ++ i ) {
			this.addLine( sections[ i + 0 ], sections[ i + 1 ], vertices, uvs, indices, pres[ i + 0 ], pres[ i + 1 ] );
		}

		this.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );
		this.setAttribute( 'uv', new BufferAttribute( new Float32Array( uvs ), 2 ) );
		this.setIndex( indices );
	}
}

export default BrokenLineGeometry;