// TODO https://adventofcode.com/2022/day/1

const express = require("express");
const app = express();
const jsonfile = require("jsonfile");

const port = 8090;
app.use(express.json());
app.use(express.static(__dirname + "/assets"));
app.use(express.static(__dirname + "/client"));
app.use(express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free"));

app.get(["/", "/index", "/home"], (req, res) => {
	res.sendFile(__dirname + "/client/index.html");
});

app.get("/api/post/get/all/:user", (req, res) => {
	let user = req.params.user;

	const file = __dirname + "/data.json";
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

function removeItemOnce(arr, value) {
	var index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
	}
	return arr;
}

app.post("/api/post/like", (req, res) => {
	const file = __dirname + "/data.json";
	jsonfile.readFile(file, (err, data) => {
		if (err) console.error(err);
		if (req.body.post < data.posts.length) {
			if ("user" in req.body && req.body.user) {
				let post = data.posts[req.body.post];
				if (post.likes.includes(req.body.user)) {
					post.likes = removeItemOnce(post.likes, req.body.user);
				} else {
					post.likes.push(req.body.user);
				}
				res.json({
					status: 200,
					liked: post.likes.includes(req.body.user),
					likes: post.likes.length,
				});
				data.posts[req.body.post] = post;
				jsonfile.writeFile(file, data, function (err) {
					if (err) console.error(err);
				});
			} else {
				res.json({ status: 400, message: "Invalid Username" });
			}
		} else {
			res.json({ status: 404, message: "Array OutOfBounds" });
		}
	});
});

app.post("/api/post/add", (req, res) => {
	const file = __dirname + "/data.json";
	jsonfile.readFile(file, (err, data) => {
		if (err) console.error(err);
		data.posts.push({
			title: req.body.title,
			content: req.body.content,
			user: req.body.user,
			creationDate: Date.now(),
			lastEdit: Date.now(),
			likes: [],
			comments: [],
		});
		jsonfile.writeFile(file, data, function (err) {
			if (err) console.error(err);
		});
	});

	res.sendStatus(200);
});

app.post("/api/post/comment/add", (req, res) => {
	const file = __dirname + "/data.json";
	jsonfile.readFile(file, (err, data) => {
		if (err) console.error(err);
		data.posts.push({
			comment: req.body.comment,
			user: req.body.user,
			creationDate: Date.now(),
		});
		jsonfile.writeFile(file, data, function (err) {
			if (err) console.error(err);
		});
	});

	res.sendStatus(200);
});

app.get("/api/post/comment/get/:post", (req, res) => {
	const file = __dirname + "/data.json";
	jsonfile.readFile(file, (err, data) => {
		if (err) console.error(err);
		res.json(data.posts[req.params.post].comments);
		// case handling for if not a valid post
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
