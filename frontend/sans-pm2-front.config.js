module.exports = {
  apps: [{
    name:"sans-front",
    script: "server.js",
    exec_mode:"cluster",
    instances:2,
    wait_ready:true,
    listen_timeout:10000,
    env:{
      "NODE_ENV":"production"
    }
  }]
}