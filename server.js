// TODO https://adventofcode.com/2022/day/1

const express = require("express");
const app = express();

const port = 8090;
app.use(express.static(__dirname + "/assets"));
app.use(express.static(__dirname + "/client"));

app.get(["/", "/index", "/home"], (req, res) => {
	res.sendFile(__dirname + "/client/index.html");
});

app.get("/api/post/get/all", (req, res) => {
	// TODO https://stackabuse.com/reading-and-writing-json-files-with-node-js/
	res.json([
		{
			id: 0,
			title: "To the Mun",
			content:
				"We plan to go to the Mun. Not because it is easy, but because its easier than Minmus.",
			user: "Kerman",
			creationDate: 1669906884089,
			lastEdit: 1669906884089,
			likes: 0,
			liked: false,
			comments: 0,
		},
	]);
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
