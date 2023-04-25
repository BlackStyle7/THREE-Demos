import { Scene, PerspectiveCamera, WebGLRenderer, Vector3 } from '../Three/three.module.js';
import { OrbitControls } from '../Three/controls/OrbitControls.js';
import { TrackballControls } from '../Three/controls/TrackballControls.js';
import Clock from './Clock.js';

// 左 Ctrl + b 开关视角锁定
const Viewer = class {
  constructor( container, option = {} ) {
    // 获取 DOM 容器
    this.container = container;

    this.onDrop = undefined;  // 监听拖拽文件

    // 创建三维场景三要素：场景，相机，渲染器
    this.scene = new Scene();
    this.camera = this.initCamera();
    this.renderer = this.initRenderer();

    // 创建时钟，用于动画渲染
    this.clock = new Clock();

    // 设置尺寸，更改 camera 和 renderer 的参数
    this.resize();

    // home 视角用于操作过后还原视角
    this.homeView = {
      position: new Vector3(),
      target: new Vector3(),
    };

    // 鼠标控制器，正式场景应当禁止使用
    // this.controller = new OrbitControls(this.camera, this.container);
    this.controller = new TrackballControls(this.camera, this.container);
    this.controller.enabled = option.enabledController ?? true;
    this.controller.enableDamping = true;

    // 动画帧函数 ID，用于终止动画
    this.animationFrameID = 0;

    // 添加视角控制锁便于调试
    this.isLeftCtrlDown = false;
    window.addEventListener('keydown', this.onkeydown);
    window.addEventListener('keyup', this.onkeyup);
    // 页面大小调整后，调整窗口参数
    window.addEventListener('resize', this.onresize);

    // 启动动画
    this.startFrame(0);

	this.frameCount = 0;
	this.frameInterval = 1;
  }

  onresize = () => {
    this.resize();
  };

  onkeydown = (e) => {
    const { keyCode } = e;
    if (keyCode === 17) this.isLeftCtrlDown = true;
    if (this.isLeftCtrlDown && keyCode === 66) {
      // 左 Ctrl + b
      this.controller.enabled = !this.controller.enabled;
    }
    // 如果允许鼠标交互，并且按下了home键，还原视角
    if (this.controller.enabled && keyCode == 36) {
      // home建
      this.toHomeView();
    }
  };
  onkeyup = (e) => {
    const { keyCode } = e;
    if (keyCode === 17) this.isLeftCtrlDown = false;
  };

  // 销毁组件
  dispose() {
    // 首先销毁 帧事件
    cancelAnimationFrame(this.animationFrameID);

    // 销毁视角控制锁
    window.removeEventListener('keydown', this.onkeydown);
    window.removeEventListener('keyup', this.onkeyup);
    window.removeEventListener('resize', this.onresize);

    // 再销毁 controller
    this.controller.dispose();

    // 最后释放渲染资源
    this.renderer.dispose();

    // 销毁 webgl 上下文，异步是为了缓解闪白
    setTimeout(() => {
      this.renderer.forceContextLoss();
    }, 30);
  }

  render(time) {
    // 渲染三维场景
    this.renderer.render(this.scene, this.camera);
  }

  startFrame = (time) => {
    this.animationFrameID = requestAnimationFrame(this.startFrame);

	this.frameCount = ( this.frameCount + 1 ) % this.frameInterval;
	if ( this.frameCount !== ( this.frameInterval - 1 ) ) return;

    this.controller.update(); // 更新鼠标视角控制器
    this.clock.update(time); // 更新时钟维护时间信息

    this.render(time);
  };

  toHomeView() {
    const { position, target } = this.homeView;

    this.camera.position.copy(position);
    this.controller.target.copy(target);
  }

  // 设置原始视角
  setHomeView(option) {
    const { position, target } = option;
    this.homeView.position.set(...position);
    this.homeView.target.set(...target);
  }

  // 初始化渲染器
  initRenderer() {
    const renderer = new WebGLRenderer({ antialias: false, alpha: false });
    renderer.shadowMap.enabled = false;

    this.container.appendChild( renderer.domElement );

    // 绑定事件
    renderer.stopDefault = e => {
			e.preventDefault();
			e.stopPropagation();
    }
    
    // 阻止接收文件后自动跳转打开
		renderer.domElement.addEventListener( 'dragenter', e => {
			renderer.stopDefault( e );
		}, false );
		
		renderer.domElement.addEventListener( 'dragover', e => {
			renderer.stopDefault( e );
		}, false );
		
		renderer.domElement.addEventListener( 'dragleave', e => {
			renderer.stopDefault( e );
		}, false );
		
		renderer.domElement.addEventListener( 'drop', e => {
			renderer.stopDefault( e );

      if ( typeof this?.onDrop !== 'function' ) return;
      this.onDrop( e );
		}, false );

    return renderer;
  }

  // 初始化相机
  initCamera() {
    return new PerspectiveCamera(30, 1, 0.1, 1000.0);
  }

  // 设置屏幕尺寸
  resize() {
    const { width, height } = this.container.getBoundingClientRect();

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }
};

export default Viewer;
