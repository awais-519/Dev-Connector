const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/Users");

router.get("/", auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password"); //MINUS SIGN WILL IGNORE THE PASSWORD AND WILL NOT RETURN IT
		res.json(user);
	} catch (err) {
		console.log(err.message);
		res.status(500).send("Server Error");
	}
});

module.exports = router;
