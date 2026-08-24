const mongoose = require('mongoose')


const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    company: {
        type: String,
        required: true,
    },
    location: {
        type:String,
        required:true,
    },
    salary:{
        type:Number,
        required:true,
    },
    skills: [
        {
            type:String,
            required:true,
    }
],
    employment:{
        type:String,
        enum: ["Full Time", "Part Time", "Internship", "Contract"]
    },
    status:{
        type:String,
        required:true,
    },
    
    // createdBy: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "user",
    //         required: true
    //     }

})

const jobModel = mongoose.model("job",jobSchema);

module.exports = jobModel;