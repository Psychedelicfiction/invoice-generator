import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export interface PDFOptions {
  filename?: string
  quality?: number
  scale?: number
}

export const generateInvoicePDF = async (
  elementId: string,
  options: PDFOptions = {},
): Promise<{ success: boolean; message: string; blob?: Blob }> => {
  const { filename = `invoice-${Date.now()}.pdf`, quality = 0.95, scale = 2 } = options

  try {
    // Find the invoice preview element
    const element = document.getElementById(elementId)
    if (!element) {
      return {
        success: false,
        message: "Invoice preview not found. Please try again.",
      }
    }

    // Show loading state by temporarily hiding non-essential elements
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    // Generate canvas from HTML
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    })

    // Restore body overflow
    document.body.style.overflow = originalOverflow

    // Calculate PDF dimensions
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4")
    let position = 0

    // Convert canvas to image data
    const imgData = canvas.toDataURL("image/jpeg", quality)

    // Add first page
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Generate blob for mobile compatibility
    const pdfBlob = pdf.output("blob")

    // Handle download based on device capabilities
    if (isMobileDevice()) {
      // For mobile devices, use different approach
      await downloadPDFMobile(pdfBlob, filename)
    } else {
      // For desktop, use standard download
      downloadPDFDesktop(pdfBlob, filename)
    }

    return {
      success: true,
      message: "PDF generated successfully!",
      blob: pdfBlob,
    }
  } catch (error) {
    console.error("PDF generation error:", error)
    return {
      success: false,
      message: "Failed to generate PDF. Please try again.",
    }
  }
}

// Check if device is mobile
const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Download PDF for desktop
const downloadPDFDesktop = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Download PDF for mobile devices
const downloadPDFMobile = async (blob: Blob, filename: string): Promise<void> => {
  try {
    // Try Web Share API first (modern mobile browsers)
  /*  if (navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: "application/pdf" })

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Invoice PDF",
          text: "Generated invoice PDF",
        })
        return
      }
    } */

    // Fallback: Open PDF in new tab/window for mobile
    const url = URL.createObjectURL(blob)

    // For iOS Safari and other mobile browsers
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      // iOS: Open in new window
      const newWindow = window.open(url, "_blank")
      if (!newWindow) {
        // If popup blocked, try direct navigation
        window.location.href = url
      }
    } else {
      // Android and other mobile browsers
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.target = "_blank"

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // Clean up URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
  } catch (error) {
    console.error("Mobile PDF download error:", error)
    // Final fallback: standard download
    downloadPDFDesktop(blob, filename)
  }
}

// Utility function to get invoice filename
export const getInvoiceFilename = (invoiceNumber: string): string => {
  const sanitizedNumber = invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "-")
  const timestamp = new Date().toISOString().split("T")[0]
  return `Invoice-${sanitizedNumber}-${timestamp}.pdf`
}
