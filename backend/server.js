require('dotenv').config();
const express = require ('express');
const app = express();
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const uri = process.env.DATABASE_URI;
const PORT = process.env.PORT || 5000;
const invoiceRoutes = require('./routes/invoiceRoutes');
const emailRoutes = require('./routes/emailRoutes');




//connect DB
connectDB();


//middleware
app.use(cors({ origin: 'https://invoice-frontend-o45y.onrender.com' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//api
app.use('/api/invoices', invoiceRoutes);
app.use('/api', emailRoutes)


//start server
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
})