const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');

let channel = null;
const QUEUE = 'optimizeimg';

require('amqplib').connect('amqp://localhost')
    .then(conn => conn.createChannel())
    .then(ch => {
        console.log('CONNECTED');
        ch.assertQueue(QUEUE)
            .then(() => {
                console.log('THEN');
                //Watch incomming messages
                ch.consume(QUEUE, msg => {
                    console.log('CONSUMED', msg);
                    imagemin.buffer(msg.content, {
                        plugins: [imageminPngquant()]
                    }).then(out => {
                            //Send back to the sender (replyTo) queue and give the correlationId back
                            //so we can emit the event.
                            ch.sendToQueue(msg.properties.replyTo, out, {
                                correlationId: msg.properties.correlationId
                            });

                            //Acknowledge the job done with the message.
                            ch.ack(msg);
                        });
                });
            });
    });