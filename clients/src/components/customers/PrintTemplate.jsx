import Logo from "../../assets/rbt-logo.png.png";
import { getRiskColor } from "../../utils/riskUtils";

export const generatePrintContent = (selectedCustomer, currentDate, systemLogo = null) => {
  const logoSrc = systemLogo ? (systemLogo.startsWith('/') ? `${window.location.protocol}//${window.location.host}${systemLogo}` : systemLogo) : Logo;
  return `
<html>
<head>
<style>
.logo { width: 80px; height: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; }
@page { size: A4; margin: 1cm; @top-left { content: none; } @top-center { content: none; } @top-right { content: none; } @bottom-left { content: none; } @bottom-center { content: none; } @bottom-right { content: none; } }
@page { margin-top: 0; margin-bottom: 0; }
@page :left { margin-left: 0; margin-right: 0; }
@page :right { margin-left: 0; margin-right: 0; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 2rem; color: #333; line-height: 1.6; }
.container { width: 1000px; margin: 0 auto; padding: 2rem; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
header h5 { text-align: center; margin-bottom: 2rem; font-weight:normal; font-size:20px }
h1 { color: #1e40af; font-size: 28px; margin: 0; }
h4 { text-align: left; margin: 1rem 0 0.5rem; color: black; font-size: 20px; padding-bottom: 0.5rem; }
table { width: 100%; border-collapse: collapse; margin-top: 2rem; background-color: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden; }
th, td { border: 1px solid #464646; padding: 12px 16px; text-align: left; font-size: 14px; }
thead th { background-color: #fbfcff; color: #121212; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
tbody tr { color: #000000; text-align:center; }
tbody tr:nth-child(even) { background-color: #f9fafb; }
tbody td:first-child { font-weight: 500; color: #1e40af; }
tfoot { font-weight: bold; background-color: #eef2ff; }
tfoot td { border: 1px solid #464646; font-size: 16px; color: black; }
.risk-high { color: #dc2626; font-weight: bold; }
.risk-moderate { color: #ca8a04; font-weight: bold; }
.risk-low { color: #16a34a; font-weight: bold; }
@media print { body { margin: 0; font-size: 12pt; } .container { box-shadow: none; border: none; border-radius: 0; padding: 0; } table { box-shadow: none; } }
header { display: flex; justify-content: center; align-items: center; }
.logo { margin: 0; width: 60px; height: auto; }
.header-text { text-align: left; }
.header-text h5 { margin: 0; }
</style>
</head>
<body style="padding-top:50px;">
  <div class="container">
    <header>
      <div>
        <img style="margin:0 auto;" src="${logoSrc}" alt="System Logo" class="logo" />
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
      <h4 style="text-align: left; padding:0;margin-bottom:3px; line-height: 1.6;">Name: ${selectedCustomer.name}</h4>
      <h5 style="text-align: left; padding:0; margin:0; font-size:16px">Date Assessed: ${
        new Date(selectedCustomer.created_at).toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        })
      }</h5>
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
        ${selectedCustomer.selections
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
          <td style="text-align:center;">${selectedCustomer.totalScore}</td>
        </tr>
        <tr style="font-size:10px;">
          <td colspan="2">Risk Level</td>
          <td class="${getRiskColor(selectedCustomer.riskLevel)}">${selectedCustomer.riskLevel}</td>
        </tr>
      </tfoot>
    </table>
    <div style="margin-top: 30px; text-align: left;">
      <h5 style="margin: 0; font-size: 16px; font-weight: normal;">Prepared by: ${selectedCustomer.createdByName || 'Unknown'}</h5>
    </div>
  </div>
</body>
</html>`;
};