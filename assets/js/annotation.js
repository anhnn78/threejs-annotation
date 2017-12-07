var container;
var camera, scene, renderer;
var particleMaterial;

var raycaster;
var mouse;

var objects = [];

init();
animate();

function init() {

	container = document.createElement('div');
	document.body.appendChild(container);

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.set(0, 300, 500);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x333333);

	// var geometry = new THREE.BoxGeometry(100, 100, 100);

	// for (var i = 0; i < 10; i++) {

	// 	var object = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
	// 		color: Math.random() * 0xffffff,
	// 		opacity: 0.5
	// 	}));
	// 	object.position.x = Math.random() * 800 - 400;
	// 	object.position.y = Math.random() * 800 - 400;
	// 	object.position.z = Math.random() * 800 - 400;

	// 	object.scale.x = Math.random() * 2 + 1;
	// 	object.scale.y = Math.random() * 2 + 1;
	// 	object.scale.z = Math.random() * 2 + 1;

	// 	object.rotation.x = Math.random() * 2 * Math.PI;
	// 	object.rotation.y = Math.random() * 2 * Math.PI;
	// 	object.rotation.z = Math.random() * 2 * Math.PI;

	// 	scene.add(object);

	// 	objects.push(object);

	// }

	// Model
    var loader = new THREE.JSONLoader();
    loader.load('assets/untitled.json', function (geometry, mat) {

        mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(mat));

        mesh.scale.x = 30;
        mesh.scale.y = 30;
        mesh.scale.z = 30;

        console.log()
        scene.add(mesh);

    });

	var PI2 = Math.PI * 2;
	particleMaterial = new THREE.SpriteCanvasMaterial({

		color: 0x000000,
		program: function(context) {

			context.beginPath();
			context.arc(0, 0, 0.5, 0, PI2, true);
			context.fill();

		}

	});

	//

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	renderer = new THREE.CanvasRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	document.addEventListener('mousedown', onDocumentMouseDown, false);
	document.addEventListener('touchstart', onDocumentTouchStart, false);

	//

	window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentTouchStart(event) {

	event.preventDefault();

	event.clientX = event.touches[0].clientX;
	event.clientY = event.touches[0].clientY;
	onDocumentMouseDown(event);

}

function onDocumentMouseDown(event) {

	event.preventDefault();

	mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
	mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);

	var intersects = raycaster.intersectObjects(objects);

	if (intersects.length > 0) {

		intersects[0].object.material.color.setHex(Math.random() * 0xffffff);

		var particle = new THREE.Sprite(particleMaterial);
		particle.position.copy(intersects[0].point);
		particle.scale.x = particle.scale.y = 16;
		scene.add(particle);

	}

	/*
	// Parse all the faces
	for ( var i in intersects ) {

		intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );

	}
	*/
}

//

function animate() {

	requestAnimationFrame(animate);

	render();

}

var radius = 600;
var theta = 0;

function render() {

	theta += 0.1;

	camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
	camera.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
	camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta));
	camera.lookAt(scene.position);

	renderer.render(scene, camera);

}