// TODO https://adventofcode.com/2022/day/1

const express = require("express");
const app = express();
const jsonfile = require("jsonfile");

const port = 8090;
app.use(express.static(__dirname + "/assets"));
app.use(express.static(__dirname + "/client"));
app.use(express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free"));

app.get(["/", "/index", "/home"], (req, res) => {
	res.sendFile(__dirname + "/client/index.html");
});

app.get("/api/post/get/all/:user", (req, res) => {
	let user = req.params.user;

	const file = __dirname + "/data.json";
	var data;
	jsonfile.readFile(file, (err, data) => {
		if (err) console.error(err);

		let posts = [];
		data.posts.forEach((post, index) => {
			posts.push({
				id: index,
				title: post.title,
				content: post.content,
				user: post.user,
				creationDate: post.creationDate,
				lastEdit: post.lastEdit,
				likes: post.likes.length,
				liked: post.likes.includes(user),
				comments: post.comments.length,
			});
		});

		res.json(posts);
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
