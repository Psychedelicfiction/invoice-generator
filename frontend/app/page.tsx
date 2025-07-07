"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Printer, Download, Save, Mail } from "lucide-react"
import { InvoiceList } from "@/components/invoice-list"
import { saveInvoice } from "@/lib/invoice-storage"
import type { InvoiceData, LineItem } from "@/types/invoice"
import { useToast } from "@/components/ui/use-toast"
import { EmailInvoiceDialog } from "@/components/email-invoice-dialog"
import { processEmailTemplate } from "@/lib/email-service"
import { emailTemplates } from "@/lib/email-service"



import { jsPDF } from 'jspdf'; 
import  html2canvas  from 'html2canvas';

const createEmptyInvoice = (): InvoiceData => ({
  invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
  id: crypto.randomUUID(),
  invoiceDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  companyName: "",
  companyAddress: "",
  companyEmail: "",
  companyPhone: "",
  clientName: "",
  clientAddress: "",
  clientEmail: "",
  lineItems: [{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }],
  taxRate: 0,
  notes: "",
})

export default function InvoiceGenerator() {
  const printRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "",
    id: "",
    invoiceDate: "",
    dueDate: "",
    companyName: "",
    companyAddress: "",
    companyEmail: "",
    companyPhone: "",
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    lineItems: [{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }],
    taxRate: 0,
    notes: "",
  })
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0])
 
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize with proper values on client side
  useEffect(() => {
    setInvoiceData(createEmptyInvoice())
    setIsInitialized(true)
  }, [])

  const updateInvoiceData = (field: keyof InvoiceData, value: any) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }))
  }

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    }
    setInvoiceData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem],
    }))
  }

  const removeLineItem = (id: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }))
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoiceData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate
          }
          return updatedItem
        }
        return item
      }),
    }))
  }

  const subtotal = invoiceData.lineItems.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = subtotal * (invoiceData.taxRate / 100)
  const total = subtotal + taxAmount

  const handlePrint = () => {
    window.print()
  }

  const validation = () => {
        if (!invoiceData.companyName || invoiceData.companyName.trim() === "") {
      toast({
        title: "Missing information",
        description: "Please add your company name before saving.",
        variant: "destructive",
      });
      return false;
  }

    if (!invoiceData.clientName || invoiceData.clientName.trim() === "") {
      console.log("Validation failed: No client name")
      toast({
        title: "Missing information",
        description: "Please add a client name before saving.",
        variant: "destructive",
      })
      return false;
    }

    // Check line items
    const invalidLineItems = invoiceData.lineItems.filter(
      (item) => !item.description || item.description.trim() === "" || item.amount === 0.00
    )

    if (invoiceData.lineItems.length === 0 || invalidLineItems.length > 0) {
      toast({
        title: "Invalid line items",
        description: "Please ensure all line items have descriptions and amounts greater than 0.",
        variant: "destructive",
      })
      return false;
    }

    return true;
  }

  const postInvoice = async () => {
     try {
    const res = await fetch('http://localhost:5000/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Server error:", errorText);
      throw new Error('Failed to send invoice');
    }

    const result = await res.json();
    console.log('Invoice sent:', result.message);


  } catch (err) {
    console.error('Error sending invoice:', err);
    toast({
      title: 'Download Failed',
      description: 'Unable to sync invoice to server.',
      variant: 'destructive',
    });
  }
}
const handleDownload = async () => {
  const isValid = validation();

  if (!isValid){
    alert('Missing fields, download failed!');
    return;
  }
  // ...validation code remains unchanged
  
  const input = document.getElementById("invoice-preview");
  if (!input) return;

  try {
    
    postInvoice();
    const canvas = await html2canvas(input, {
      scale: 1.5,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 1);
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${invoiceData.invoiceNumber || "invoice"}.pdf`);

    toast({
      title: 'Download Successful',
      description: `Invoice ${invoiceData.invoiceNumber} downloaded.`,
    });

  } catch (err) {
    console.error("Error generating PDF", err);
    toast({
      title: "Download Failed",
      description: "There was a problem generating the PDF.",
      variant: "destructive",
    });
  }
alert("Downloading invoice");
}


  const handleSaveInvoice = () => {
      const isValid = validation();

    if (!isValid){
       toast({
        title: "Save failed",
        description: "There was an error saving the invoice. Please try again.",
        variant: "destructive",
      })
      return;
    } else {
      
    toast({
      title: 'Invoice Synced',
      description: `Invoice ${invoiceData.invoiceNumber} has been saved.`,
    });
    }

    // Basic validation with detailed logging
    
    try {
      saveInvoice(invoiceData)
      console.log("Saving invoice:", invoiceData)
      postInvoice()

  
      // Also show a browser alert as backup confirmation
      //
    } catch (error) {
      console.error("Error saving invoice:", error)
      toast({
        title: "Save failed",
        description: "There was an error saving the invoice. Please try again.",
        variant: "destructive",
      })
      // Backup alert for errors too
      alert(` Error saving invoice: ${error}`)
    }
  }

  const generatePdfBase64 = async (): Promise<string | null> => {
  const input = document.getElementById("invoice-preview");
  if (!input) return null;

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
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return base64String;
  } catch (err) {
    console.error("Error generating PDF for email", err);
    return null;
  }
};




  const handleNewInvoice = () => {
    if (confirm("Are you sure you want to create a new invoice? Any unsaved changes will be lost.")) {
      setInvoiceData(createEmptyInvoice())
     
    }
  }

  const handleInvoiceDeleted = () => {
  
      toast({
        title: "Invoice deleted",
        description: "The invoice has been deleted.",
      })
    
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
          <div className="flex gap-2 print:hidden">
            <Button onClick={handleNewInvoice} variant="outline">
              New Invoice
            </Button>
            <InvoiceList onInvoiceDeleted={handleInvoiceDeleted} />
            <Button onClick={handleSaveInvoice} variant="outline"> 
              
              <Save className="w-4 h-4 mr-2" />Save
            </Button>
            <EmailInvoiceDialog invoiceData={invoiceData} totalAmount={total}  >
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </EmailInvoiceDialog>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6 print:hidden">
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => updateInvoiceData("invoiceNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={invoiceData.invoiceDate}
                      onChange={(e) => updateInvoiceData("invoiceDate", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => updateInvoiceData("dueDate", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Your Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={invoiceData.companyName}
                    onChange={(e) => updateInvoiceData("companyName", e.target.value)}
                    placeholder="Your Company Name"
                  />
                </div>
                <div>
                  <Label htmlFor="companyAddress">Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={invoiceData.companyAddress}
                    onChange={(e) => updateInvoiceData("companyAddress", e.target.value)}
                    placeholder="123 Business St, City, State 12345"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyEmail">Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={invoiceData.companyEmail}
                      onChange={(e) => updateInvoiceData("companyEmail", e.target.value)}
                      placeholder="hello@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyPhone">Phone</Label>
                    <Input
                      id="companyPhone"
                      value={invoiceData.companyPhone}
                      onChange={(e) => updateInvoiceData("companyPhone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Bill To</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={invoiceData.clientName}
                    onChange={(e) => updateInvoiceData("clientName", e.target.value)}
                    placeholder="Client Company Name"
                  />
                </div>
                <div>
                  <Label htmlFor="clientAddress">Address</Label>
                  <Textarea
                    id="clientAddress"
                    value={invoiceData.clientAddress}
                    onChange={(e) => updateInvoiceData("clientAddress", e.target.value)}
                    placeholder="456 Client Ave, City, State 67890"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={invoiceData.clientEmail}
                    onChange={(e) => updateInvoiceData("clientEmail", e.target.value)}
                    placeholder="client@company.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Line Items
                  <Button onClick={addLineItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoiceData.lineItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                        placeholder="Service or product description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Rate</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateLineItem(item.id, "rate", Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Amount</Label>
                      <Input value={`$${item.amount.toFixed(2)}`} readOnly className="bg-gray-50" />
                    </div>
                    <div className="col-span-1">
                      {invoiceData.lineItems.length > 1 && (
                        <Button
                          onClick={() => removeLineItem(item.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tax and Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={invoiceData.taxRate}
                    onChange={(e) => updateInvoiceData("taxRate", Number.parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={invoiceData.notes}
                    onChange={(e) => updateInvoiceData("notes", e.target.value)}
                    placeholder="Payment terms, thank you message, etc."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Preview */}
          <div id = "invoice-preview" className="lg:sticky lg:top-4">
            <Card>
              <CardContent className="p-0">
                <div ref={printRef} className="bg-white p-8 print:p-0 print:shadow-none">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                      <p className="text-gray-600">#{invoiceData.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {invoiceData.companyName || "Your Company"}
                      </h2>
                      <div className="text-gray-600 text-sm space-y-1">
                        {invoiceData.companyAddress && (
                          <p className="whitespace-pre-line">{invoiceData.companyAddress}</p>
                        )}
                        {invoiceData.companyEmail && <p>{invoiceData.companyEmail}</p>}
                        {invoiceData.companyPhone && <p>{invoiceData.companyPhone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                      <div className="text-gray-600 space-y-1">
                        <p className="font-medium">{invoiceData.clientName || "Client Name"}</p>
                        {invoiceData.clientAddress && (
                          <p className="whitespace-pre-line">{invoiceData.clientAddress}</p>
                        )}
                        {invoiceData.clientEmail && <p>{invoiceData.clientEmail}</p>}
                      </div>
                    </div>
                    <div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Invoice Date:</span>
                          <span>{new Date(invoiceData.invoiceDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Due Date:</span>
                          <span>{new Date(invoiceData.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  {/* Line Items Table */}
                  <div className="mb-8">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-medium text-gray-900">Description</th>
                          <th className="text-right py-2 font-medium text-gray-900 w-20">Qty</th>
                          <th className="text-right py-2 font-medium text-gray-900 w-24">Rate</th>
                          <th className="text-right py-2 font-medium text-gray-900 w-24">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.lineItems.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100">
                            <td className="py-3 text-gray-700">{item.description || "Service description"}</td>
                            <td className="py-3 text-right text-gray-700">{item.quantity}</td>
                            <td className="py-3 text-right text-gray-700">${item.rate.toFixed(2)}</td>
                            <td className="py-3 text-right text-gray-700">${item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end mb-8">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                      </div>
                      {invoiceData.taxRate > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax ({invoiceData.taxRate}%):</span>
                          <span className="text-gray-900">${taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-gray-900">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {invoiceData.notes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
                      <p className="text-gray-600 whitespace-pre-line">{invoiceData.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  )
}
