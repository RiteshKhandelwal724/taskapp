const express=require('express');
require('../db/mongoose')
const taskRouter=require('./routes/task');
const userRouter=require('./routes/user')
const app=express();
const port=process.env.PORT
app.use(express.json())
app.use(taskRouter)
app.use(userRouter)


app.listen(port,()=>{
    console.log("The game is on")
})