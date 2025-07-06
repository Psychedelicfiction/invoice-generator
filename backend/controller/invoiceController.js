const Invoice = require('../model/InvoiceDB')

//create invoice
const createNewInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;
    const newInvoice = new Invoice(invoiceData);
    await newInvoice.save();
    console.log('Received invoice:', invoiceData);
    res.status(201).json({ message: 'Invoice saved successfully' });
  }
  catch (err) {
    res.status(400).json({ message: err.message });
  }

};

//get all invoice

const getAllInvoice = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  }
  catch(err) {
    res.status(500).json({ message: err.message });
  }

}; 



module.exports = {createNewInvoice, getAllInvoice};


