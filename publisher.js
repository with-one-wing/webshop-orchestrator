const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');

app.use(fileUpload());

const EE = require('events');
const eventEmitter = new EE();

//queue channel
let channel = null;
//queue name
const QUEUE = 'optimizeimg';
const replyTo = 'amq.rabbitmq.reply-to';

function init() {
    return require('amqplib').connect('amqp://localhost')
        .then(conn => conn.createChannel())
        .then(ch => {

            console.log('service',service);
            service.get('5c4839ec310000af578a20f0')
                .then(function(response) {
                    console.log('xxxx', response.data);
                    console.log(response.status);
                    console.log(response.statusText);
                    console.log(response.headers);
                    console.log(response.config);
                });

            channel = ch;

            //this queue is a "Direct reply-to" read more at the docs
            //When some msg comes in, we "emit" a message to the proper "correlationId" listener
            ch.consume(replyTo, msg => eventEmitter.emit(msg.properties.correlationId, msg.content), {noAck: true});
        });
}
//Random id generator
function randomid() {
    return new Date().getTime().toString() + Math.random().toString() + Math.random().toString();
}
app.post('/upload', (req, res) => {
    let img = req.files.image;
    let correlationId = randomid();
    //Event listener that will fire when the proper randomid is provided
    eventEmitter.once(correlationId, msg => {
        res.write(msg, 'binary');
        res.end(null, 'binary');
    });

    //Checks if the queue exists, and create it if needed.
    channel.assertQueue(QUEUE)
    //Sent the buffered img to the queue with the ID and the responseQueue
        .then(() => {
            console.log('Sent IMG DATA', img.data);
            console.log('Sent PROPS', img.data);
            const {data} = img;
            const options = {correlationId, replyTo};
            channel.sendToQueue(QUEUE, data, options)
        });

});

//Finally start the app with the given port number
//now we initialize the rabbitmq connection before start the server
init()
    .then(() => app.listen(4000, () => console.log('Example app listening on port 4000!')))
    .catch(err=>console.error(err));