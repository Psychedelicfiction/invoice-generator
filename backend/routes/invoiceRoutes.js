const express = require('express');
const router = express.Router();
const invoice = require('../model/InvoiceDB');


const {createNewInvoice, getAllInvoice} = require('../controller/invoiceController.js');

router.post('/', createNewInvoice );
router.get('/', getAllInvoice);

module.exports = router;