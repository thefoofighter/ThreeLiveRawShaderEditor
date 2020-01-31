class ThreeLiveRawShaderEditor {

    constructor(renderer, camera, scene) {
       this.renderer = renderer;
       this.camera = camera;
       this.scene = scene;
    }

    compile(){
        this.renderer.compile(this.scene, this.camera);
    }
}

var TLRSE;

var MODULE = (function (app) {

	var vertex_shader = `precision mediump float;
	precision mediump int;

	uniform mat4 modelViewMatrix; // optional
	uniform mat4 projectionMatrix; // optional

	attribute vec3 position;

	void main()	{

		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	}`;

	var fragment_shader = `precision mediump float;
	precision mediump int;

	void main()	{
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	}`;

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var geometry = new THREE.BoxGeometry();

	var material = new THREE.RawShaderMaterial( {
		vertexShader: vertex_shader,
		fragmentShader: fragment_shader
	} );

	material.name = "Mat1";

	var cube = new THREE.Mesh( geometry, material );
	scene.add( cube );

	camera.position.z = 5;

	// ======== THREE LIVE RAW SHADER EDITOR =========
	TLRSE = new ThreeLiveRawShaderEditor(renderer, camera, scene);

	var animate = function () {
		requestAnimationFrame( animate );

		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;

		renderer.render( scene, camera );
	};

	animate();

	return app;

}(MODULE));