const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const LineItemSchema = new Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true }
}) 


const invoiceSchema = new Schema ({

  invoiceNumber: {
    type: String,
    required: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  lineItems: [LineItemSchema],
  clientName: {
    type: String,
    required: true
  },
  clientEmail: {
    type: String,

  },
  clientAddress: {
    type: String,

  },
  companyName: {
    type: String,
    required: true
  },
  companyEmail: {
    type: String,
    required: false
  },
  companyPhone: {
    type: String,
    required: false
  },
  taxRate: {
    type: Number
  },
  notes: {
    type: String
  },
  total: {
    type: Number
  }
})

module.exports = mongoose.model('InvoiceDB', invoiceSchema);