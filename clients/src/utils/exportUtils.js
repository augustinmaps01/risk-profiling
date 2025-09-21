import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Logo from "../assets/rbt-logo.png.png";
import { getRiskColorClass } from "./riskUtils";

export const exportCSV = (customers) => {
  const dataToExport = customers.map((c) => ({
    Name: c.name,
    "Total Score": c.totalScore,
    "Risk Level": c.riskLevel,
    Categories: c.selections?.map((s) => s.criteriaCategory).join(" | "),
    "Sub-Categories": c.selections
      ?.flatMap((s) =>
        s.options.map(
          (o) => `${s.criteriaCategory}: ${o.optionLabel} (${o.points} pts)`
        )
      )
      .join(" | "),
  }));
  
  const csv = Papa.unparse(dataToExport);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "customers.csv";
  a.click();
  URL.revokeObjectURL(url);
};

export const exportExcel = (customers) => {
  const dataToExport = customers.map((c) => ({
    Name: c.name,
    "Total Score": c.totalScore,
    "Risk Level": c.riskLevel,
    Categories: c.selections?.map((s) => s.criteriaCategory).join(", "),
    "Sub-Categories": c.selections
      ?.flatMap((s) =>
        s.options.map(
          (o) => `${s.criteriaCategory}: ${o.optionLabel} (${o.points} pts)`
        )
      )
      .join(" | "),
  }));
  
  const ws = XLSX.utils.json_to_sheet(dataToExport);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Customers");
  XLSX.writeFile(wb, "customers.xlsx");
};

export const exportPDF = (customers) => {
  const doc = new jsPDF();
  doc.text("Customer List", 14, 10);
  
  const tableColumn = [
    "Name",
    "Total Score",
    "Risk Level",
    "Category",
    "Sub-Category",
  ];
  
  const tableRows = customers.map((c) => [
    c.name,
    c.totalScore,
    c.riskLevel,
    c.selections?.map((s) => s.criteriaCategory).join("\n") || "",
    c.selections
      ?.flatMap((s) =>
        s.options.map(
          (o) => `${s.criteriaCategory}: ${o.optionLabel} (${o.points} pts)`
        )
      )
      .join("\n") || "",
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    styles: { cellWidth: "wrap", fontSize: 9 },
    columnStyles: {
      3: { cellWidth: 40 },
      4: { cellWidth: 60 },
    },
    headStyles: { fillColor: [30, 144, 255] },
  });

  doc.save("customers.pdf");
};

export const exportModalDataToCSV = (customer) => {
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
  URL.revokeObjectURL(url);
};

export const exportModalDataToExcel = (customer) => {
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

export const exportModalDataToPDF = (customer) => {
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

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    styles: { fontSize: 9, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [30, 144, 255] },
  });

  const finalY = doc.autoTable.previous.finalY;
  doc.setFontSize(12);
  doc.text(`Total Score: ${customer.totalScore} pts`, 14, finalY + 10);
  doc.text(`Risk Level: ${customer.riskLevel}`, 14, finalY + 16);

  doc.save(`${customer.name}_details.pdf`);
};

export const handlePrint = (customer) => {
  if (!customer) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const printHtml = `
    <html>
      <head>
        <style>
          .logo {
            width: 80px;
            height: auto;
            margin-bottom: 10px;
            display: block;
            margin-left: auto;
            margin-right: auto;
          }

          @page {
            size: A4;
            margin: 1cm;
            @top-left { content: none; }
            @top-center { content: none; }
            @top-right { content: none; }
            @bottom-left { content: none; }
            @bottom-center { content: none; }
            @bottom-right { content: none; }
          }

          @page {
            margin-top: 0;
            margin-bottom: 0;
          }
          @page :left {
            margin-left: 0;
            margin-right: 0;
          }
          @page :right {
            margin-left: 0;
            margin-right: 0;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 2rem;
            color: #333;
            line-height: 1.6;
          }
          .container {
            width: 1000px;
            margin: 0 auto;
            padding: 2rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          header h5 {
            text-align: center;
            margin-bottom: 2rem;
            font-weight:normal;
            font-size:20px
          }
          h1 {
            color: #1e40af;
            font-size: 28px;
            margin: 0;
          }
          h4 {
            text-align: left;
            margin: 1rem 0 0.5rem;
            color: black;
            font-size: 20px;
            padding-bottom: 0.5rem;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2rem;
            background-color: #fff;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          th, td {
            border: 1px solid #464646;
            padding: 12px 16px;
            text-align: left;
            font-size: 14px;
          }
          thead th {
            background-color: #fbfcff;
            color: #121212;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          tbody tr {
            color: #000000;
            text-align:center;
          }
          tbody tr:nth-child(even) {
            background-color: #f9fafb;
          }
          tbody td:first-child {
            font-weight: 500;
            color: #1e40af;
          }
          tfoot {
            font-weight: bold;
            background-color: #eef2ff;
          }
          tfoot td {
            border: 1px solid #464646;
            font-size: 16px;
            color: black;
          }

          .risk-high { color: #dc2626; font-weight: bold; }
          .risk-moderate { color: #ca8a04; font-weight: bold; }
          .risk-low { color: #16a34a; font-weight: bold; }
          
          @media print {
            body {
              margin: 0;
              font-size: 12pt;
            }
            .container {
              box-shadow: none;
              border: none;
              border-radius: 0;
              padding: 0;
            }
            table {
              box-shadow: none;
            }
          }
          
          header {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .logo {
            margin: 0;
            width: 60px;
            height: auto;
          }

          .header-text {
            text-align: left;
          }

          .header-text h5 {
            margin: 0;
          }
        </style>
      </head>
      <body style="padding-top:50px;">
        <div class="container">
          <header>
            <div>
              <img style="margin:0 auto;" src="${Logo}" alt="RBT Bank Logo" class="logo" />
              <div class="header-text">
                <h5>RBT BANK INC., A Rural Bank</h5>
                <h5>Talisayan, Misamis Oriental, Philippines</h5>
                <h5 style="margin-top: 5px; font-size:16px;">${currentDate}</h5>
                <br><br>
                <h1 style="text-align: center; color:black; margin-top:25px;">CLIENT RISK PROFILE</h1>
              </div>
            </div>
          </header>
          <div> 
            <h4 style="text-align: left; padding:0;margin-bottom:3px; line-height: 1.6;">Name: ${customer.name}</h4>
            <h5 style="text-align: left; padding:0; margin:0; font-size:16px">Date Assessed: ${customer.created_at}</h5>
          </div>

          <table>
            <thead>
              <tr>
                <th>Criteria</th>
                <th>Sub-Criteria</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              ${customer.selections
                .map((criteria) =>
                  criteria.options
                    .map(
                      (opt, j) => `
                        <tr>
                          ${
                            j === 0
                              ? `<td style="color:black; font-weight:normal;" rowspan="${criteria.options.length}">${criteria.criteriaCategory}</td>`
                              : ""
                          }
                          <td>${opt.optionLabel}</td>
                          <td style="text-align:center">${opt.points}</td>
                        </tr>
                      `
                    )
                    .join("")
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2">Total Score</td>
                <td style="text-align:center;">${customer.totalScore}</td>
              </tr>
              <tr style="font-size:10px;">
                <td colspan="2">Risk Level</td>
                <td class="${getRiskColorClass(customer.riskLevel)}">${customer.riskLevel}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(printHtml);
  printWindow.document.close();
  printWindow.print();
};