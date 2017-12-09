'use strict';
var loader = document.querySelector('.loader-ring');
var resetViewBtn = $('.reset-view');
var tutorialBtn = $('.tutorial');
var shareBtn = $('.share');
var zoom = $('.zoom');
var zoomExpand = document.querySelector('.zoom.expand');
var zoomCompress = document.querySelector('.zoom.compress');
var isZoomed = false;

var canvas = document.getElementById("number");
var tools = document.getElementById("tools");

var manager = new THREE.LoadingManager();
manager.onStart = function ( url, itemsLoaded, itemsTotal ) {

    console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    loader.style.display = 'block';
    tools.style.display = 'block';

};

manager.onLoad = function ( ) {

    console.log( 'Loading complete!');
    animate();
    loader.style.display = 'none';
    canvas.style.display = 'block';
    tools.style.display = 'block';

};


manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {

    console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

};

manager.onError = function ( url ) {

    console.log( 'There was an error loading ' + url );

};


// Number

var ctx = canvas.getContext("2d");
var x = 32;
var y = 32;
var radius = 30;
var startAngle = 0;
var endAngle = Math.PI * 2;

ctx.fillStyle = "rgb(0, 0, 0)";
ctx.beginPath();
ctx.arc(x, y, radius, startAngle, endAngle);
ctx.fill();

// ctx.strokeStyle = "rgb(255, 255, 255)";
// ctx.lineWidth = 3;
// ctx.beginPath();
// ctx.arc(x, y, radius, startAngle, endAngle);
// ctx.stroke();

ctx.fillStyle = "rgb(255, 255, 255)";
ctx.font = "32px sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("?", x, y);

// three.js

var camera = undefined;
var controls = undefined;
var scene = undefined;
var renderer = undefined;
var sprite = undefined;
var mesh = undefined;
var raycaster = undefined;
var spriteBehindObject = undefined;
var annotation = document.querySelector(".annotation");
var main3d = document.getElementById("main3d");
var mouse = new THREE.Vector2(),
    INTERSECTED;
var objects = [];
var initCameraPos = [1000, 500, 1000];
var timeouts = [];

// click or drag
var click = 0;

init();

function init() {

    // Camera

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 20000);
    camera.position.x = initCameraPos[0];
    camera.position.y = initCameraPos[1];
    camera.position.z = initCameraPos[2];

    // Scene

    scene = new THREE.Scene();

    // Lights

    var lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 2000, 0);
    lights[1].position.set(500, 1000, 500);
    lights[2].position.set(-1000, -2000, -1000);

    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);

    // Model
    var loader = new THREE.JSONLoader(manager);
    loader.load('assets/model/Nara.json', function(geometry, mat) {

        mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(mat));

        mesh.scale.x = 300;
        mesh.scale.y = 300;
        mesh.scale.z = 300;
        scene.add(mesh);
        // objects.push(mesh)
    });

    raycaster = new THREE.Raycaster();

    // Sprite

    var numberTexture = new THREE.CanvasTexture(document.querySelector("#number"));

    var spriteMaterial = new THREE.SpriteMaterial({
        map: numberTexture,
        alphaTest: 0.5,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });

    sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(2.41312276447065, 459.09742200810825, -282.22401799408374);
    sprite.scale.set(60, 60, 1);

    scene.add(sprite);
    objects.push(sprite)
    // Renderer

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: main3d
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x333333, 1);
    // document.body.appendChild(renderer.domElement);

    // Controls

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.noPan = true;
    controls.autoRotate = true;
    controls.minDistance = 500.0;
    controls.maxDistance = 3000.0;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 500, 0);

    window.addEventListener("resize", onWindowResize, false);
    // document.addEventListener('click', onDocumentMouseDown, false);

    // document.addEventListener('click', handleCloseAnnotation, false);

    $(document).click(function(event){onDocumentMouseDown(event)});
    $(document).on('mousemove', function(event){onDocumentMouseMove(event)});
    $(document).on('touchstart', function(event){onDocumentTouchStart(event)});
    $(document).on('mousewheel', function(event){onscrollHandle(event)});


    function onscrollHandle (e) {
        e.stopPropagation()
        e.preventDefault()
    }

    // check click or drag 
    $(document).on('mousedown', function(event){
        click = 0;
    });
    $(document).on('mousemove', function(event){
        click = 1;
    });
    $(document).on('touchmove', function(event){
        click = 1;
    });
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

function onDocumentMouseMove(event) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( objects );

    if(intersects.length > 0) {
        $('html,body').css('cursor', 'pointer');
    } else {
        $('html,body').css('cursor', 'default');
    }

}

function onDocumentMouseDown(event) {
    stopRotate(5000);

    console.log('mouse down')
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        intersects = intersects.sort( function( a, b ) {
            return a.distanceToRay - b.distanceToRay;
        });
        var particle = intersects[0];
        // console.log( 'got a click on particle', particle);
        // intersects[0].object.material.color.setHex(Math.random() * 0xffffff);

        // var particle = new THREE.Sprite(particleMaterial);
        // particle.position.copy(intersects[0].point);
        // particle.scale.x = particle.scale.y = 16;
        // scene.add(particle);

        // Update sprite position
        // sprite.position.x = intersects[0].point.x
        // sprite.position.y = intersects[0].point.y
        // sprite.position.z = intersects[0].point.z
        // camera.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z - 1500)
        var tween = new TWEEN.Tween(camera.position);
        tween.to({
            x : intersects[0].point.x,
            y : intersects[0].point.y,
            z : intersects[0].point.z - 1500
        } , 500);
        tween.delay(100);
        tween.start();
        tween.onComplete(function() {
          showAnnotation(true);
          stopRotate(false);
        });
    } else {
        if (click == 0) {
            showAnnotation(false);
            controls.autoRotate = true;
        }
    }

    /*
    // Parse all the faces
    for ( var i in intersects ) {

        intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );

    }
    */
}

