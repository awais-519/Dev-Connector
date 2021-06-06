const express = require("express");
const router = express.Router();
const config = require("config");
const request = require("request");
const Profile = require("../../models/Profile");
const User = require("../../models/Users");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const { response } = require("express");

//@ROUTE GET API/PROFILE/ME
//DESC: GET USER LOGGED IN USER PROFILE
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

		//DESTRUCTING IN JS
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

//@ROUTE: GET API/PROFILE/user/:userId
//@DESC:  GET PROFILE BY USER ID
//@ACCESS PUBLIC

router.get("/user/:userId", async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.params.userId }).populate(
			"user",
			["name", "avatar"]
		);
		if (!profile) {
			return res
				.status(401)
				.send("There is no profile available for this user.");
		}
		return res.json(profile);
	} catch (e) {
		if (e.kind == "ObjectId") {
			return res
				.status(401)
				.send("There is no profile available for this user.");
		}
		res.status(500).send("SERVER ERROR");
	}
});

//@ROUTE: DELETE API/PROFILE
//@DESC:  DELETE USER PROFILE POSTS AND HIMSELF
//@ACCESS PRIVATE

router.delete("/", auth, async (req, res) => {
	try {
		//TODO: DELETE ALL THE POSTS OF THAT USER

		//DELETE USER PROFILE
		await Profile.findOneAndDelete({ user: req.user.id });

		//DELETE THE USER
		await User.findOneAndDelete({ _id: req.user.id });

		return res.send("USER DATA DELETED");
	} catch (e) {
		console.log(e);
		res.status(500).send("SERVER ERROR");
	}
});

//@ROUTE: PUT API/PROFILE/EXPERIENCE
//@DESC:  ADDING EXPERIENCE IN THE PROFILE
//@ACCESS PRIVATE
router.put(
	"/experience",
	[
		auth,
		[
			check("title", "TITLE IS REQUIRED!").not().isEmpty(),
			check("company", "COMPANY IS RQUIRED!").not().isEmpty(),
			check("from", "FROM-DATE is required!").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { title, company, location, from, to, current, description } =
			req.body;

		const newExp = { title, company, location, from, to, current, description };

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			//UNSHIFT will put the new Experience first before everyone
			profile.experience.unshift(newExp);
			await profile.save();

			res.json(profile);
		} catch (err) {
			res.status(400).send("Server Error");
		}
	}
);

//@ROUTE: DELETE API/PROFILE/EXPERIENCE/:EXP_ID
//@DESC:  DELETE USER EXPERIENCE FORM PROFILE
//@ACCESS PRIVATE
router.delete("/experience/:exp_id", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		const index = profile.experience
			.map((item) => item.id)
			.indexOf(req.params.exp_id);
		profile.experience.splice(index, 1);

		await profile.save();

		res.json(profile);
	} catch (err) {
		console.log(err);
		res.status(400).send("SERVER ERROR");
	}
});

//@ROUTE: PUT API/PROFILE/EXPERIENCE
//@DESC:  ADD THE EDUCATION IN THE PROFILE
//@ACCESS PRIVATE
router.put(
	"/education",
	[
		auth,
		[
			check("school", "school IS REQUIRED!").not().isEmpty(),
			check("degree", "degree IS RQUIRED!").not().isEmpty(),
			check("fieldofstudy", "field  IS REQUIRED!").not().isEmpty(),
			check("from", "FROM-DATE is required!").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { school, degree, fieldofstudy, from, to, current, description } =
			req.body;

		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			//UNSHIFT will put the new education first before everyone
			profile.education.unshift(newEdu);
			await profile.save();

			res.json(profile);
		} catch (err) {
			res.status(400).send("Server Error");
		}
	}
);

//@ROUTE: DELETE API/PROFILE/EXPERIENCE/:EDU_ID
//@DESC:  DELETE USER EDUCATION FORM PROFILE
//@ACCESS PRIVATE
router.delete("/education/:edu_id", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		const index = profile.education
			.map((item) => item.id)
			.indexOf(req.params.edu_id);
		profile.education.splice(index, 1);

		await profile.save();

		res.json(profile);
	} catch (err) {
		console.log(err);
		res.status(400).send("SERVER ERROR");
	}
});

//@ROUTE: GET API/PROFILE/GITHUB/:USERNAME
//@DESC:  GET USER REPOS FROM GITHUB
//@ACCESS PUBLIC
router.get("/github/:un", (req, res) => {
	try {
		//HERE THE `REQUEST` PACKAGE WILL BE USED TO DO THE REQUEST TO THE GITHUB API
		const options = {
			uri: `https://api.github.com/users/${
				req.params.un
			}/repos?per_page=5&sort=created:asc&
			client_id=${config.get("githubClientId")}&
			client_secret=${config.get("githubSecret")}`,
			method: "GET",
			headers: { "user-agent": "node-js" },
		};

		request(options, (error, response, body) => {
			if (error) {
				console.error(error);
			}

			if (response.statusCode !== 200) {
				return response.status(404).json({ msg: "NO REPOSITORY FOUND." });
			}

			return res.json(JSON.parse(body));
		});
	} catch (err) {
		console.log(err);
		req.status(400).send("SERVER ERROR");
	}
});

module.exports = router;
