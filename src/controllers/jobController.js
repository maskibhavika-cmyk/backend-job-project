const jobModel = require("../models/jobModel");

const { jobQueue } = require("../queues/jobQueue");
const { emailQueue } = require("../queues/emailQueue");

const { redis } = require("../config/redis");

const createJobController = async (req, res) => {
    try {

        const {  title, description, company,location, salary, skills,status, delay } = req.body;

        // Required fields
        if (
            !title ||
            !description ||
            !company ||
            !location ||
            !salary ||
            !skills ||
            !employment ||
            !priority
        ) {
            return res.status(400).send({
                success: false,
                message: "Please provide all required fields"
            });
        }


        // Priority validation
        if (!["high", "normal", "low"].includes(priority)) {
            return res.status(400).send({
                success: false,
                message: "Priority must be high, normal or low"
            });
        }


        // Create job
        const newJob = new jobModel({
    title,
    description,
    company,
    location,
    salary,
    skills,
    employmentType,
    status: "pending",
    progress: 0,
    createdBy: req.user.id
});

        // Save job in MongoDB
        await newJob.save();

        console.log("Job saved in database:", newJob._id);


        // =========================
        // PRIORITY
        // =========================

        const priorityMap = {
            high: 1,
            normal: 10,
            low: 20
        };


        // =========================
        // JOB QUEUE
        // =========================

        await jobQueue.add(
            "job-created",
            {
                jobId: newJob._id.toString(),
                company: newJob.company,
                title: newJob.title,
                priority: priority
            },
            {
                priority: priorityMap[priority],
                delay: Number(delay) || 0
            }
        );

        console.log(
            `Job added to queue | Priority: ${priority} | Delay: ${Number(delay) || 0}ms`
        );


        // =========================
        // EMAIL QUEUE
        // =========================

        await emailQueue.add(
            "job-email",
            {
                jobId: newJob._id.toString(),
                company: newJob.company,
                title: newJob.title
            }
        );

        console.log("Job added to emailQueue successfully");


        // =========================
        // CLEAR REDIS CACHE
        // =========================

        const keys = await redis.keys("jobs:*");

        if (keys.length > 0) {
            await redis.del(keys);
            console.log("Job cache cleared");
        }


        // =========================
        // RESPONSE
        // =========================

        return res.status(201).send({
            success: true,
            message: "Job created successfully",
            priority,
            delay: Number(delay) || 0,
            newJob
        });


    } catch (error) {

        console.log(error);

        return res.status(500).send({
            success: false,
            message: "Error in create job API",
            error: error.message
        });
    }
};
// =========================
// GET ALL JOBS
// =========================

const getAllJobsController = async (req, res) => {
    try {

        const {
            company,
            page = 1,
            limit = 5
        } = req.query;


        // Redis cache key
        const cacheKey =
            `jobs:${company || "all"}:page:${page}:limit:${limit}`;


        // =========================
        // CHECK REDIS CACHE
        // =========================

        const cachedJobs = await redis.get(cacheKey);


        if (cachedJobs) {

            console.log("Jobs fetched from Redis cache");

            return res.status(200).send({
                success: true,
                source: "redis",
                ...JSON.parse(cachedJobs)
            });
        }


        // =========================
        // MONGODB FILTER
        // =========================

        let filter = {
            isDeleted: { $ne: true }
        };


        // Company search
        if (company) {

            filter.company = {
                $regex: company,
                $options: "i"
            };

        }


        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        const skip =
            (pageNumber - 1) * limitNumber;


        // =========================
        // TOTAL JOBS
        // =========================

        const totalJobs =
            await jobModel.countDocuments(filter);


        // =========================
        // GET JOBS
        // =========================

        const jobs = await jobModel
            .find(filter)
            .skip(skip)
            .limit(limitNumber)
            .sort({ createdAt: -1 });


        if (jobs.length === 0) {

            return res.status(404).send({
                success: false,
                message: "No jobs found"
            });

        }


        const responseData = {

            totalJobs,

            currentPage: pageNumber,

            limit: limitNumber,

            totalPages:
                Math.ceil(totalJobs / limitNumber),

            jobs
        };


        // =========================
        // SAVE TO REDIS
        // =========================

        await redis.set(
            cacheKey,
            JSON.stringify(responseData),
            {
                EX: 60
            }
        );


        console.log(
            "Jobs fetched from MongoDB and saved in Redis"
        );


        return res.status(200).send({

            success: true,

            source: "mongodb",

            ...responseData
        });


    } catch (error) {

        console.log(error);

        return res.status(500).send({

            success: false,

            message: "Error in get all jobs API",

            error: error.message
        });
    }
};



// =========================
// GET SINGLE JOB
// =========================

