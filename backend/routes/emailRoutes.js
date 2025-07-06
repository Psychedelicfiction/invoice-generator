const express = require('express');
const multer = require("multer");
const upload = multer();
const router = express.Router();

const { sendInvoiceEmail } = require('../controller/emailController.js');

router.post('/send-invoice', upload.any(),  sendInvoiceEmail);

module.exports = router;
