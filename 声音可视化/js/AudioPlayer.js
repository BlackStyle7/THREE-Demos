import { createAudioElement, setPointValue, setCourseInformations, setButtonState } from './createAudioElement.js';
import ArrayBufferLoader from './ArrayBufferLoader.js';

const AudioPlayer = class {

	constructor() {

		this.context = undefined;
		this.element = createAudioElement( this );

		this.loader = new ArrayBufferLoader();

		this.url = undefined;
		this.buffer = undefined;
		
		this.bufferSourceNode = undefined;
		this.gainNode = undefined;
		this.analyserNode = undefined;

		this.prevTime = 0;
		this.deltaTime = 0;
		this.targetValue = 0;

		this.count = 512;

		this.needUpdate = false;
		this.frameData = new Uint8Array( this.count );

		// 通过滑块指定播放
		this.onPointPositionChange = value => {
			if ( !this.buffer ) return;
			this._playAudioBuffer( this.buffer, value );
		}

		this.onButtonStateChange = value => {
			if ( !this.context ) return;
			if ( value ) {
				this.context.resume();
			} else {
				this.context.suspend();
			}
		}

		// 调整音量
		this.onVolumeChange = value => {
			if ( !this?.gainNode ) return;
			this.gainNode.gain.value = value;
		}
	}

	// 初始化组件
	init() {

		this.context = new AudioContext();

		this.gainNode = this.context.createGain();
		this.analyserNode = this.context.createAnalyser();
		this.analyserNode.fftSize = this.count * 2;
	}

	// 将 File 对象加载为 AudioBuffer
	async loadFileToAudioBuffer( file ) {
		setCourseInformations( this.element, { name: '文件已接收，读取内容' } );

		const arrayBuffer = await this.loader.loadFromFile( file );
		setCourseInformations( this.element, { name: '文件读取完毕，开始解析' } );
		
		const audioBuffer = await this.context.decodeAudioData( arrayBuffer );
		// 初始化一些属性
		audioBuffer.name = file.name.split( '.' )[ 0 ];
		
		setCourseInformations( this.element, { name: '音频文件解析完毕，准备播放' } );
		return audioBuffer;
	}

	stopAudioBuffer() {
		this.bufferSourceNode.stop();
		this.bufferSourceNode = null;
	}

	// 内部的播放接口，只是播放
	_playAudioBuffer( audioBuffer, value = 0 ) {

		this.targetValue = value;

		if ( this.bufferSourceNode ) {
			this.stopAudioBuffer();
		}

		// 创建音频节点
		this.bufferSourceNode = this.context.createBufferSource();

		// 装载数据
		this.bufferSourceNode.buffer = audioBuffer;
		
		// 绑定音频节点
		this.bufferSourceNode.connect( this.gainNode );
		this.gainNode.connect( this.analyserNode );
		this.analyserNode.connect( this.context.destination );

		this.bufferSourceNode.loop = false;
		// audioBufferSourceNode.loopStart = 10;
		// audioBufferSourceNode.loopEnd = 10;
		this.bufferSourceNode.start( 0, audioBuffer.duration * value );
		this.bufferSourceNode.playbackRate.value = 1;  // 播放速率
		// this.bufferSourceNode.onended = () => {
		// 	console.log( '播放完毕' );
		// }

		return this.bufferSourceNode;
	}

	// 暴露在外部的播放接口，它会修改进度条
	playAudioBuffer( audioBuffer, value = 0 ) {

		this.buffer = audioBuffer;
		this.prevTime = this.context.currentTime;

		// 更新名称
		setCourseInformations( this.element, {
			name: audioBuffer.name,
		} );

		// 播放状态开启
		setButtonState( this.element, true );

		return this._playAudioBuffer( audioBuffer, value );
	}

	update() {
		if ( !this.bufferSourceNode ) return;

		this.deltaTime = this.context.currentTime - this.prevTime;
		this.prevTime = this.context.currentTime;
		
		this.targetValue = Math.min( this.targetValue + this.deltaTime / this.buffer.duration, 1.0 );
		setPointValue( this.element, this.targetValue );

		this.analyserNode.getByteFrequencyData( this.frameData );
		
	}
}
let a = 0;

export default AudioPlayer;