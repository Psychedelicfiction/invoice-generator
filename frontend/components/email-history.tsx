"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { History, Mail } from "lucide-react"

interface EmailRecord {
  id: string
  invoiceNumber: string
  recipient: string
  subject: string
  sentAt: string
  status: "sent" | "failed"
}

export function EmailHistory() {
  const [emailHistory, setEmailHistory] = useState<EmailRecord[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Load email history from localStorage
      const history = localStorage.getItem("emailHistory")
      if (history) {
        setEmailHistory(JSON.parse(history))
      }
    }
  }, [isOpen])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 mr-2" />
          Email History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email History
          </DialogTitle>
        </DialogHeader>

        {emailHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No emails sent yet</div>
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.invoiceNumber}</TableCell>
                    <TableCell>{record.recipient}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.subject}</TableCell>
                    <TableCell>{formatDate(record.sentAt)}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "sent" ? "default" : "destructive"}>{record.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
