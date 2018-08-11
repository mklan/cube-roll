/**
 * Created by Matthias on 21.08.2016.
 */
import THREE from 'three';
import hudTextElement from './hudTextElement';

export default class Hud{

    constructor(renderer){
        this.r = renderer;

        this.r.autoClear = false;

        this.elements = [];
        this.redraw = false;


        let width =this.r.getSize().width;
        let height = this.r.getSize().height;

        this.width = width;
        this.height = height;

        this.cameraHUD = new THREE.OrthographicCamera(
            -width/2, width/2,
            height/2, -height/2,
            0, 30
        );
        this.sceneHUD = new THREE.Scene();

        let bitmap = document.createElement('canvas');
        bitmap.width = width;
        bitmap.height = height;

        this.hudContext = bitmap.getContext('2d');

        this.hudTexture = new THREE.Texture(bitmap);
        this.hudTexture.needsUpdate = true;
        this.hudTexture.minFilter = THREE.LinearFilter;

        let textMaterial = new THREE.MeshBasicMaterial( {map: this.hudTexture} );
        textMaterial.transparent = true;

        const guiGeometry = new THREE.PlaneGeometry(width, height);
        const plane = new THREE.Mesh( guiGeometry, textMaterial );

        this.sceneHUD.add( plane );
    }

    addElement(element, id=Date.now()){
        this.elements[id] = element;
        this.redraw = true;
        return id;
    }

    showElement(id){
        this.elements[id].visible = true;
        this.redraw = true;
    }

    hideElement(id){
        this.elements[id].visible = false;
        this.redraw = true;
    }

    setText(id, text){
        this.elements[id].test = text;
        this.redraw = true;
    }

    getElementById(id){
        return this.elements[id];
    }

    update(){

        if(this.redraw){
            this.redraw = false;

            this.hudContext.clearRect(0, 0, this.width, this.height);

            Object.values(this.elements).filter(element => element.visible).forEach(element => {
                const {text, x, y, font, color} = element;
                this.hudContext.font = font;
                this.hudContext.fillStyle = color;
                this.hudContext.fillText(text, x, y);
            });
                
            this.hudTexture.needsUpdate = true;
        }

        this.r.render(this.sceneHUD, this.cameraHUD);
    }
}