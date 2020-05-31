const express = require("express");
const User = require("../models/User");
const router = new express.Router();
const auth = require("../middleware/auth");
const multer=require("multer");
const sharp=require("sharp")
const upload = multer({
  // dest: "images",
   limit: {
     fileSize: 1000000,
   },
   fileFilter(req, file, cb) {
     if (!file.originalname.match(/.{png|jpg|jpeg}$/))
       return cb(new Error("please upload the correct format"));
     cb(undefined, true);
   },
 });
 

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.createAuthToken();
    await user.save();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.createAuthToken();
    res.send(user);
  } catch (e) {
    res.status(401).send(e);
  }
});
router.get("/user/me", auth, async (req, res) => {
  res.send(req.user);
});

router.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    console;
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});
router.post("/user/logout/all", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});
router.delete("/user/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.patch("/user/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedProp = ["name", "password", "email"];
  const allowed = updates.every((update) => {
    return allowedProp.includes(update);
  });
  if (!allowed) {
    throw new Error({ error: "Invalid update" });
  }
  try {
    updates.forEach((update) => {
      return (req.user[update] = req.body[update]);
    });
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/user/me/avatar',auth,upload.single('Avatar'),async (req,res)=>{
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250
  }).png().toBuffer();
  req.user.avatar=buffer;
  await res.save();
  res.send()
},
(error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

module.exports = router;
