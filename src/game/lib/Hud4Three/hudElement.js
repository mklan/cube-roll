/**
 * Created by Matthias on 21.08.2016.
 */
export default class HudElement{

    constructor(x, y, visible){
        this.x = x;
        this.y = y;
        this.visible = visible;
    }

    setVisible(bool){
    	this.visible = bool;
    }
}