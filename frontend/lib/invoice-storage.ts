import type { InvoiceData } from "@/types/invoice"

// Save invoice to localStorage


export const saveInvoice = (invoice: InvoiceData): void => {
  try {
    const existingInvoices = getInvoices()

    const existingIndex = existingInvoices.findIndex(
      (inv) => inv.id === invoice.id
    )

    const now = new Date().toISOString()

    if (existingIndex >= 0) {
      existingInvoices[existingIndex] = {
        ...invoice,
        createdAt: existingInvoices[existingIndex].createdAt, // preserve original
        lastUpdated: now,
      }
    } else {
      existingInvoices.push({
        ...invoice,
        createdAt: now,
        lastUpdated: now,
      })
    }

    localStorage.setItem("invoices", JSON.stringify(existingInvoices))
    console.log(" Saved invoices:", existingInvoices)
  } catch (error) {
    console.error(" Error saving invoice:", error)
  }
}


// Get all invoices from localStorage
export const getInvoices = (): (InvoiceData & {
  id: string
  createdAt: string
  lastUpdated: string
})[] => {
  try {
    const invoices = localStorage.getItem("invoices")
    return invoices ? JSON.parse(invoices) : []
  } catch (error) {
    console.error("Error getting invoices:", error)
    return []
  }
}

// Delete invoice from localStorage
export const deleteInvoice = (id: string): void => {
  try {
    const invoices = getInvoices()
    const updatedInvoices = invoices.filter((invoice) => invoice.id !== id)
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices))
  } catch (error) {
    console.error("Error deleting invoice:", error)
  }
}

// Get a single invoice by ID
export const getInvoiceById = (id: string) => {
  try {
    const invoices = getInvoices()
    return invoices.find((invoice) => invoice.id === id)
  } catch (error) {
    console.error("Error getting invoice:", error)
    return null
  }
}
