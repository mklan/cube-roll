/**
 * Created by Matthias on 21.08.2016.
 */
export default class HudElement{

    constructor(x, y, hidden){
        this.x = x;
        this.y = y;
        this.render = !hidden;
    }

    show(){
    	this.render = true;
    }

    hide(){
    	this.render = false;
    }

    isHidden(){
    	return !this.render;
    }
}