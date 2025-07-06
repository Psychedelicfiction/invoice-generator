"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getInvoices, deleteInvoice } from "@/lib/invoice-storage"
import type { SavedInvoice } from "@/types/invoice"
import { MoreHorizontal, FileEdit, Trash2 } from "lucide-react"

interface InvoiceListProps {
  onLoadInvoice?: (invoice: SavedInvoice) => void
  onInvoiceDeleted: () => void
}

export function InvoiceList({ onLoadInvoice, onInvoiceDeleted }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const loadInvoices = () => {
    const savedInvoices = getInvoices()
    setInvoices(savedInvoices)
  }

  useEffect(() => {
    if (isOpen) {
      loadInvoices()
    }
  }, [isOpen])

  const handleDeleteInvoice = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoice(id)
      loadInvoices()
      onInvoiceDeleted()
    }
  }

  const handleLoadInvoice = (invoice: SavedInvoice) => {
    onLoadInvoice?.(invoice)
    setIsOpen(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Invoices</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Saved Invoices</DialogTitle>
        </DialogHeader>
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No saved invoices found</div>
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0)
                  const taxAmount = subtotal * (invoice.taxRate / 100)
                  const total = subtotal + taxAmount

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>${total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteInvoice(invoice.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
