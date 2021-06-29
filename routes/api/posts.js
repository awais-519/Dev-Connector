const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/Users");
const Post = require("../../models/Posts");
const { remove } = require("../../models/Profile");

//@POST API/POSTS/
//@DESC: POSTING SOMETHING ON THE DEVCONNECTOR

router.post(
	"/",
	[auth, check("text", "Text is requied!").not().isEmpty()],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select("-password");

			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			});

			const post = await newPost.save();
			return res.json(post);
		} catch (e) {
			console.log(e);
			res.status(500).send("SERVER ERROR");
		}
	}
);

//@GET API/POSTS/
//@DESC GET ALL THE POSTS OF ALL USERS

router.get("/", auth, async (req, res) => {
	try {
		//DATE : - 1 will give you the sorted posts as the most recent first
		const posts = await Post.find().sort({ date: -1 });
		return res.json(posts);
	} catch (e) {
		console.log(e);
		res.status(500).send("SERVER ERROR");
	}
});

//@GET    API/POSTS/:ID
//@DESC:  FINF POST BY ID

router.get("/:id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).send("NO POST FOUND!");
		}
		return res.json(post);
	} catch (e) {
		console.error(e);

		//IF THE POST ID IS INVALID
		if (e.kind === "ObjectId") {
			return res.status(404).send("NO POST FOUND!");
		}
		res.status(500).send("SERVER ERROR");
	}
});

//@DELETE    API/POSTS/:ID
//@DESC:     DELETE POST BY ID
//@ACCESS:   PRUVATE

router.delete("/:id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		//CHECK THE USER WHO SENDS THIS REQUEST IS THE SAME USER AS THE LOGGED IN USER
		if (post.user.toString() !== req.user.id) {
			return res.status(401).send("UNAUTHORIZED USER");
		}

		if (!post) {
			return res.status(404).send("NO POST FOUND!");
		}

		await post.remove();
		return res.send("POST IS REMOVED!");
	} catch (e) {
		console.error(e);

		//IF THE POST ID IS INVALID
		if (e.kind === "ObjectId") {
			return res.status(404).send("NO POST FOUND!");
		}
		res.status(500).send("SERVER ERROR");
	}
});

//@PUT       API/POSTS/Like/:ID
//@DESC:     LIKE A POST
//@ACCESS:   PRIVATE

router.put("/Like/:id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		//check if the post has alredy been liked
		if (
			post.likes.filter((like) => like.user.toString() === req.user.id).length >
			0
		) {
			return res.status(400).json({ msg: "POST ALREADY LIKED" });
		}

		//UNSIHIFT WILL PUT THAT LIKE TO THE BEGINNING
		post.likes.unshift({ user: req.user.id });
		await post.save();

		return res.json(post.likes);
	} catch (err) {
		console.log(err);
		res.status(500).send("Server Error");
	}
});

//@PUT    API/POSTS/unlike/:ID
//@DESC:     UNLIKE A POST
//@ACCESS:   PRIVATE

router.put("/unlike/:id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		//check if the post have a like
		if (
			post.likes.filter((like) => like.user.toString() === req.user.id)
				.length === 0
		) {
			return res.status(400).json({ msg: "POST NOT LIKED YET." });
		}

		const removeIndex = post.likes
			.map((like) => like.user.toString())
			.indexOf(req.user.id);

		post.likes.splice(removeIndex, 1);

		await post.save();

		return res.json(post.likes);
	} catch (err) {
		console.log(err);
		res.status(500).send("Server Error");
	}
});

//@POST API/POSTS/COMMENT/:ID
//@DESC: COMMENT ON A POST
//ACCESS: PRIVATE

router.post(
	"/comment/:id",
	[auth, check("text", "Text is requied!").not().isEmpty()],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select("-password");
			const post = await Post.findById(req.params.id);

			const newComment = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			});

			post.comments.unshift(newComment);
			await post.save();
			return res.json(post.comments);
		} catch (e) {
			console.log(e);
			res.status(500).send("SERVER ERROR");
		}
	}
);

//@POST   API/POSTS/COMMENT/:ID/:COMMENT_ID
//@DESC:  DELETE A COMMENT ON A POST
//ACCESS: PRIVATE
router.delete("/comments/:id/:comment_id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		const comment = post.comments.find(
			(comm) => comm.id === req.params.comment_id
		);

		if (!comment) {
			return res.status(404).json({ msg: "NO COMMENT FOUND!" });
		}

		if (comment.user.toString() !== req.user.id) {
			return res.status(404).json({ msg: "NOT AUTHORIZED." });
		}

		const removeIndex = post.comments
			.map((comm) => comm.user.toString())
			.indexOf(req.user.id);

		post.comments.splice(removeIndex, 1);

		await post.save();
		return res.json(post.comments);
	} catch (err) {
		console.log(err);
		res.status(500).send("SERVER ERROR.");
	}
});

module.exports = router;
