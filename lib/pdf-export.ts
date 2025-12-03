import jsPDF from 'jspdf'

export interface TableColumn {
  header: string
  accessor: string | ((row: any) => string)
  width?: number
}

export interface ExportOptions {
  title: string
  columns: TableColumn[]
  data: any[]
  filename?: string
  userName?: string
  userDepartment?: string
}

export function exportTableToPDF(options: ExportOptions) {
  const { title, columns, data, filename = 'export.pdf', userName, userDepartment } = options
  
  const doc = new jsPDF('landscape', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const startY = 15
  let currentY = startY

  // Header section with border
  doc.setLineWidth(0.5)
  doc.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 5

  // User information
  if (userName || userDepartment) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const leftX = margin
    const rightX = pageWidth - margin - 60
    
    if (userName) {
      doc.setFont('helvetica', 'bold')
      doc.text('Name:', leftX, currentY)
      doc.setFont('helvetica', 'normal')
      doc.text(userName, leftX + 20, currentY)
    }
    
    if (userDepartment) {
      currentY += 5
      doc.setFont('helvetica', 'bold')
      doc.text('Department:', leftX, currentY)
      doc.setFont('helvetica', 'normal')
      doc.text(userDepartment, leftX + 30, currentY)
    }
    
    // Right side - Print date and total records
    const printDate = new Date().toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    doc.setFont('helvetica', 'bold')
    doc.text('Printed:', rightX, startY + 5)
    doc.setFont('helvetica', 'normal')
    doc.text(printDate, rightX + 20, startY + 5)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Total Records:', rightX, startY + 10)
    doc.setFont('helvetica', 'normal')
    doc.text(String(data.length), rightX + 35, startY + 10)
    
    currentY += 8
    doc.line(margin, currentY, pageWidth - margin, currentY)
    currentY += 8
  }

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const titleWidth = doc.getTextWidth(title)
  doc.text(title, (pageWidth - titleWidth) / 2, currentY)
  currentY += 10

  if (data.length === 0) {
    doc.text('No data available', margin, currentY)
    doc.save(filename)
    return
  }

  // Calculate column widths
  const availableWidth = pageWidth - (margin * 2)
  const columnWidths = columns.map(col => col.width || (availableWidth / columns.length))

  // Table header
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  let xPos = margin
  columns.forEach((col, idx) => {
    doc.text(col.header, xPos, currentY)
    xPos += columnWidths[idx]
  })
  
  currentY += 7
  doc.setLineWidth(0.5)
  doc.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 5

  // Table rows
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  
  data.forEach((row, rowIdx) => {
    // Check if we need a new page
    if (currentY > pageHeight - 20) {
      doc.addPage()
      currentY = startY
    }

    xPos = margin
    columns.forEach((col, colIdx) => {
      let cellValue = ''
      if (typeof col.accessor === 'function') {
        cellValue = col.accessor(row)
      } else {
        cellValue = String(row[col.accessor] || '')
      }
      
      // Truncate long text
      const maxWidth = columnWidths[colIdx] - 2
      if (doc.getTextWidth(cellValue) > maxWidth) {
        cellValue = doc.splitTextToSize(cellValue, maxWidth)[0] + '...'
      }
      
      doc.text(cellValue, xPos, currentY)
      xPos += columnWidths[colIdx]
    })
    
    currentY += 6
  })

  doc.save(filename)
}

export function exportTableToCSV(options: ExportOptions) {
  const { columns, data, filename = 'export.csv', userName, userDepartment } = options
  
  // CSV metadata header
  const metadata: string[] = []
  if (userName) metadata.push(`Name,${userName}`)
  if (userDepartment) metadata.push(`Department,${userDepartment}`)
  metadata.push(`Printed,${new Date().toLocaleString()}`)
  metadata.push(`Total Records,${data.length}`)
  metadata.push('') // Empty line separator
  
  // CSV header
  const header = columns.map(col => `"${col.header}"`).join(',')
  
  // CSV rows
  const rows = data.map(row => {
    return columns.map(col => {
      let value = ''
      if (typeof col.accessor === 'function') {
        value = col.accessor(row)
      } else {
        value = String(row[col.accessor] || '')
      }
      // Escape quotes and wrap in quotes
      return `"${value.replace(/"/g, '""')}"`
    }).join(',')
  })
  
  const csv = [...metadata, header, ...rows].join('\n')
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}