function updateAnnotationOpacity() {
    var cameraPos = camera.position.clone();
    var meshDistance = cameraPos.distanceTo(mesh.position);
    var spriteDistance = cameraPos.distanceTo(sprite.position);
    // console.log(meshDistance, spriteDistance)
    spriteBehindObject = spriteDistance > meshDistance;
    sprite.material.opacity = spriteBehindObject ? 0.5 : 1;

}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
    updateScreenPosition();
    updateAnnotationOpacity();
}

function showAnnotation (show) {
    if (show) {
        annotation.style.display = 'block';
        annotation.innerHTML = '<span id="close-annotation" onclick="showAnnotation(false)">✕</span><h1>Nara The Desert Wind</h1><p><iframe width="100%"  src="https://www.youtube.com/embed/QgaTQ5-XfMM" frameborder="0" allowfullscreen></iframe></p><h3><a href="https://www.youtube.com/watch?v=QgaTQ5-XfMM">Xem thêm</a></h3>';
    }
    else {
        annotation.style.display = 'none';
        annotation.innerHTML = '';
        stopRotate(0);
    }
}

function updateScreenPosition() {
    var vector = new THREE.Vector3(2.41312276447065, 459.09742200810825, -282.22401799408374);
    var canvas = renderer.domElement;

    vector.project(camera);

    vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
    vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

    annotation.style.top = vector.y + "px";
    annotation.style.left = vector.x + "px";
    annotation.style.opacity = spriteBehindObject ? 0.25 : 1;
}

$(document).dblclick(resetView);

resetViewBtn.click( function (e) {
    e.preventDefault();
    e.stopPropagation();
    setTimeout(function () {
        $(document).click();
    }, 100)
    resetView();
})


function resetView () {
    shareModal.removeClass('active');
    tutorialModal.removeClass('active');
    stopRotate (5000);
    var tween = new TWEEN.Tween(camera.position);

    tween.to({
        x : initCameraPos[0],
        y : initCameraPos[1],
        z : initCameraPos[2]
    } , 500);
    tween.delay(100);
    tween.start();
    tween.onComplete(function() {
      showAnnotation(false);
    });
}

zoom.on('click', function () {
    handleToggleZoom()
    controls.state = -1;
});

function handleToggleZoom () {
    toggleZoom()
    isZoomed = !isZoomed;
}

function toggleZoom () {
    let element = document.querySelector('body');
    if(!isZoomed) {
        if(element.requestFullscreen)
            element.requestFullscreen();
        else if(element.mozRequestFullScreen)
            element.mozRequestFullScreen();
        else if(element.webkitRequestFullscreen)
            element.webkitRequestFullscreen();
        else if(element.msRequestFullscreen)
            element.msRequestFullscreen();
    } else {
        if(document.exitFullscreen)
            document.exitFullscreen();
        else if(document.mozCancelFullScreen)
            document.mozCancelFullScreen();
        else if(document.webkitExitFullscreen)
            document.webkitExitFullscreen();
        else if(document.msExitFullscreen)
            document.msExitFullscreen();
    }
    // console.log(isZoomed)
}

tippy('.button', {
    arrow: true,
    theme: 'dark'
})

function stopRotate (time) {
    controls.autoRotate = false;

    if (time) {
        for (var i = 0; i < timeouts.length; i++)
            clearTimeout(timeouts[i]);
        var autoRotateAgain = setTimeout(function(){controls.autoRotate = true}, time);
        timeouts.push(autoRotateAgain);
    } else {
        for (var i = 0; i < timeouts.length; i++)
        clearTimeout(timeouts[i]);
    }
}

var tutorialModal = $('#tutorial-container');
var shareModal = $('#share-container');
var closeTutorial = $('#closeTutorial');
var closeShare = $('#closeShare');

tutorialBtn.on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    shareModal.removeClass('active');

    if (tutorialModal.hasClass('active')) {
        tutorialModal.removeClass('active');
    } else {
        tutorialModal.addClass('active');
    }
    
    setTimeout(function () {
        $(document).click();
    }, 100)
})

closeTutorial.on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    tutorialModal.removeClass('active');
    setTimeout(function () {
        $(document).click();
    }, 100)
})

shareBtn.on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    tutorialModal.removeClass('active');

    if (!shareModal.hasClass('active')) {
        var content = document.querySelector('#iframeLink');
        content.value = '<p>Xem sản phẩm tại <a href="'+window.location.href+'">Toàn Dũng Media.</a></p><iframe id="iframe3d" width="640" height="480" src="'+window.location.href+'" frameborder="0" allowvr allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>';
        shareModal.addClass('active');
    } else {
        shareModal.removeClass('active');
    }
})

closeShare.on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    shareModal.removeClass('active');
})

var clipboard = new Clipboard('#iframeLink');
clipboard.on('success', function(e) {
    alert('Đã copy!');
    e.clearSelection();
});