const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/Users");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

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

//@ROUTE: POST API/PROFILE/ME
//@DESC:  CREATE/update PROFILE
//@ACCESS PRIVATE
router.post(
	"/me",
	[
		auth,
		[
			check("skills", "Skills field cannot be empty.").not().isEmpty(),
			check("status", "Status field cannot be empty.").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubUserName,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin,
		} = req.body;

		//BUILD PROFILE OBJECT
		const profileFields = {};
		profileFields.user = req.user.id;

		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubUserName) profileFields.githubUserName = githubUserName;

		if (skills) {
			profileFields.skills = skills.split(",").map((skill) => skill.trim());
		}

		//BUILD SOCIALS OBJECT
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			let profile = await Profile.findOne({ user: req.user.id });

			if (profile) {
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);
				return res.json({ profile });
			}
			//CREATE A NEW PROFILE
			profile = new Profile(profileFields);
			await profile.save();

			return res.json(profile);
		} catch (e) {
			console.log(e);
			res.status(500).send("Server Error");
		}

		return res.json(profile);
	}
);

//@ROUTE: GET API/PROFILE
//@DESC:  GET ALL PROFILES
//@ACCESS PUBLIC

router.get("/", async (req, res) => {
	try {
		const profiles = await Profile.find().populate("user", ["name", "avatar"]);
		return res.json(profiles);
	} catch (e) {
		console.log(e);
		res.status(500).send("SERVER ERROR");
	}
});

module.exports = router;
