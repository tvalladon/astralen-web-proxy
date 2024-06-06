const WebSocketServer = require("websocket").server;
const http = require("http");
const net = require("net");

const server = http.createServer((req, res) => {
    res.writeHead(404);
    res.end();
});

server.listen(80, () => {
    console.log("Listening on port 80");
});

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
});

wsServer.on("request", (request) => {
    const wsConnection = request.accept(null, request.origin);
    const telnetConnection = net.createConnection({ port: 3000, host: "connect.astralen.quest" });

    wsConnection.on("message", (message) => {
        if (message.type === "utf8") {
            telnetConnection.write(message.utf8Data);
        } else if (message.type === "binary") {
            telnetConnection.write(message.binaryData);
        }
    });

    telnetConnection.on("data", (data) => {
        wsConnection.sendBytes(data);
    });

    telnetConnection.on("close", () => {
        wsConnection.close();
    });

    wsConnection.on("close", () => {
        telnetConnection.end();
    });

    wsConnection.on("error", (error) => {
        console.error("WebSocket error:", error);
        telnetConnection.end();
    });

    telnetConnection.on("error", (error) => {
        console.error("Telnet error:", error);
        wsConnection.close();
    });
});
