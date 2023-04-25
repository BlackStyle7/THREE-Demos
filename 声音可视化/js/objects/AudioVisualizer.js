import {
	Group,
} from 'three';
import { GUI } from 'gui';
import ExteriorRailings from './ExteriorRailings.js';
import CenterAxis from './CenterAxis.js';
import BrokenLine from './BrokenLine.js';
import AnnularCurtain from './AnnularCurtain.js';
import Embellish from './Embellish.js';
import InnerRing from './InnerRing.js';
import Texts from './Texts.js';
import ExternalLine from './ExternalLine.js';
import VertexCurtain from './VertexCurtain.js';
import Knob from './Knob.js';

const AudioVisualizer = class extends Group {

	constructor( audioPlayer ) {
		super(); 

		this.audioPlayer = audioPlayer;

		// this.gui = new GUI();

		// 外部栅栏
		this.exteriorRailings = new ExteriorRailings();
		this.add( this.exteriorRailings );

		// 中心轴
		this.centerAxis = new CenterAxis();
		this.add( this.centerAxis );

		// 旋钮
		this.knob = new Knob();
		this.add( this.knob );

		// 内部折线
		this.brokenLine = new BrokenLine();
		this.add( this.brokenLine );

		// 内部点缀
		this.embellish = new Embellish();
		this.add( this.embellish );

		// 内环
		this.innerRing = new InnerRing();
		this.add( this.innerRing );

		// 环形幕布
		this.annularCurtain = new AnnularCurtain();
		this.add( this.annularCurtain );

		// 外部线
		this.externalLine = new ExternalLine();
		this.add( this.externalLine );

		// 添加文字
		this.texts = new Texts();
		this.add( this.texts );

		// 顶点幕布
		this.vertexCurtain = new VertexCurtain();
		this.add( this.vertexCurtain );

		// for ( const child of this.children ) {
		// 	if ( typeof child.createGUI !== 'function' ) continue;
		// 	child.createGUI( this.gui );
		// }
	}

	update( clock ) {

		for ( let i = 0, len = this.children.length; i < len; ++ i ) {
			if ( typeof this.children[ i ].update !== 'function' ) continue;

			this.children[ i ].update( this.audioPlayer.frameData, clock );
		}
	}
}

export default AudioVisualizer;