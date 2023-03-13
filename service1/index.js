const express = require("express");
const app = express();
const amqp = require("amqplib");
var bodyParser = require("body-parser");
let channel,
  connection,
  feedback,
  exchange = "exchange";

var jsonParser = bodyParser.json();

connect();
async function connect() {
  try {
    const amqpserver = "amqp://localhost:15672";
    connection = await amqp.connect(amqpserver);
    channel = await connection.createChannel();
    // await channel.assertQueue("rabbit");
    // await channel.assertQueue("fb");
    await channel.assertExchange(exchange, "direct", { durable: false });
  } catch (error) {
    console.log(error);
  }
}

app.use(express.json());

app.post("/send", async (req, res) => {
  const fakeData = {
    name: "Dreams",
    company: "Dreams take time",
  };

  try {
    await channel.sendToQueue("rabbit", Buffer.from(JSON.stringify(req.body)));
    //   await channel.close();
    //   connection.close();
    // res.json({ message: "Message Sent" });
    // await channel.publish(
    //   exchange,
    //   "rabbit",
    //   Buffer.from(JSON.stringify(req.body))
    // );
    console.log("Message Sent", req.body);

    await channel.consume("fb", async (data) => {
      // console.log(`${Buffer.from(data.content)}`);

      feedback = await JSON.parse(`${Buffer.from(data.content)}`);
      channel.ack(data);
      console.log("feedback: ", feedback);
      res.status(200).json(feedback);
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(5001, () => {
  console.log(`Server running at 5001`);
});
