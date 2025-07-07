"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Mail, Send, Loader2, FileText } from "lucide-react"
import { emailTemplates, sendInvoiceEmail, processEmailTemplate, type EmailData } from "@/lib/email-service"
import type { InvoiceData } from "@/types/invoice"
//import { useToast } from "@/hooks/use-toast"
import { useToast } from "@/components/ui/use-toast";

interface EmailInvoiceDialogProps {
  invoiceData: InvoiceData
  totalAmount: number
  children: React.ReactNode
}

export function EmailInvoiceDialog({ invoiceData, totalAmount,  children }: EmailInvoiceDialogProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("default")
  const [emailData, setEmailData] = useState<EmailData>({
    to: invoiceData.clientEmail || "",
    cc: "",
    bcc: "",
    subject: "",
    message: "",
    attachPdf: true,
  })

  // Update email content when template changes
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = emailTemplates.find((t) => t.id === templateId)
    if (template) {
      setEmailData((prev) => ({
        ...prev,
        subject: processEmailTemplate(template.subject, invoiceData, totalAmount),
        message: processEmailTemplate(template.message, invoiceData, totalAmount),
      }))
    }
  }

  // Initialize with default template when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && !emailData.subject && !emailData.message) {
      handleTemplateChange("default")
    }
  }

  const handleSendEmail = async () => {
     
    // Validation
    if (!emailData.to) {
      toast({
        title: "Email required",
        description: "Please enter a recipient email address.",
        variant: "destructive",
      })
      return
    }

    if (!emailData.subject) {
      toast({
        title: "Subject required",
        description: "Please enter an email subject.",
        variant: "destructive",
      })
      return
    }

    if (!emailData.message) {
      toast({
        title: "Message required",
        description: "Please enter an email message.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      const result = await sendInvoiceEmail(emailData, invoiceData, totalAmount, toast)

      if (result.success) {
        
        setIsOpen(false)
      } else {
        
      }
    } catch (error) {
      toast({
      title: "Email Send Failed",
      description: `The email for invoice ${invoiceData.invoiceNumber} failed to send.`,
      variant: "destructive",
    });
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Invoice #{invoiceData.invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Email Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Email Recipients */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">To *</Label>
              <Input
                id="to"
                type="email"
                value={emailData.to}
                onChange={(e) => setEmailData((prev) => ({ ...prev, to: e.target.value }))}
                placeholder="client@company.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cc">CC</Label>
                <Input
                  id="cc"
                  type="email"
                  value={emailData.cc}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, cc: e.target.value }))}
                  placeholder="manager@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bcc">BCC</Label>
                <Input
                  id="bcc"
                  type="email"
                  value={emailData.bcc}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, bcc: e.target.value }))}
                  placeholder="accounting@yourcompany.com"
                />
              </div>
            </div>
          </div>

          {/* Email Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Invoice subject"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={emailData.message}
                onChange={(e) => setEmailData((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Email message"
                rows={12}
                required
              />
            </div>
          </div>

          {/* Attachment Options */}
          <div className="space-y-4">
            <Separator />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="attachPdf"
                checked={emailData.attachPdf}
                onCheckedChange={(checked) => setEmailData((prev) => ({ ...prev, attachPdf: checked as boolean }))}
              />
              <Label htmlFor="attachPdf" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Attach invoice as PDF
              </Label>
            </div>
            {emailData.attachPdf && (
              <p className="text-sm text-gray-600 ml-6">
                Invoice will be attached as: Invoice-{invoiceData.invoiceNumber}.pdf
              </p>
            )}
          </div>

          {/* Invoice Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-gray-900">Invoice Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Invoice #:</span> {invoiceData.invoiceNumber}
              </p>
              <p>
                <span className="font-medium">Client:</span> {invoiceData.clientName}
              </p>
              <p>
                <span className="font-medium">Amount:</span> ${totalAmount.toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Due Date:</span> {new Date(invoiceData.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSending}>
              Cancel
            </Button>
            <Button onClick={ handleSendEmail}  disabled={isSending} className="min-w-[120px]">
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
