import World from './game/World';
import CanvasStreamerServer from './game/lib/canvasStreamerServer';

let world = null;
const stats = null;


var server = new CanvasStreamerServer('canvas', {hideCanvas : false});
server.on('connected', (clientId) => {
  console.log('connected to Client:', clientId);
});
server.on('error', (error) => {
  console.error(error);
});
server.on('closed', () => {
  console.warn('connection closed');
});


server.init({key: 'jlu5rpiwwswnrk9'}).then((id) => {
  prompt('copy this id to your client, for remote playing [http://matthiasklan.github.io/canvasStreamer/Client]', id);
  createWorld();
});



function createWorld(){
	new World().then((w)=>{
	world = w;

    server.on('clientKeyUp', (key) => {
      world.playerControls.processRemoteControl(key)
    });

	world.playerControls.on('enterWhenGameOver', ()=>{
		createWorld();
	})
	animate();
});
}


function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}


function update() {

    world.update(stats);

  //  stats.update();
    //document.body.appendChild(stats.domElement);
};

function render() {
    world.render();
    server.stream(); //here you stream the current Frame to te client
}

