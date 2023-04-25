import {
	Group,
	ShapeGeometry,
	MeshBasicMaterial,
	Mesh,
	DoubleSide,
	Vector3,
	BufferGeometry,
	Matrix4,
	BufferAttribute,
	Color,
} from 'three';
import { FontLoader } from '../../Three/loaders/FontLoader.js';
import fontSource from '../../Three/fonts/helvetiker_bold.typeface.json' assert { type: 'json' };

const vec = new Vector3();
const center = new Vector3();
const matrix = new Matrix4();
const subMatrix = new Matrix4();
const toRadian = Math.PI/180;
const Texts = class extends Group {

	constructor() {
		super();

		this.loader = new FontLoader();
		this.font = this.loader.parse( fontSource );

		this.materials = [
			new MeshBasicMaterial( { color: new Color( 'rgb( 72, 215, 205 )' ), side: DoubleSide } ),
			new MeshBasicMaterial( { color: new Color( 'rgb( 88, 185, 227 )' ), side: DoubleSide } ),
		];

		const testParams = [
			{ text: 'abcde', fontSize: 0.07, offsetAngle: 0*toRadian, radius: 1.5, center: center, materialId: 0 },
			{ text: 'abcdef', fontSize: 0.07, offsetAngle: 40*toRadian, radius: 1.5, center: center, materialId: 0 },
			{ text: 'a', fontSize: 0.07, offsetAngle: 60*toRadian, radius: 1.5, center: center, materialId: 0 },
			{ text: 'abcdfeg', fontSize: 0.07, offsetAngle: 125*toRadian, radius: 1.5, center: center, materialId: 0 },
			{ text: 'nisownmqk', fontSize: 0.07, offsetAngle: 145*toRadian, radius: 1.5, center: center, materialId: 0 },
			{ text: 'efgb', fontSize: 0.07, offsetAngle: 175*toRadian, radius: 1.5, center: center, materialId: 0 },
			{ text: 'pouj', fontSize: 0.07, offsetAngle: 192*toRadian, radius: 1.5, center: center, materialId: 0 },
			{ text: 'g', fontSize: 0.07, offsetAngle: 260*toRadian, radius: 1.5, center: center, materialId: 0 },
			{ text: 'dgewrvh', fontSize: 0.07, offsetAngle: 280*toRadian, radius: 1.5, center: center, materialId: 0 },

			{ text: 'qwer', fontSize: 0.05, offsetAngle: 0*toRadian, radius: 1.2, center: center, materialId: 0 },
			{ text: 'ytre', fontSize: 0.05, offsetAngle: 12*toRadian, radius: 1.2, center: center, materialId: 0 },
			{ text: 'mn', fontSize: 0.05, offsetAngle: 39*toRadian, radius: 1.2, center: center, materialId: 0 },
			{ text: 'qw', fontSize: 0.05, offsetAngle: 48*toRadian, radius: 1.2, center: center, materialId: 0 },
			{ text: 'egvsc', fontSize: 0.05, offsetAngle: 78*toRadian, radius: 1.2, center: center, materialId: 0 },
			{ text: 'jbg', fontSize: 0.05, offsetAngle: 140*toRadian, radius: 1.2, center: center, materialId: 0 },
			{ text: 'jbg', fontSize: 0.05, offsetAngle: 187*toRadian, radius: 1.2, center: center, materialId: 0 },
			{ text: 'plk', fontSize: 0.05, offsetAngle: 210*toRadian, radius: 1.2, center: center, materialId: 1 },
			{ text: 'qecdse', fontSize: 0.05, offsetAngle: 230*toRadian, radius: 1.2, center: center, materialId: 1 },
			{ text: 'qecdseer', fontSize: 0.05, offsetAngle: 255*toRadian, radius: 1.2, center: center, materialId: 1 },
			{ text: 'enoncs', fontSize: 0.05, offsetAngle: 275*toRadian, radius: 1.2, center: center, materialId: 0 },
		];

		this.text = [];
		for ( const param of testParams ) {

			const geometry = this.createRingTextGeometry( param );
			const material = this.materials[ param.materialId ];
			const text = new Mesh( geometry, material );
			this.add( text ); this.text.push( text );
		}

	}

	/**
	 * 创建一个环形文字几何、
	 * @param text <String> must 需要创建的文字
	 * @param fontSize <Number> must 字体大小
	 * @param radius <Number> must 绕的那个环的半径
	 * @param center <Vector3> must 绕的那个环的圆心
	 * @return <BufferGeometry>
	 */
	createRingTextGeometry( option = {} ) {
		const  { text, fontSize, offsetAngle, radius, center } = option;

		const vertices = [];
		const normals = [];
		const uvs = [];
		const incides = [];

		let totalWidth = 0;
		const wordGeometries = [];
		for ( const word of text ) {
			// 创建当前字符的几何数据，并计算包围盒
			const shapeGeometry = new ShapeGeometry( this.font.generateShapes( word, fontSize ) );
			shapeGeometry.computeBoundingBox();
			shapeGeometry.computeVertexNormals();
			totalWidth += shapeGeometry.boundingBox.max.x - shapeGeometry.boundingBox.min.x + fontSize * 0.1;
			wordGeometries.push( shapeGeometry );
		}
		totalWidth -= fontSize * 0.1;
		
		let currWidth = 0, base = 0;
		for ( const wordGeometry of wordGeometries ) {

			// 计算偏移参数
			const width = wordGeometry.boundingBox.max.x - wordGeometry.boundingBox.min.x;  // + fontSize * 0.1;
			const offsetX = currWidth + width/2 - totalWidth / 2;
			const angle = offsetAngle + offsetX / radius;

			const vertex = wordGeometry.attributes.position.array;
			const normal = wordGeometry.attributes.normal.array;
			const uv = wordGeometry.attributes.uv.array;
			const index = wordGeometry.index.array;

			// 注入索引数据
			base = vertices.length / 3;
			for ( let i = 0, len = index.length; i < len; ++ i ) {
				incides.push( index[ i ] + base );
			}

			// 构建当前文字的变换矩阵
			matrix.identity();
			matrix.multiply( subMatrix.makeRotationY( angle ) );
			matrix.multiply( subMatrix.makeTranslation( 0.0, 0.0, radius ) );
			matrix.multiply( subMatrix.makeRotationX( -Math.PI/2 ) );
			matrix.multiply( subMatrix.makeTranslation( -width/2, 0.0, 0.0 ) );
			
			// 注入顶点数据
			for ( let i = 0, len = vertex.length/3; i < len; ++ i ) {

				vec.set( vertex[ i * 3 + 0 ], vertex[ i * 3 + 1 ], vertex[ i * 3 + 2 ] );
				vec.applyMatrix4( matrix );
				vertices.push( vec.x, vec.y, vec.z );

				normals.push( ...normal.slice( i*3, i*3+3 ) );
				uvs.push( ...uv.slice( i*2, i*2+2 ) );
			}

			currWidth += width + fontSize * 0.1;
			wordGeometry.dispose();
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );
		geometry.setAttribute( 'normal', new BufferAttribute( new Float32Array( normals ), 3 ) );
		geometry.setAttribute( 'uv', new BufferAttribute( new Float32Array( uvs ), 2 ) );
		geometry.setIndex( incides );
		return geometry;
	}
}

export default Texts;