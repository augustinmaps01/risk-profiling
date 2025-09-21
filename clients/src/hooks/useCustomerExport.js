import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Logo from "../assets/rbt-logo.png.png";

export const useCustomerExport = () => {
  const exportToCSV = (customer) => {
    if (!customer) return;
    const dataToExport = customer.selections.flatMap((criteria) =>
      criteria.options.map((opt) => ({
        Name: customer.name,
        Criteria: criteria.criteriaCategory,
        "Sub-Criteria": opt.optionLabel,
        Points: opt.points,
        "Total Score": customer.totalScore,
        "Risk Level": customer.riskLevel,
      }))
    );
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${customer.name}_details.csv`;
    a.click();
  };

  const exportToExcel = (customer) => {
    if (!customer) return;
    const dataToExport = customer.selections.flatMap((criteria) =>
      criteria.options.map((opt) => ({
        Name: customer.name,
        Criteria: criteria.criteriaCategory,
        "Sub-Criteria": opt.optionLabel,
        Points: opt.points,
        "Total Score": customer.totalScore,
        "Risk Level": customer.riskLevel,
      }))
    );
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Details");
    XLSX.writeFile(wb, `${customer.name}_details.xlsx`);
  };

  const exportToPDF = (customer) => {
    if (!customer || !customer.selections || customer.selections.length === 0) {
      console.error("PDF export failed: No valid customer data or selections found.");
      return;
    }

    const doc = new jsPDF();
    doc.text(`Customer Assessment for: ${customer.name}`, 14, 20);

    const tableColumn = ["Criteria", "Sub-Criteria", "Points"];
    const tableRows = customer.selections.flatMap((criteria) =>
      criteria.options.map((opt, j) => [
        j === 0 ? criteria.criteriaCategory : "",
        opt.optionLabel,
        `${opt.points} pts`,
      ])
    );

    const finalY = doc.autoTable.previous?.finalY || 30;
    doc.setFontSize(12);
    doc.text(`Total Score: ${customer.totalScore} pts`, 14, finalY + 10);
    doc.text(`Risk Level: ${customer.riskLevel}`, 14, finalY + 16);
    doc.save(`${customer.name}_details.pdf`);
  };

  return { exportToCSV, exportToExcel, exportToPDF };
};