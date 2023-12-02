const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const TodoModel = require("./models/TodoModel");
const UserModel = require("./models/UserModel");
const jwt = require("jsonwebtoken");
const app = express();
const auth = require("./middleware/auth");
const cookieParser = require("cookie-parser");

require("dotenv").config();

// token generator
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "1d" });
};

// important stuff
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.options('*', cors())

app.use(express.json());
app.use(cookieParser());

// connection with mongodb
mongoose.connect(process.env.MONGO);

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

// login, signup, logout
app.post("/api/user/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.login(email, password);
    const token = createToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.json(token);
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.post("/api/user/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.signup(email, password);
    const token = createToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.json(token);
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get("/api/user/logout", async (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: "none",
    })
    .send();
});
app.get("/api/user/loggedIn", (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.json(false);

    jwt.verify(token, process.env.SECRET);

    res.send(true);
  } catch (err) {
    res.json(false);
  }
});
// requests
app.get("/", auth, async (req, res) => {
  try {
    const todoList = await TodoModel.find({});
    res.json(todoList);
  } catch (err) {
    res.json(err);
  }
});

app.post("/createTodo", auth, async (req, res) => {
  console.log(req.user.id);
  try {
    const todo = await TodoModel.create({
      todo: req.body.todo,
      status: req.body.status,
    });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/editTodo/:id", auth, async (req, res) => {
  const id = req.params.id;
  const updateData = {
    todo: req.body.chosenTodo,
  };

  try {
    const todo = await TodoModel.findByIdAndUpdate(id, updateData);
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/handleStatus/:id", auth, async (req, res) => {
  const id = req.params.id;

  try {
    const todo = await TodoModel.findByIdAndUpdate(id, req.body);
    res.json(todo);
  } catch (err) {
    res.json(err);
  }
});

app.delete("/deleteTodo/:id", auth, async (req, res) => {
  const id = req.params.id;

  try {
    const todo = await TodoModel.findByIdAndDelete({ _id: id });
    res.json(todo);
  } catch (err) {
    res.json(err);
  }
});

// start a server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
