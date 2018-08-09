import THREE from 'three';
import OBJLoader from './lib/ObjLoader';
import Controls from './controls';
import Hud from "./lib/Hud4Three/hud";

import cube from '../assets/cube.obj';
import ground from '../assets/ground.png';

OBJLoader(THREE);

export default class World{


    constructor(){

        return new Promise((resolve, reject)=>{
            this.renderOnServer = true;

            this.clock = new THREE.Clock();
            this.scene = new THREE.Scene();
            let playerRotationParent = new THREE.Object3D();

            // Manager from ThreeJs to track a loader and its status
            // Loader for Obj from Three.js
            const loader = new THREE.OBJLoader(new THREE.LoadingManager());

            loader.load(cube, (object) => {

                object.traverse((child) => {

                    if (child instanceof THREE.Mesh) {

                        child.material = new THREE.MeshPhongMaterial({color: 0x1abc9c});
                        object.position.z = +0.5;
                        child.castShadow = true;
                        playerRotationParent.add(object);

                        this.scene.add(playerRotationParent);
                        this.playerControls = new Controls(playerRotationParent, this);
                        this.renderer = this.createRenderer(853, 480, true);
                        this.createFloor();
                        this.camera = this.createCamera(853, 480);
                        this.light = this.createLight();
                        this.hud = this.createHUD();

                        this.player = object;
                        this.object = playerRotationParent;


                        this.wallLength = 10;
                        this.margin = 1; //How many Blocks on the Side there cannot be a Hole;
                        this.wallDistance = 30; //distance to the player
                        this.buildingSpeed = 10 * 3;// how fast should the Wall get

                        this.counter = 0;
                        this.colors = [0x1abc9c, 0x9b59b6, 0xe67e22];

                        this.walls = [null, null];//init

                        this.score = 0;

                        resolve(this);

                    }

                });

            });

        });

    }

    update(stats) {

        if(this.gameover || !this.gameStarted) return;

        const delta = this.clock.getDelta();

        this.playerControls.update(delta, stats, this.camera);

        this.counter += delta * this.buildingSpeed;
        if (this.counter > 100) {
            this.counter = 0;
            this.createWall();

            if (this.walls.length > 1 && this.walls[1] !== null){
                //got through gate
                if(this.walls[1].hole == this.player.parent.position.x+4){
                    this.score += 10;
                    //correct color
                    if(this.walls[1].color == this.player.children[0].material.color.getHex()){
                        this.score += 20;
                    }
                    this.hud.setText('score', 'Score: '+this.score);
                    this.playerControls.lockColor = false;
                }else{
                    this.gameover = true;;
                    this.hud.showElement('gameover');
                }

            }

        }	    
    }

    render(){
        this.renderer.render(this.scene, this.camera);
        this.hud.update();
    }


    createHUD(){        
        const hud = new Hud(this.renderer);
        hud.addTextElement({id:'score', text:'Score: 0', x:30, y:60, color:'white'});
        hud.addTextElement({id:'gameover', text:'GAME OVER, PRESS ENTER TO RESTART', x:25, y:260, color:'white', hidden: true});
        hud.addTextElement({id:'instructions', font:'Bold 20px Arial', text:'PRESS ENTER TO START             (SPACE = HOLD COLOR, A, D = left,right)', x:80, y:260, color:'white'});
        return hud;
    }

    createWall() {

        const randomIntFromInterval = (min,max) => {
            return Math.floor(Math.random()*(max-min+1)+min);
        }

        var wall = new THREE.Object3D();

        var hole = randomIntFromInterval(0 + this.margin, this.wallLength - 1 - this.margin);
        var randomColor = this.colors[randomIntFromInterval(0, 2)];

        var randomMaterial = new THREE.MeshPhongMaterial();

        for (var i = 0; i < this.wallLength; i++) {
            if (i === hole) { // Don't create a cube if there should be a hole
                continue;
            }
            var tmpBlock = this.player.clone();
            tmpBlock.children[0].material = randomMaterial;
            tmpBlock.children[0].material.color.setHex(randomColor);
            wall.add(tmpBlock);
            tmpBlock.position.x = i;

        }

        wall.position.x = -4; // Adjust to fit on the Field

        wall.position.z = (this.player.parent.position.z - this.wallDistance);

        this.scene.add(wall);
        this.walls.push({object: wall, hole: hole, color: randomColor});

        if (this.walls.length > 5) {
            if (this.walls[0] !== null) this.scene.remove(this.walls[0].object);
            this.walls.shift();
        }


        return wall;
    }

    createRenderer(width, height) {
        const renderer = new THREE.WebGLRenderer({antialias: true, canvas: document.getElementById('canvas')});
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        document.body.innerHTML = '';
        if (this.renderOnServer) document.body.appendChild(renderer.domElement);
        return renderer;
    }

    createLight() {
        //Light
        var ambient = new THREE.AmbientLight(0x222222);
        this.scene.add(ambient);

        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(200, 200, 300);
        light.castShadow = true;

        //Shadow Mapping
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;

        var d = 40;

        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;

        light.shadow.camera.far = 1000;
        //light.shadowDarkness = 0.5;

        this.camera.add(light);
        light.target = this.camera;
        return light;
    }

    createFloor() {

        var textureLoader = new THREE.TextureLoader();
        textureLoader.load(ground, (texture)=>{
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(2.5, 250);
            var floorMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide
            });
            var floorGeometry = new THREE.PlaneBufferGeometry(10, 1000, 10, 10);
            var floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.receiveShadow = true;
            floor.rotation.x = Math.PI / 2;
            floor.position.z = -480;
            floor.position.x = 0.5;
            this.scene.add(floor);
            this.floor = floor;
        })

    }

    createCamera(width, height) {
        var cameraDistance = 10;
        let camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
        camera.rotation.x = -(30 / 180) * Math.PI;
        camera.position.y = 5;
        camera.position.z = cameraDistance;
        this.scene.add(camera);

        return camera;
    }
}