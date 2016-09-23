/**
 * Created by Matthias on 21.08.2016.
 */
import THREE from 'three';
import hudTextElement from './HudTextElement';

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

    addTextElement({id=new Date().getTime(), text, x, y, font, color, hidden}={}){

        const textElement = new hudTextElement({text, x, y, font, color, hidden});
        this.elements[id] = textElement;

        this.redraw = true;

        return id;
    }

    showElement(id){
        this.elements[id].show();
        this.redraw = true;
    }

    hideElement(id){
        this.elements[id].hide();
        this.redraw = true;
    }

    setText(id, text){
        this.elements[id].setText(text);
        this.redraw = true;
    }

    getElementById(id){
        return this.elements[id];
    }

    update(){

        if(this.redraw){
            this.redraw = false;

            this.hudContext.clearRect(0, 0, this.width, this.height);

            for (let i in this.elements) {
                let {text, x, y, font, color} = this.elements[i];
                if(this.elements[i].isHidden()) continue;
                this.hudContext.font = font;
                this.hudContext.fillStyle = color;
                this.hudContext.fillText(text, x, y);
            }

            this.hudTexture.needsUpdate = true;
        }

        this.r.render(this.sceneHUD, this.cameraHUD);
    }
}