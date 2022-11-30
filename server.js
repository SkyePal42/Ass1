const express = require("express");
const app = express();

const port = 8090;
app.use(express.static(__dirname + "/assets"));

app.get(["/", "/index", "/index.html", "home"], (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.get("", (req, res) => {});

app.get("/*", (req, res) => {
	res.sendFile(__dirname + "/404.html");
});

app.listen(port, () => {
	console.log(`ASS1 running on port ${port}`);
});
