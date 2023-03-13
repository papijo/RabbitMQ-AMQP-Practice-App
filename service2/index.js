const express = require("express");
const app = express();
const amqp = require("amqplib");
let channel,
  connection,
  exchange = "exchange";

connect();
async function connect() {
  try {
    const amqpserver = "amqp://localhost:5672";
    connection = await amqp.connect(amqpserver);
    channel = await connection.createChannel();
    await channel.assertQueue("fb");
    await channel.assertQueue("rabbit");
    channel.consume("rabbit", (data) => {
      console.log(`Received: ${Buffer.from(data.content)}`);
      channel.ack(data);
      a = { message: "Message Gotten", acknowledged: true };
      channel.sendToQueue("fb", Buffer.from(JSON.stringify(a)));
    });
  } catch (error) {
    console.log(error);
  }
}

app.get("/send", (req, res) => {});

app.listen(5002, () => {
  console.log(`Server running at 5002`);
});
