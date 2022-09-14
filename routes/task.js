const express = require('express');
const taskModel = require('../models/task.model');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
})
const uploads = multer({ storage: storage });

router.post('/add', uploads.single('image'), async (req, res) => {
    let uploadedfile = process.env.BASE_URL + 'uploads/' + req.file.filename;
    const { title, description, dueDate, labels, assignedTo } = req.body;

    if (!title || !dueDate || !labels || !assignedTo || !description) {
        res.status(400).send("Required Fields");
    }
    
    const newTask = new taskModel({
        title: title,
        description: description,
        dueDate: dueDate,
        owner: req.userInfo.id,
        labels: labels,
        assignedTo: assignedTo,
        imageUrl: uploadedfile,
        status: "todo"
    })
    try {
        const savedTask = await newTask.save();
        res.status(200).send("New task added");
        return;
    }
    catch (e) {
        res.status(501).send(e.message);
        return;
    }
});

router.get('/pending', async (req, res) => {
    const pendingTasks = await taskModel.find({ status: "todo" });
    res.status(200).send(pendingTasks);
});

router.get('/inprogress', async (req, res) => {
    const inProgressTasks = await taskModel.find({ status: "in progress" });
    res.status(200).send(inProgressTasks);
});

router.get('/completed', async (req, res) => {
    const completedTasks = await taskModel.find({ status: "completed" });
    res.status(200).send(completedTasks);
});

router.post('/changestatuspending', async (req, res) => {
    const { title } = req.body;
    const task = await taskModel.findOneAndUpdate({ title: title }, { status: "pending" });
    res.status(200).send("Updated Status to Pending")
})

router.post('/changestatuscompleted', async (req, res) => {
    const { title } = req.body;
    const task = await taskModel.findOneAndUpdate({ title: title }, { status: "completed" });
    res.status(200).send("Updated status to completed")
})

module.exports = router;