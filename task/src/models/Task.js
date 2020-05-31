const mongoose = require("../../db/mongoose");
const taskSchema = new mongoose.Schema(
  {
    description: { required: true, type: String },
    completed: { required: true, type: Boolean },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
