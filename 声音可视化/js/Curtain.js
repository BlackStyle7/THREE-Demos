// 遮挡整个屏幕的幕布，负责 Demo 初始化
const Curtain = class {

	constructor( container, option = {} ) {

		this.container = container;

		this.element = document.createElement( 'div' );
		this.element.innerHTML = `
			<div class="curtain-botton">Button</div>
			<div class="curtain-info-box">Click the button and drag the '. mp3' file into the window.</div>"
		`;
		this.element.style.position = 'absolute';
		this.element.style.top = '0px';
		this.element.style.width = '100%';
		this.element.style.height = '100%';
		this.element.style.userSelect = 'none';
		this.element.style.backdropFilter = 'blur(3px)';

		const stopDefault = e => {
			e.preventDefault();
			e.stopPropagation();
		}
		this.element.addEventListener( 'dragenter', stopDefault, false );
		this.element.addEventListener( 'dragover', stopDefault, false );
		this.element.addEventListener( 'dragleave', stopDefault, false );
		this.element.addEventListener( 'drop', stopDefault, false );

		this.button = this.element.querySelectorAll( '.curtain-botton' )[ 0 ];
		this.button.style.position = 'absolute';
		this.button.style.background = '#f1f1f1';
		this.button.style.fontSize = '50px';
		this.button.style.padding = '0px 16px 0px 16px';
		this.button.style.left = 'calc( 50% - 100px )';
		this.button.style.top = 'calc( 50% - 36px )';
		this.button.style.borderRadius = '15px';
		this.button.style.color = 'rgb(122 122 122)';
		this.button.style.border = '3px solid #b7b7b7';
		this.button.style.cursor = 'pointer';
		this.button.onclick = this._onclick;

		this.buttonClicked = false;
		this.button.onmousedown = () => {
			this.buttonClicked = true;
			this.button.style.background = 'rgb(14, 14, 14)';
			this.button.style.color = 'rgb(133, 133, 133)';
		}

		this.infoBox = this.element.querySelectorAll( '.curtain-info-box' )[ 0 ];
		this.infoBox.style.position = 'absolute';
		this.infoBox.style.color = '#ffffff';
		this.infoBox.style.fontSize = '20px';
		this.infoBox.style.left = 'calc( 50% - 276px )';
		this.infoBox.style.top = 'calc( 50% + 54px )';

		this.onmouseup = () => {
			if ( !this.buttonClicked ) return;

			this.buttonClicked = false;
			this.button.style.background = 'rgb(241, 241, 241)';
			this.button.style.color = 'rgb(122, 122, 122)';
		}
		window.addEventListener( 'mouseup', this.onmouseup );

		this.container.appendChild( this.element );

		this.onclick = option.onclick ?? undefined;
	}

	destroy() {
		
		window.removeEventListener( 'mouseup', this.onmouseup );
		this.element.remove();
		this.container = null;
	}

	_onclick = () => {
		if ( typeof this.onclick !== 'function' ) return;

		this.onclick();
	}
}

export default Curtain