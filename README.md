# cube-roll
a small WebGL game, to demonstrate streaming games for dedicated gaming

the game uses a canvas streaming library [https://github.com/mklan/canvasStreamer] to stream the game over WebRTC to a client for remote gaming.

# Development

```
    npm install
    npm start
    
    visit http://localhost:1234
```

# Deployment

```
    npm run build
```

# Demo

> __Note:__ The deployed demo is working only without streaming, because peerjs does not allow using their api via https


https://mklan.github.io/cube-roll/
