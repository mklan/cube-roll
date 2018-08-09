const PIVOT_LEFT = 0;
const PIVOT_MIDDLE = 1;
const PIVOT_RIGHT = 2;

import {
    EventEmitter
} from 'events';


export default class Controls extends EventEmitter{

    constructor(object, world){

    super();
    
    this.world = world;

	this.object = object;
	this.enabled = true;

	this.remoteControlEnabled = true;


	this.pivotPosition = PIVOT_MIDDLE;
	this.animationState = PIVOT_MIDDLE;

	this.counter = 0;
	this.lastCounter = 0;


	this.resetPivot = false; //Do not change
	
	this.movementSpeed = 5.0;
	this.distanceToCamera = 10.0;

	this.autoSpeedFactor = 0.0;

	this.moveLeft = false;
	this.moveRight = false;

	this.lockColor = false;

	this.colors = ['0x1abc9c', '0x9b59b6', '0xe67e22'];

	window.onkeydown = ( event ) => {

		if(this.moveLeft || this.moveRight) return;  //if in movement, then do not accept anything

		this.handleKey(event.keyCode);
	};

    }

	handleKey(keyCode){

		if(keyCode == 65 || keyCode == 37){
			this.moveLeft = true;
			return;
		}
		if(keyCode == 68 || keyCode == 39){
			this.moveRight = true;
			return;
		}
		if(keyCode == 32){
			this.lockColor = true;
			return;
		}
		if(keyCode == 13){
			if(this.world.gameover){
				this.emit('enterWhenGameOver');
				return;
			}
			this.world.gameStarted = true;
			this.world.hud.hideElement('instructions');
			return;
		}

	}

	processRemoteControl( keyCode ){

		if(this.moveLeft || this.moveRight || !this.remoteControlEnabled) return;

		this.handleKey(keyCode);
	}

	update( delta, stats, camera) {

		const randomIntFromInterval = (min,max) => {
			return Math.floor(Math.random()*(max-min+1)+min);
		}

		//game over if out of bounds
		if(this.object.position.x >= 6 || this.object.position.x <= -5){
			this.world.gameover = true;
			this.world.hud.showElement('gameover');
		}

		if ( this.enabled === false ) return;

		var actualMoveSpeed = delta * this.movementSpeed;
		var distance = camera.position.z-this.object.position.z;

		//Forward Movement Animation
		if(this.object.rotation.x > -(90/180)*Math.PI){
			this.object.rotation.x -= actualMoveSpeed;
			this.counter++;

			//CALCULATE CAMERA DISTANCE
			if(this.lastCounter != 0){
				camera.position.z -= 1/this.lastCounter;
			}

			//ADJUST CAMERA DISTANCE
			
			//if(distance < this.distanceToCamera){
				//camera.position.z -= (this.distanceToCamera - distance);
			//}
			if(distance > this.distanceToCamera){
				camera.position.z += ( this.distanceToCamera - distance);
			}

			//LEFT Animation
			if(this.animationState == PIVOT_LEFT){
				this.object.rotation.z += actualMoveSpeed;
			}

			//LEFT RIGHT
			if(this.animationState == PIVOT_RIGHT){
				this.object.rotation.z -= actualMoveSpeed;
			}
		}else{

			//assign random color to player, if not locked
			if(!this.lockColor) {
				this.object.children[0].children[0].material.color.setHex(this.colors[randomIntFromInterval(0, 2)]);
			}


			//$('#gamescore').html(this.world.score);

			//PIVOT FORWARD RESET
			this.object.rotation.x = 0; //reset Rotation
	    	this.object.rotation.z = 0;
	   
	    	this.object.position.z += -1.0;
	    	this.object.children[0].position.z = 0.5; 

			if(this.animationState == PIVOT_LEFT) {
				this.object.position.x -= 0.5;
				this.object.children[0].position.x = 0;

			}
			if(this.animationState == PIVOT_RIGHT){
				this.object.position.x += 0.5;
				this.object.children[0].position.x = 0;	
			} 


			this.pivotPosition = PIVOT_MIDDLE;
			this.animationState = PIVOT_MIDDLE;
	
			if(this.moveLeft){
				if(this.pivotPosition == PIVOT_MIDDLE){
					this.object.position.x -= 0.5;
					this.object.children[0].position.x = 0.5;
				}
				if(this.pivotPosition == PIVOT_RIGHT){
					this.object.position.x -= 1.0;
					this.object.children[0].position.x = 0.5;
				}
				this.pivotPosition = PIVOT_LEFT;
				this.animationState = PIVOT_LEFT;

			}
			if(this.moveRight){
				if(this.pivotPosition == PIVOT_MIDDLE){
					this.object.position.x += 0.5;
					this.object.children[0].position.x = -0.5; 
				}
				if(this.pivotPosition == PIVOT_LEFT){
					this.object.position.x += 1.0;
					this.object.children[0].position.x = -0.5;
				}
				this.pivotPosition = PIVOT_RIGHT;
				this.animationState = PIVOT_RIGHT;
			}


	    	this.lastCounter = this.counter;
	    	this.counter = 0;

	    	this.moveLeft = false;
	    	this.moveRight = false;


	    }


	}



}