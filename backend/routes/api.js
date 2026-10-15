const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const employeeController = require('../controllers/employeeController');

// 1. Auth Route
router.post('/login', authController.login);

// 2. Employee Routes
router.get('/employees', employeeController.getAllEmployees);
router.post('/employees', employeeController.addEmployee);
router.get('/employees/salary-clusters', employeeController.getSalaryClusters);
router.put('/employees/:id/status', employeeController.toggleStatus);
router.delete('/employees/:id', employeeController.deleteEmployee);

module.exports = router;
