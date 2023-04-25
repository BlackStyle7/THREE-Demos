import {
	Group,
	Mesh,
	CylinderGeometry,
	MeshBasicMaterial,
	DoubleSide,
	Color,
	CanvasTexture,
	RepeatWrapping,
} from 'three';

const AnnularCurtain = class extends Group {

	constructor() {
		super();

		this.canvas = document.createElement( 'canvas' );
		this.canvas.width = 512; this.canvas.height = 255;
		this.cxt = this.canvas.getContext( '2d' );
		
		this.texture = new CanvasTexture( this.canvas );
		this.texture.wrapS = RepeatWrapping;
		this.texture.repeat.set( 3, 1 );

		const geometry = new CylinderGeometry( 0.55, 0.55, 1.0, 64, 1, true );
		const material = new MeshBasicMaterial( {
			map: this.texture,
			side: DoubleSide,
			transparent: true,
			opacity: 1.0,
		} );
		this.annular = new Mesh( geometry, material );
		// this.annular.scale.set( 0.5, 1.0, 0.5 );
		this.annular.position.set( 0.0, 0.55, 0.0 );
		this.add( this.annular );
	}

	update( frameData, clock ) {
		this.cxt.clearRect( 0, 0, this.canvas.width, this.canvas.height );

		this.cxt.strokeStyle = 'rgba( 36, 92, 117, 1 )';
		for ( let i = 0, len = frameData.length; i < len; ++ i ) {
			this.cxt.beginPath();
			this.cxt.moveTo( i, this.canvas.height );
			this.cxt.lineTo( i, this.canvas.height - frameData[ i ] );
			
			this.cxt.stroke();
		}
		
		this.cxt.fillStyle = 'rgba( 36, 92, 157, 0.7 )';
		this.cxt.fillRect( 0, this.canvas.height - 5, this.canvas.width, 5 );

		this.texture.needsUpdate = true;
	}

}

export default AnnularCurtain;