const getSingleJobController = async (req, res) => {
    try {

        const { id } = req.params;


        if (!id) {

            return res.status(400).send({
                success: false,
                message: "Please provide job id"
            });

        }


        // Redis key
        const cacheKey = `job:${id}`;


        // Check Redis
        const cachedJob = await redis.get(cacheKey);


        if (cachedJob) {

            console.log("Single job fetched from Redis");

            return res.status(200).send({
                success: true,
                source: "redis",
                job: JSON.parse(cachedJob)
            });

        }


        // MongoDB
        const job = await jobModel.findOne({

            _id: id,

            isDeleted: { $ne: true }

        });


        if (!job) {

            return res.status(404).send({
                success: false,
                message: "No job found with this id"
            });

        }


        // Save single job in Redis
        await redis.set(
            cacheKey,
            JSON.stringify(job),
            {
                EX: 60
            }
        );


        console.log(
            "Single job fetched from MongoDB and saved in Redis"
        );


        return res.status(200).send({

            success: true,

            source: "mongodb",

            job
        });


    } catch (error) {

        console.log(error);

        return res.status(500).send({

            success: false,

            message: "Error in get single job API",

            error: error.message
        });
    }
};



// =========================
// UPDATE JOB
// =========================

const updateJobController = async (req, res) => {
    try {

        const { id } = req.params;


        const {
            title,
            description,
            company,
            location,
            salary,
            skills,
            employment,
            status
        } = req.body;


        const updatedJob =
            await jobModel.findOneAndUpdate(

                {
                    _id: id,

                    isDeleted: { $ne: true }
                },

                {
                    title,
                    description,
                    company,
                    location,
                    salary,
                    skills,
                    employment,
                    status
                },

                {
                    new: true,
                    runValidators: true
                }
            );


        if (!updatedJob) {

            return res.status(404).send({
                success: false,
                message: "No job found"
            });

        }


        // Clear all jobs cache
        const keys =
            await redis.keys("jobs:*");

        if (keys.length > 0) {
            await redis.del(keys);
        }


        // Clear single job cache
        await redis.del(`job:${id}`);


        console.log("Job Redis cache cleared");


        return res.status(200).send({

            success: true,

            message: "Job updated successfully",

            updatedJob
        });


    } catch (error) {

        console.log(error);

        return res.status(500).send({

            success: false,

            message: "Error in update job API",

            error: error.message
        });
    }
};



// =========================
// UPDATE JOB STATUS
// =========================

const updateJobStatusController = async (req, res) => {
    try {

        const { id } = req.params;

        const { status } = req.body;


        if (!status) {

            return res.status(400).send({
                success: false,
                message: "Please provide status"
            });

        }


        if (
            !["Open", "Closed", "Paused"]
                .includes(status)
        ) {

            return res.status(400).send({

                success: false,

                message:
                    "Invalid status. Use Open, Closed or Paused"

            });

        }


        const job =
            await jobModel.findOneAndUpdate(

                {
                    _id: id,

                    isDeleted: { $ne: true }
                },

                {
                    status
                },

                {
                    new: true,

                    runValidators: true
                }
            );


        if (!job) {

            return res.status(404).send({

                success: false,

                message: "Job not found"
            });

        }


        // Clear cache
        await redis.del(`job:${id}`);

        const keys =
            await redis.keys("jobs:*");

        if (keys.length > 0) {
            await redis.del(keys);
        }


        return res.status(200).send({

            success: true,

            message: "Job status updated successfully",

            job
        });


    } catch (error) {

        console.log(error);

        return res.status(500).send({

            success: false,

            message: "Error in update job status API",

            error: error.message
        });
    }
};



// =========================
// DELETE JOB - SOFT DELETE
// =========================

const deletejobController = async (req, res) => {
    try {

        const { id } = req.params;


        if (!id) {

            return res.status(400).send({

                success: false,

                message: "Please provide job id"
            });

        }


        const job =
            await jobModel.findById(id);


        if (!job) {

            return res.status(404).send({

                success: false,

                message: "No job found with this id"
            });

        }


        if (job.isDeleted) {

            return res.status(400).send({

                success: false,

                message: "Job is already deleted"
            });

        }


        await jobModel.findByIdAndUpdate(

            id,

            {
                isDeleted: true
            },

            {
                new: true
            }
        );


        // Clear Redis cache
        await redis.del(`job:${id}`);


        const keys =
            await redis.keys("jobs:*");

        if (keys.length > 0) {
            await redis.del(keys);
        }


        console.log("Deleted job cache cleared");


        return res.status(200).send({

            success: true,

            message: "Job deleted successfully"
        });


    } catch (error) {

        console.log(error);

        return res.status(500).send({

            success: false,

            message: "Error in delete job API",

            error: error.message
        });
    }
};
const cancelJobController = async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required"
            });
        }

        // MongoDB se job find karo
        const job = await jobModel.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        // Already cancelled
        if (job.status === "cancelled") {
            return res.status(400).json({
                message: "Job is already cancelled"
            });
        }

        // Database job ko cancelled karo
        job.status = "cancelled";

        await job.save();

        return res.status(200).json({
            success: true,
            message: "Job cancelled successfully",
            job
        });

    } catch (error) {
        console.error("Cancel Job Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error cancelling job",
            error: error.message
        });
    }
};


// =========================
// EXPORT
// =========================

module.exports = {

    createJobController,

    getAllJobsController,

    getSingleJobController,

    updateJobController,

    updateJobStatusController,

    deletejobController,
    cancelJobController

};