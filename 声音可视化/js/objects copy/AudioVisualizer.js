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
import CenterRing from './CenterRing.js';
import OuterRing from './OuterRing.js';
import Texts from './Texts.js';

const AudioVisualizer = class extends Group {

	constructor( audioPlayer ) {
		super(); 

		this.audioPlayer = audioPlayer;

		this.gui = new GUI();

		// 外部栅栏
		this.exteriorRailings = new ExteriorRailings();
		this.add( this.exteriorRailings );

		// 中心轴
		this.centerAxis = new CenterAxis();
		this.add( this.centerAxis );

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

		// 中间环
		this.centerRing = new CenterRing();
		this.add( this.centerRing );

		// 外环
		this.outerRing = new OuterRing();
		this.add( this.outerRing );

		// 添加文字
		this.texts = new Texts();
		this.add( this.texts );

		for ( const child of this.children ) {
			if ( typeof child.createGUI !== 'function' ) continue;
			child.createGUI( this.gui );
		}
	}

	update( clock ) {

		for ( let i = 0, len = this.children.length; i < len; ++ i ) {
			if ( typeof this.children[ i ].update !== 'function' ) continue;

			this.children[ i ].update( this.audioPlayer.frameData, clock );
			// this.children[ i ].scale.y =  -this.audioPlayer.frameData[ i ] / 500;
		}
	}
}

export default AudioVisualizer;