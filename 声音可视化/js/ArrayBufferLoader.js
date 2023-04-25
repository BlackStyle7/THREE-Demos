
const ArrayBufferLoader = class {

	constructor() {

	}

	async loadFromFile( file ) {

		const arrayBuffer = await new Promise( resolve => {

			const reader = new FileReader();
			reader.readAsArrayBuffer( file );
			reader.onload = () => {

				resolve( reader.result );
			}
		} );

		return arrayBuffer;
	}

	async load( url, callFunc ) {

		const arraybuffer = await new Promise( reslove => {

			const request = new XMLHttpRequest();
			request.responseType = 'arraybuffer';
			request.open( 'GET', url, true );
			request.onreadystatechange = e => {
				if ( request.readyState !== 4 ) return;

				reslove( request.status === 200 ? request.response : undefined );
			};
			request.send();
		} );

		return arraybuffer;
	}
}

export default ArrayBufferLoader;