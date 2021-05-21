const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/Users");
const auth = require("../../middleware/auth");

//@ROUTE GET API/PROFILE/ME
//DESC GET CURRENT USER PROFILE
//@ACCESS PRIVATE

router.get("/me", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate(
			"user",
			["name", "avatar"]
		); //POPULATE -> LIKE AN EXTENDING THINGS IN PROFILE BY FIRST PARAM AS THE MODEL WHERE YOU ARE GETTING ADDITIONAL THINGS
		//AND SECOND PARAM IS THOSE THINGS

		if (!profile) {
			return res.status(400).json({ msg: "THERE IS NO PROFILE FOR THIS USER" });
		}

		res.json(profile);
	} catch (err) {
		res.status(500).send({ msg: "SERVER ERROR" });
	}
});

module.exports = router;
