const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/Users");
const Post = require("../../models/Posts");

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
			res.status(400).send("SERVER ERROR");
		}
	}
);

module.exports = router;
