const express = require("express");
const Task = require("../models/Task");
const User = require("../models/User");
const router = new express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? 1 : -1;
  }
  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.get("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.patch("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    const updates = Object.keys(req.body);
    const allowedProp = ["description", "completed"];
    const allowed = updates.every((update) => {
      return allowedProp.includes(update);
    });

    if (!allowed) {
      throw new Error({ error: "Invalid update" });
    }
    updates.forEach((update) => {
      return (task[update] = req.body[update]);
    });
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
