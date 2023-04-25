import {
    Group,
	Mesh,
	MeshBasicMaterial,
	Vector3,
	TorusGeometry,
	SphereGeometry,
	Matrix4,
} from 'three';
import BrokenLineGeometry from './BrokenLineGeometry.js';

const vec = new Vector3();
const matrix = new Matrix4();
const PI2 = Math.PI * 2.0;
const toRadian = Math.PI / 180;
const CenterRing = class extends Group {

    constructor() {
		super();

		// 布局参数
		this.layoutParams = {
			center: new Vector3( 0.0, -0.3, 0.0 ),  // 布局圆圆心
			radius: 1.28,  // 布局圆半径
			// alpha: 3.151267873219528 * toRadian,  // 布局点位总弧长
			alpha: 4 * toRadian,  // 布局点位总弧长
			interval: [ 0, 1, 2, 3.5 ],  // 各个点的间隔
			scale: 0.3,  // 纵轴缩放
			beta: 0 * toRadian,  // 偏移角度
		}

		this.layoutNodes = new Array( this.layoutParams.interval.length ).fill( 0 ).map( item => new Vector3() );
		this.layoutPoints = [];
		this.computeLayoutPoints();

		// // debugger layout 点
		// const dGeometry = new BoxGeometry( 0.01, 0.01, 0.01 );
		// const dMaterial = new MeshBasicMaterial( { color: 0xffffff } );
		// for ( const point of this.layoutNodes ) {
		// 	const p = new Mesh( dGeometry, dMaterial );
		// 	p.position.copy( point );
		// 	this.add( p );
		// }

		this.ringParams = {
			alpha: 25 * toRadian,
		}
	
		const ringAngles = [
			{ radiusA: this.ringParams.alpha, radiusB: Math.PI - this.ringParams.alpha },
			{ radiusA: Math.PI + this.ringParams.alpha, radiusB: Math.PI*2 - this.ringParams.alpha },
		];

		this.rings = [];
		const ringMaterial = new MeshBasicMaterial( { color: 0xdd44cc } );
		for ( const { radiusA, radiusB } of ringAngles ) {

			for ( const layoutPoint of this.layoutNodes ) {
				vec.copy( layoutPoint ); vec.y = 0.0;
				const ring = new Mesh(
					new TorusGeometry( vec.length(), 0.005, 12, 48, radiusB - radiusA ),
					ringMaterial,
				);
				ring.rotation.set( Math.PI/2, 0, radiusA + Math.PI/2 );
				ring.position.set( 0.0, layoutPoint.y, 0.0 );
				this.add( ring );
			}
		}

		this.lines = [];
		const geometry = new BrokenLineGeometry( 0.005, 8 );
		for ( const point of this.layoutPoints ) {
			geometry.addNode( point );
		}
		geometry.compute();
		const material = new MeshBasicMaterial( { color: 0xdd44cc } );
		for ( const ringAngle of ringAngles ) {
			for ( const key in ringAngle ) {
				const angle = ringAngle[ key ];
				
				const mesh = new Mesh( geometry, material );
				mesh.rotation.set( 0.0, angle + Math.PI/2, 0.0 );
				this.add( mesh );
			}
		}
		
	}

	computeLayoutPoints() {

		const beta = this.layoutParams.beta + Math.asin( Math.abs( this.layoutParams.center.y ) / this.layoutParams.radius );

		const setPoint = ( interval, point ) => {
			const angle = interval * this.layoutParams.alpha + beta;

			point.set( Math.cos( angle ), Math.sin( angle ), 0.0 );
			point.multiplyScalar( this.layoutParams.radius );
			point.y = this.layoutParams.scale * ( point.y + this.layoutParams.center.y ) - this.layoutParams.center.y;
			point.add( this.layoutParams.center );
		}

		// 计算中间结点
		for ( let i = 0, len = this.layoutNodes.length; i < len; ++ i ) {
			setPoint( this.layoutParams.interval[ i ], this.layoutNodes[ i ] );
		}

		this.layoutPoints.splice( 0 );
		for ( let i = 0, len = this.layoutParams.interval.length - 1; i < len; ++ i ) {
			const [ intervalA, intervalB ] = this.layoutParams.interval.slice( i, i + 2 );
			
			const n = 4;
			const deltaInterval = ( intervalB - intervalA ) / n;
			for ( let j = 0; j < n; ++ j ) {
				const interval = intervalA + deltaInterval * j;

				const point = new Vector3();
				setPoint( interval, point );
				this.layoutPoints.push( point );
			}
		}
		this.layoutPoints.push( new Vector3().copy( this.layoutNodes[ this.layoutNodes.length - 1 ] ) );
		// 修正头尾坐标
		vec.copy( this.layoutPoints[ 0 ] ); vec.sub( this.layoutPoints[ 1 ] );
		vec.normalize(); vec.multiplyScalar( 0.004 ); vec.add( this.layoutPoints[ 0 ] );
		this.layoutPoints[ 0 ].copy( vec );

		vec.copy( this.layoutPoints[ this.layoutPoints.length-1 ] ); vec.sub( this.layoutPoints[ this.layoutPoints.length-2 ] );
		vec.normalize(); vec.multiplyScalar( 0.004 ); vec.add( this.layoutPoints[ this.layoutPoints.length-1 ] );
		this.layoutPoints[ this.layoutPoints.length-1 ].copy( vec );
	}

	// updateDebuggerLayoutPoints = () => {
	// 	this.computeLayoutPoints();
	// 	for ( let i = 0, len = this.layoutPoints.length; i < len; ++ i ) {
	// 		// this.layoutPoints[ i ].copy();
	// 		this.debuggerLayoutPoints[ i ].position.copy( this.layoutPoints[ i ] );
	// 	}
	// }

	// createGUI( parentGUI ) {

	// 	this.gui = parentGUI.addFolder( 'Center Ring' ); this.gui.open();
	// 	this.gui.add( this.layoutParams.center, 'y', -0.5, 0.0, 0.01 ).onChange( this.updateDebuggerLayoutPoints );
	// 	this.gui.add( this.layoutParams, 'radius', 0.8, 1.4, 0.01 ).onChange( this.updateDebuggerLayoutPoints );
	// 	this.gui.add( this.layoutParams, 'alpha', 0.0 * toRadian, 10.0 * toRadian, 0.001 ).onChange( this.updateDebuggerLayoutPoints );
	// 	this.gui.add( this.layoutParams, 'scale', 0.0, 1.0, 0.01 ).onChange( this.updateDebuggerLayoutPoints );
	// }
}

export default CenterRing;