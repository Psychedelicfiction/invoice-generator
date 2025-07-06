export interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface InvoiceData {
  invoiceNumber: string
  id: string
  invoiceDate: string
  dueDate: string
  companyName: string
  companyAddress: string
  companyEmail: string
  companyPhone: string
  clientName: string
  clientAddress: string
  clientEmail: string
  lineItems: LineItem[]
  taxRate: number
  notes: string
  
}

export interface SavedInvoice extends InvoiceData {
  id: string
  createdAt: string
  lastUpdated: string
}
