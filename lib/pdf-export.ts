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
  filterText?: string
}

export function exportTableToPDF(options: ExportOptions) {
  const { title, columns, data, filename = 'export.pdf', userName, userDepartment, filterText } = options
  
  const doc = new jsPDF('landscape', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const startY = 20
  let currentY = startY

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const titleWidth = doc.getTextWidth(title)
  doc.text(title, margin, currentY)
  currentY += 8
  
  // Filter text (if provided)
  if (filterText) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(filterText, margin, currentY)
    currentY += 8
  } else {
    currentY += 4
  }

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
    let rowStartY = currentY
    let maxRowHeight = 6 // Minimum row height
    
    // First pass: calculate cell heights for multi-line content
    columns.forEach((col, colIdx) => {
      let cellValue = ''
      if (typeof col.accessor === 'function') {
        cellValue = col.accessor(row)
      } else {
        cellValue = String(row[col.accessor] || '')
      }
      
      const maxWidth = columnWidths[colIdx] - 2
      // Split text into multiple lines if needed
      const lines = doc.splitTextToSize(cellValue, maxWidth)
      const cellHeight = lines.length * 5 // 5mm per line
      maxRowHeight = Math.max(maxRowHeight, cellHeight)
    })
    
    // Check if we need a new page before rendering this row
    if (currentY + maxRowHeight > pageHeight - 20) {
      doc.addPage()
      currentY = startY
      rowStartY = currentY
    }
    
    // Second pass: render cells with proper line wrapping
    xPos = margin
    columns.forEach((col, colIdx) => {
      let cellValue = ''
      if (typeof col.accessor === 'function') {
        cellValue = col.accessor(row)
      } else {
        cellValue = String(row[col.accessor] || '')
      }
      
      const maxWidth = columnWidths[colIdx] - 2
      // Split text into multiple lines
      const lines = doc.splitTextToSize(cellValue, maxWidth)
      
      // Render each line
      lines.forEach((line: string, lineIdx: number) => {
        doc.text(line, xPos, rowStartY + (lineIdx * 5))
      })
      
      xPos += columnWidths[colIdx]
    })
    
    currentY += maxRowHeight + 2 // Add spacing between rows
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



