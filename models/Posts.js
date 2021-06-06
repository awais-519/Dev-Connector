const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
	//LIKE FACEBOOK UERS POST MODEL
	user: {
		type: Schema.Types.ObjectId,
		ref: "users",
	},
	text: {
		type: String,
		required: true,
	},

	name: {
		type: String,
	},
	avatar: {
		type: String,
	},
	likes: [
		{
			user: {
				type: Schema.Types.ObjectId,
				ref: "users",
			},
		},
	],
	comments: [
		{
			user: {
				type: Schema.Types.ObjectId,
				ref: "users",
			},

			text: {
				type: String,
				required: true,
			},
			name: {
				type: String,
			},
			avatar: {
				type: String,
			},
			date: {
				type: Date,
				Default: Date.now,
			},
		},
	],
	//POST DATE
	date: {
		type: Date,
		Default: Date.now,
	},
});

module.exports = Posts = mongoose.model("post", postSchema);
