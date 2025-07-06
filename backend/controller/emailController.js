const nodemailer = require('nodemailer');


const sendInvoiceEmail = async (req, res) => {
 try {
    const pdfFile = req.files.find((file) => file.fieldname === "pdf");

    if (!pdfFile) {
      return res.status(400).json({ success: false, message: "PDF file missing." });
    }

    console.log("Received PDF:", pdfFile.originalname);

    const emailData = JSON.parse(req.body.emailData);     // ✅ Now available
    const invoiceData = JSON.parse(req.body.invoiceData); // ✅ Now available
    const totalAmount = parseFloat(req.body.totalAmount);

    // Configure transporter (using example Gmail SMTP for simplicity)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email with attachment
    await transporter.sendMail({
      from: `"${invoiceData.companyName}" <${process.env.EMAIL_USER}>`,
      to: emailData.to,
      cc: emailData.cc || undefined,
      bcc: emailData.bcc || undefined,
      subject: emailData.subject,
      text: emailData.message,
      attachments: [
        {
          filename: `Invoice-${invoiceData.invoiceNumber}.pdf`,
          content: pdfFile.buffer,
          contentType: "application/pdf",
        },
      ],
    });

    return res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Error in sendInvoiceController:", err);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
}

module.exports = { sendInvoiceEmail }; 