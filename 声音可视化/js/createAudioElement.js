
const createElement = () => {

	const element = document.createElement( 'div' );
	element.className = 'audio-player';
	element.innerHTML = `
		<div class="audio-player-buttons">
			<div class="audio-player-buttons-center" style="color: #dfdfdf;">▶</div>
		</div>
		<div class="audio-player-course">
			<div class="audio-player-course-axis"></div>
			<div class="audio-player-course-point">🔘</div>
		</div>
		<input class="audio-player-volume" type="range" min="0" max="1" value="0.2" step="0.01">
		<div class="audio-player-informations">
			<div class="audio-player-informations-name">--</div>
		</div>
	`;

	return element;
}

const maintainVariables = element => {

	// 控制播放暂停的按钮
	element.button = element.querySelectorAll( '.audio-player-buttons-center' )[ 0 ];

	// 进度条的圆点
	element.point = element.querySelectorAll( '.audio-player-course-point' )[ 0 ];

	// 控制进度条
	element.course = element.querySelectorAll( '.audio-player-course' )[ 0 ];

	// 音量
	element.volume = element.querySelectorAll( '.audio-player-volume' )[ 0 ];

	// 属性信息
	element.informations = element.querySelectorAll( '.audio-player-informations' )[ 0 ];
	element.informations.name = element.informations.querySelectorAll( '.audio-player-informations-name' )[ 0 ];
}

/**
 * 根据像素位置计算百分比数据
 */
const computeValueFromPixel = ( element, pixel ) => {

	const { left, width: length } = element.course.getBoundingClientRect();
	const { width } = element.point.getBoundingClientRect();

	let value = ( pixel - left - width / 2 ) / ( length - width );
	value = Math.max( Math.min( value, 1 ), 0 );

	return value;
}

// 设置属性信息
const setCourseInformations = ( element, values = {} ) => {

	element.informations.name.innerHTML = values.name;
}

/**
 * 根据传入百分比移动 point 位置
 */
const setPointValue = ( element, value ) => {
	const { width: length } = element.course.getBoundingClientRect();
	const { width } = element.point.getBoundingClientRect();

	const x = value * ( length - width );
	element.point.style.left = x + 'px';
}

const setButtonState = ( element, value = false ) => {
	element.button.state = value;
	element.button.style.color = value ? '#dfdfdf' : 'red';
	if ( typeof audioPlayer.onButtonStateChange === 'function' ) {
		audioPlayer.onButtonStateChange( element.button.state );
	}
}

const addevent = ( element, audioPlayer ) => {

	const { course, point, button, volume } = element;
	course.prevValue = 0;
	course.isSelected = false;
	course.onmousedown = ( e ) => {
		course.isSelected = true;
		point.style.filter = 'brightness( 0.8 )';
		
		const value = computeValueFromPixel( element, e.x );
		if ( course.prevValue === value ) return;

		course.prevValue = value;
		setPointValue( element, value );

		if ( typeof audioPlayer.onPointPositionChange === 'function' ) {
			audioPlayer.onPointPositionChange( value );
		}
	}
	course._onmouseup = () => {
		if ( !course.isSelected ) return;
		course.isSelected = false;
		point.style.filter = '';
	}
	addEventListener( 'mouseup', course._onmouseup );
	course._onmousemove = ( e ) => {
		if ( !course.isSelected ) return;
		
		const value = computeValueFromPixel( element, e.x );
		if ( course.prevValue === value ) return;

		course.prevValue = value;
		setPointValue( element, value );

		if ( typeof audioPlayer.onPointPositionChange === 'function' ) {
			audioPlayer.onPointPositionChange( value );
		}
	}
	addEventListener( 'mousemove', course._onmousemove );

	// 控制播放与暂停
	button.state = true;
	button.onclick = () => {

		setButtonState( element, !button.state );
	}

	volume.oninput = () => {
		
		if ( typeof audioPlayer.onVolumeChange === 'function' ) {
			audioPlayer.onVolumeChange( volume.value*1 );
		}
	}
}

const createAudioElement = ( audioPlayer ) => {

	const element = createElement();

	maintainVariables( element );
	addevent( element, audioPlayer );

	return element;
}

const destroyAudioElement = element => {

}

export { createAudioElement, destroyAudioElement, setPointValue, setCourseInformations, setButtonState };