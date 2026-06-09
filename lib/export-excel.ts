import * as XLSX from "xlsx";

export interface ReportData {
  id: string;
  studentName: string;
  mobile: string;
  classSection: string;
  dateOfAssessment: string;
  scoreA: number;
  scoreB: number;
  scoreC: number;
  scoreD: number;
  pdfPath: string;
  createdAt: string;
  updatedAt: string;
  reportOpenedAt: string | null;
  reportOpenCount: number;
}

export function exportReportsToExcel(reports: ReportData[], filename: string = "reports.xlsx") {
  // Format the date for the filename
  const now = new Date().toISOString().split("T")[0];
  const exportFilename = `${filename.replace(".xlsx", "")}_${now}.xlsx`;

  // Transform data for Excel export
  const excelData = reports.map((report) => ({
    "Student Name": report.studentName,
    "Mobile": report.mobile,
    "Class/Section": report.classSection,
    "Date of Assessment": new Date(report.dateOfAssessment).toLocaleDateString("en-GB"),
    "Score A": report.scoreA,
    "Score B": report.scoreB,
    "Score C": report.scoreC,
    "Score D": report.scoreD,
    "Total Score": report.scoreA + report.scoreB + report.scoreC + report.scoreD,
    "Report Opens": report.reportOpenCount,
    "Last Opened": report.reportOpenedAt
      ? new Date(report.reportOpenedAt).toLocaleDateString("en-GB")
      : "Never",
    "Created At": new Date(report.createdAt).toLocaleDateString("en-GB"),
    "Updated At": new Date(report.updatedAt).toLocaleDateString("en-GB"),
  }));

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 20 }, // Student Name
    { wch: 15 }, // Mobile
    { wch: 18 }, // Class/Section
    { wch: 18 }, // Date of Assessment
    { wch: 10 }, // Score A
    { wch: 10 }, // Score B
    { wch: 10 }, // Score C
    { wch: 10 }, // Score D
    { wch: 12 }, // Total Score
    { wch: 12 }, // Report Opens
    { wch: 15 }, // Last Opened
    { wch: 15 }, // Created At
    { wch: 15 }, // Updated At
  ];
  worksheet["!cols"] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, exportFilename);
}
