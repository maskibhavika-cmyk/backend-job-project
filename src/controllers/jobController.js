const jobModel = require("../models/jobModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const createJobController = async (req, res) => {

    try{

        const {title,description,company,location,salary,skills,employmentType,status} = req.body

        if(!title|| !description|| !company|| !location|| !salary|| !skills|| !employmentType) {
            return res.status(400).send({
                success: false,
                message: 'Please provide category All'
            })
        }
        const newJob = new jobModel({title,description,company,location,salary,skills,employmentType,status,createdBy:req.user.id})
        await newJob.save()
        res.status(201).send({
            success: true,
            message:'Job created successfully',
            newJob
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
        success:false,
        message:"Error in create job API",
        error,

        })
    }

}

// const getAllJobsController = async (req , res ) => {
//     try{
//         const jobs = await jobModel.find({})
//         if(!jobs){
//             return res.status(404).send({
//                 success:false,
//                 message:'no jobs was found'
//             })
        // }
//         res.status(200).send({
//             success:true,
//             totalFoods: jobs.length,
//             jobs,
//         })

//     } catch (error) {
//         console.log(error)
//         res.status(500).send({
//             success:false,
//             message:'Error in get all jobs api',
//             error
//         })
//     }
// }

// const getAllJobsController = async (req, res) => {
//     try {

//         // Postman se title, company aur salary lena
//         const { title, company, salary, sort } = req.query;

//         // Starting me empty filter
//         let filter = {};

//         // Title ke according filter
//         if (title) {
//             filter.title = {
//                 $regex: title,
//                 $options: "i"
//             };
//         }

//         // Company ke according filter
//         if (company) {
//             filter.company = {
//                 $regex: company,
//                 $options: "i"
//             };
//         }

//         // Salary ke according filter
//         if (salary) {
//             filter.salary = Number(salary);
//         }

//         // Filter ke according jobs find karna
//         const jobs = await jobModel.find(filter).sort(
//     sort === "asc" ? { salary: 1 } : { salary: -1 }
// );

//         // Agar koi job nahi mili
//         if (jobs.length === 0) {
//             return res.status(404).send({
//                 success: false,
//                 message: "No jobs found"
//             });
//         }

//         // Jobs mil gayi
//         res.status(200).send({
//             success: true,
//             totalJobs: jobs.length,
//             jobs
//         });

//     } catch (error) {

//         console.log(error);

//         res.status(500).send({
//             success: false,
//             message: "Error in get all jobs api",
//             error
//         });
//     }
// };
const getAllJobsController = async (req, res) => {
    try {

       const { company, page = 1, limit = 5 } = req.query;
        let filter = {};

        if (company) {
    filter.company = {
        $regex: company,
        $options: "i"
    };
}
const skip = (page - 1) * limit;

        // if (company) {
        //     filter.company = {
        //         $regex: company,
        //         $options: "i"
        //     };
        // }

        const totalJobs = await jobModel.countDocuments(filter);
        
        const jobs = await jobModel.find(filter).skip(skip).limit(Number(limit));

        if (jobs.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No jobs found for this company"
            });
        }

        res.status(200).send({
            success: true,
            totalJobs: jobs.length,
            jobs
        });

    } catch (error) {

        console.log(error);

        res.status(500).send({
            success: false,
            message: "Error in get all jobs API",
            error
        });
    }
};

const getSingleJobController = async (req, res) => {
    try{
        const jobId = req.params.id
        if(!jobId){
            return res.status(404).send({
                success:false,
                message:'No ID found'
            })
        }
        const job = await jobModel.findById(jobId)
        if(!job){
            return res.status(404).send({
                success:false,
                message:'No job found with this id'
            })
        }

        res.status(200).send({
            success:true,
            job,
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error in get single job Api',
            error
        })
    }
}

const updateJobController = async (req, res) => { 
    try{
        const {id} = req.params
        const {title,company} = req.body
        const updatedJob = await jobModel.findByIdAndUpdate(id,{title,company},{new:true})
        if(!updatedJob){
            return res.status(500).send({
                success:false,
                message:'No Job found'
            })
        }
        res.status(200).send({
            success:true,
            meesage:'Job updated successfully'
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error in update Job api',
            error
        })
    }
}

const deletejobController = async (req, res) => {
    try{
        const {id} = req.params
        if(!id){
            return res.status(500).send({
                success:false,
                message:'Please provide job id'
            })
        }
        const job = await jobModel.findById(id)
        if(!job){
            return res.status(500).send({
                success:false,
                message:'No job found with this id'
            })
        }
        await jobModel.findByIdAndDelete(id)
        res.status(200).send({
            success:true,
            message:'job deleted successfully7'
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error in delete job api',
            error
        })
    }
}
// const token = jwt.sign(
//     {
//         id: user._id,
//         role: user.role
//     },
//     process.env.JWT_SECRET
// );

module.exports = {createJobController,getAllJobsController,getSingleJobController,updateJobController,deletejobController}