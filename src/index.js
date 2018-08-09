import World from './game/world';
import CanvasStreamerServer from './game/lib/canvasStreamerServer';

import config from './config';

let tickingStarted = false;
let renderPause = false;

function initServer() {

  return new Promise((resolve) => {
    const server = new CanvasStreamerServer('canvas', {hideCanvas : false});
    server.on('connected', (clientId) => {
      console.log('connected to Client:', clientId);
    });
    server.on('error', (error) => {
      console.error(error);
    });
    server.on('closed', () => {
      console.warn('connection closed');
    });
  
    server.init({ key: config.peerJSApiKey, secure: true }).then((id) => {
      prompt('copy this id to your client, for remote playing [https://mklan.github.io/canvasStreamer/Client]', id);
      resolve(server);
    });
  });
  
}

function main(skipServer){

  console.log(config.useServer)

	new World().then((world) => {

    world.playerControls.on('enterWhenGameOver', () => {
      renderPause = true;
      main(true);
    });
  
    if(!skipServer) {
      initServer().then(server => {

        server.on('clientKeyUp', key => {
          world.playerControls.processRemoteControl(key);
        });  
        renderPause = false;
        if(!tickingStarted){
          tick(world, server);
        }
      });
    } else {
      renderPause = false;
      if(!tickingStarted){
        tick(world);
      }
    }


  });

}

function tick(world, server) {

    requestAnimationFrame(() => tick(world, server));

    if( !renderPause ) {
      tickingStarted = true;
      world.update();
      world.render();
      server && server.stream(); //here you stream the current Frame to the client
    }
}


main(!config.useServer);