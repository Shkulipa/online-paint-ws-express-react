const express = require("express");
const app = express();
const WSServer = require("express-ws")(app);
const aWss = WSServer.getWss();
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/image", (req, res) => {
  try {
    const data = req.body.img.replace("data:image/png;base64,", "");
    const fileName = `${req.query.id}.jpg`;

    const filePath = path.resolve(__dirname, "files");

    if(!fs.existsSync(filePath)) fs.mkdirSync(filePath, {recursive: true})

    fs.writeFileSync(
      path.resolve(__dirname, "files", fileName),
      data,
      "base64"
    );

    res.status(200).json("img loaded");
  } catch (err) {
    console.error(err);
    return res.status(500).json("error");
  }
});

app.get("/image", (req, res) => {
  try {
    const file = fs.readFileSync(path.resolve(__dirname, 'files', `${req.query.id}.jpg`))
    const data = `data:image/png;base64, ` + file.toString('base64');
    res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json("error");
  }
});

app.ws("/", (ws, req) => {
  // docs: https://learn.javascript.ru/websocket

  console.log(`WS on the Server(${PORT}) Connected!`);

  ws.send(
    JSON.stringify({
      method: "connection",
      msg: "You Succes connected!",
    })
  );

  ws.on("message", (msg) => {
    msg = JSON.parse(msg);
    console.log(msg);
    switch (msg.method) {
      case "connection":
        connectionHandler(ws, msg);
        break;
      case "draw":
        drawHandler(ws, msg);
        break;
    }
  });

  ws.on("close", (code, data) => {
    data = JSON.parse(data);
    disconnectHandler(ws, data);
  });
});

app.listen(PORT, () => console.log(`server started on PORT ${PORT}`));

/**
 * @info
 * connect
 */
const connectionHandler = (ws, msg) => {
  ws.id = msg.id;
  broadcastConnection(ws, msg);
};

const broadcastConnection = (ws, msg) => {
  aWss.clients.forEach((client) => {
    if (client.id === msg.id) {
      client.send(
        JSON.stringify({
          method: "connection",
          msg: `User ${msg.username} connected!`,
        })
      );
    }
  });
};

/**
 * @info
 * disconnect
 */
const disconnectHandler = (ws, data) => {
  aWss.clients.forEach((client) => {
    if (client.id === data.id) {
      client.send(
        JSON.stringify({
          method: "disconnectUser",
          msg: `User ${data.username} disconnected!`,
        })
      );
    }
  });
};

/**
 * @info
 * draw
 */
const drawHandler = (ws, msg) => {
  ws.id = msg.id;
  broadcastDraw(ws, msg);
};

const broadcastDraw = (ws, msg) => {
  aWss.clients.forEach((client) => {
    if (client.id === msg.id) {
      client.send(JSON.stringify(msg));
    }
  });
};
