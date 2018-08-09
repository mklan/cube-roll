/**
 * Created by Matthias on 21.08.2016.
 */
import hudElement from './hudElement';

export default class HudTextElement extends hudElement{

    constructor({text, x=0, y=0, font='Bold 40px Arial', color='white', hidden=false}){
        super(x, y, hidden);
        this.text = text;
        this.font = font;
        this.color = color;
    }
    
    setText(text){
        this.text = text;
    }
}