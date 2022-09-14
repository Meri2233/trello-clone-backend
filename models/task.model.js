const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    assignedTo:[{type:String}],
    dueDate:{
        type:Date,
        require:true
    },
    labels:[{type:String}],
    imageUrl:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    modifiedAt:{
        type:Date,
        default:Date.now
    }
})

const taskModel = mongoose.model('Task',taskSchema);

module.exports = taskModel;