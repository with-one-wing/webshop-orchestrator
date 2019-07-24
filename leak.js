const EventEmitter = require('events').EventEmitter;

const server = new EventEmitter;


function Request() {
    const bigData = new Array(1e6).join('*');
    this.send = () => {
      console.log(data);
    };

    server.on('data', (info)=> {
        this.send(info);
    });
}


setInterval(() => {
    const req = new Request();
    console.log('heapUsed', process.memoryUsage().heapUsed);
    console.log('heapTotal', process.memoryUsage().heapTotal);
    console.log('rss', process.memoryUsage().rss);
}, 500);
