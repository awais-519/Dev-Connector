const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/Users");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

//@POST     REQUEST Post api/users
//@DESC     REGISTER USER
//@ACCESSS  PUBLIC

router.post(
	"/",
	[
		check("name", "Name is Required!!").not().isEmpty(),
		check("password", "Password must be greater than 4 characters!!").isLength({
			min: 5,
		}),
		check("email", "A valid email is required").isEmail(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;
		//CHECK IF USER ALRADY EXISTS
		try {
			let user = await User.findOne({ email });
			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: "USER ALREADY EXISTS!!" }] });
			}

			//GIVING AVATAR
			const avatar = gravatar.url(email, {
				s: "200", //SIZE
				r: "pg", //RATING
				d: "mm", //DEFAULT
			});

			user = new User({
				name,
				email,
				password,
				avatar,
			});

			//ENCRYPTING PASSWORD
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);

			await user.save();

			//GENERATING JWT TOKEN
			const payload = { user: { id: user.id } };

			jwt.sign(
				payload,
				config.get("jwtSecret"),
				{ expiresIn: 36000 },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.log(err);
			res.status(500).send("Server error");
		}
	}
);

module.exports = router;
