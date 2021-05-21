const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
	//GET TOKEN FROM HEADER
	const token = req.header("x-auth-token");

	//IF NO TOKEN
	if (!token) {
		return res
			.status(401)
			.json({ msg: "NO AUTHORIZATION TOKEN FOUND!! AUTHORIZATION DENIED" });
	}

	//IF FOUND
	//verify

	try {
		const decoded = jwt.verify(token, config.get("jwtSecret"));
		req.user = decoded.user;

		next();
	} catch (err) {
		res.send(401).json({ msg: "Token is not valid" });
	}
};
