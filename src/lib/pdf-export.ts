import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportAnalyticsToPDF(data: any, title: string) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(139, 92, 246); // Violet 500
  doc.text('AtomQuest Enterprise', 14, 22);
  
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text(title, 14, 32);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);

  // Parse data for table
  // Assuming data is an array of objects
  if (Array.isArray(data) && data.length > 0) {
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => {
      const val = obj[header];
      return typeof val === 'object' ? JSON.stringify(val) : String(val);
    }));

    autoTable(doc, {
      startY: 50,
      head: [headers.map(h => h.charAt(0).toUpperCase() + h.slice(1).replace(/([A-Z])/g, ' $1'))],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
  } else {
    doc.text("No data available for this report.", 14, 50);
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `AtomQuest Confidential  |  Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}
