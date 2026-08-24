
const express = require('express');

const { createJobController, getAllJobsController, getSingleJobController, updateJobController, deletejobController } = require('../controllers/jobController');

const { authMiddleware } = require('../middlewares/authMiddleware');

const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, createJobController);

router.get('/getAll', getAllJobsController);

router.get('/get/:id', getSingleJobController);

router.put('/update/:id', authMiddleware, updateJobController);

router.delete('/delete/:id', authMiddleware, deletejobController);

router.delete( '/admin/delete/:id',authMiddleware, roleMiddleware(["admin"]), deletejobController);

module.exports = router;