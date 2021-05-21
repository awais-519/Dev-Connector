const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const User = require("../../models/Users");
const config = require("config");

//getting user data after checking the token
router.get("/", auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password"); //MINUS SIGN WILL IGNORE THE PASSWORD AND WILL NOT RETURN IT
		res.json(user);
	} catch (err) {
		console.log(err.message);
		res.status(500).send("Server Error");
	}
});

//@POST     REQUEST Post api/auth
//@DESC     AUTHENTICATE USER AND GET TOKEN
//@ACCESSS  PUBLIC

router.post(
	"/",
	[
		check("password", "INVALID ENTRY IN THE PASSWORD FIELD!!").exists(),
		check("email", "A valid email is required").isEmail(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;
		//CHECK IF USER ALRADY EXISTS
		try {
			let user = await User.findOne({ email });
			if (!user) {
				return res
					.status(400)
					.json({ errors: [{ msg: "Invalid Credentials" }] });
			}

			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				return res
					.status(400)
					.json({ errors: [{ msg: "Invalid Credentials" }] });
			}

			//GENERATING JWT TOKEN
			const payload = await { user: { id: user.id } };

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
