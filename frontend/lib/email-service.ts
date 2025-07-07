import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export interface EmailData {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  message: string;
  attachPdf: boolean;
}

export const emailTemplates = [
  {
    id: "default",
    name: "Default Template",
    subject: "Invoice #{invoiceNumber} from {companyName}",
    message: `Dear{clientName} client,

Please find attached invoice #{invoiceNumber} for the amount of {totalAmount}.

Thank you for your business!

Sincerely,
{companyName}`,
  },
  {
    id: "professional",
    name: "Professional Template",
    subject: "Invoice #{invoiceNumber} - Payment Due {dueDate}",
    message: `Dear {clientName},

I hope this email finds you well.

Please find attached invoice #{invoiceNumber} for {totalAmount}. Payment is due by {dueDate}.

If you have any questions regarding this invoice, please don't hesitate to contact us.

Best regards,
{companyName}`,
  },
  {
    id: "simple",
    name: "Simple Template",
    subject: "Invoice #{invoiceNumber}",
    message: `Hi {clientName},

Attached is invoice #{invoiceNumber} for {totalAmount}.

Thanks!
{companyName}`,
  },
];

export const processEmailTemplate = (
  template: string,
  invoiceData: any,
  totalAmount: number
): string => {
  let processedTemplate = template;
  processedTemplate = processedTemplate.replace(
    /{invoiceNumber}/g,
    invoiceData.invoiceNumber || ""
  );
  processedTemplate = processedTemplate.replace(
    /{clientName}/g,
    invoiceData.clientName || ""
  );
  processedTemplate = processedTemplate.replace(
    /{companyName}/g,
    invoiceData.companyName || ""
  );
  processedTemplate = processedTemplate.replace(
    /{dueDate}/g,
    invoiceData.dueDate
      ? new Date(invoiceData.dueDate).toLocaleDateString()
      : ""
  );
  processedTemplate = processedTemplate.replace(
    /{totalAmount}/g,
    `$${totalAmount?.toFixed(2) || "0.00"}`
  );
  return processedTemplate;
};

export const sendInvoiceEmail = async (
  emailData: EmailData,
  invoiceData: any,
  totalAmount: number,
  toast: (opts: {
    title: string;
    description?: string;
    variant?: "default" | "destructive";
  }) => void
): Promise<{ success: boolean; message: string }> => {
  //  Invoice field validation
  if (
    !invoiceData.invoiceNumber ||
    !invoiceData.clientName ||
    !invoiceData.companyName ||
    !invoiceData.dueDate
  ) {
    toast({
      title: "Missing Invoice Information",
      description:
        "Please complete all required invoice fields (number, client name, company name, due date).",
      variant: "destructive",
    });
    return {
      success: false,
      message: "Missing required invoice fields.",
    };
  }

  if (!totalAmount || isNaN(totalAmount)) {
    toast({
      title: "Invalid Total Amount",
      description: "Invoice total amount must be a valid number.",
      variant: "destructive",
    });
    return {
      success: false,
      message: "Invalid invoice total amount.",
    };
  }

 
  const input = document.getElementById("invoice-preview");
  if (!input) {
    toast({
      title: "Preview Not Found",
      description: "Invoice preview section is missing.",
      variant: "destructive",
    });
    return {
      success: false,
      message: "Invoice preview not found.",
    };
  }

  try {
    const canvas = await html2canvas(input, {
      scale: 1.5,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 1);
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

    const pdfBlob = pdf.output("blob");

    const formData = new FormData();
    formData.append("pdf", pdfBlob, `Invoice-${invoiceData.invoiceNumber}.pdf`);
    formData.append("emailData", JSON.stringify(emailData));
    formData.append("invoiceData", JSON.stringify(invoiceData));
    formData.append("totalAmount", totalAmount.toString());

    const response = await fetch("/api/send-invoice", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    toast({
      title: "Email Sent",
      description: `The invoice ${invoiceData.invoiceNumber} has been emailed successfully.`,
    });

    return result;
  } catch (err) {
    console.error("Failed to send email:", err);
    toast({
      title: "Email Send Failed",
      description: `The email for invoice ${invoiceData.invoiceNumber} failed to send.`,
      variant: "destructive",
    });
    return {
      success: false,
      message: "Error sending email. Please try again.",
    };
  }
};
