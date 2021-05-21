const express = require("express");
const connectDb = require("./config/db");

const app = express();

//CONENCTING THE DATABASE
connectDb();

app.get("/", (req, res) => res.send("API RUNNING NOW..."));

//INIT MIDDLEWARE. To get the body
app.use(express.json({ extended: false }));

app.use("/api/users", require("./routes/api/users"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/auth", require("./routes/api/auth"));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server Started on Port ${port}`));
