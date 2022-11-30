const express = require("express");
const app = express();

const port = 8090;
app.use(express.static(__dirname + "/assets"));
app.use(express.static(__dirname + "/client"));

app.get(["/", "/index", "/home"], (req, res) => {
	res.sendFile(__dirname + "/client/index.html");
});

app.get("/post/get/all", (req, res) => {
	resp.json({
		data: "hello",
	});
});

app.get("/list", function (req, resp) {
	resp.json({
		data: "hello",
		second_data: "hello2",
	});
});

app.get("/*", (req, res) => {
	res.sendFile(__dirname + "/client/404.html");
});

app.listen(port, () => {
	console.log(`ASS1 running on port ${port}`);
});
