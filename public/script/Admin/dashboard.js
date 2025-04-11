

function toggleDateRange() {
    const filterType = document.getElementById('filterType').value;
    const customDateRange = document.getElementById('customDateRange');
    customDateRange.classList.toggle('d-none', filterType !== 'custom');
  }
  
  let salesChartInstance; 

  async function fetchReport() {
    const filterType = document.getElementById("filterType").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
  
    try {
      const response = await axios.post("/admin/sales-report", {
        filterType,
        startDate,
        endDate
      });
  
      const result = response.data;
  
      if (result.success) {
        document.getElementById("totalSales").textContent = `₹${result.data.totalSales.toFixed(2)}`;
        document.getElementById("totalCouponDiscount").textContent = `₹${result.data.totalCouponDiscount.toFixed(2)}`;
        document.getElementById("totalOfferDiscount").textContent = `₹${result.data.totalOfferDiscount.toFixed(2)}`;
        document.getElementById("totalOrders").textContent = result.data.totalOrders;
  
        const tableBody = document.getElementById("salesTable");
        tableBody.innerHTML = "";
  
        result.data.orders.forEach(order => {
          const row = `
            <tr>
              <td>${order.id}</td>
              <td>${order.name}</td>
              <td>${order.date}</td>
              <td>${order.items}</td>
              <td>₹${order.grandTotal.toFixed(2)}</td>
              <td>₹${parseFloat(order.offerDiscount).toFixed(2)}</td>
              <td>₹${order.couponDiscount.toFixed(2)}</td>
              <td>${order.paymentMethod}</td>
            </tr>
          `;
          tableBody.innerHTML += row;
        });

        if (result.data.orders.length > 0) {
          const labels = result.data.orders.map(order => order.date);
          const salesData = result.data.orders.map(order => order.grandTotal);

          if (salesChartInstance) {
            salesChartInstance.destroy();
          }
  
          const ctx = document.getElementById("salesChart").getContext("2d");
          salesChartInstance = new Chart(ctx, {
            type: "line",
            data: {
              labels: labels,
              datasets: [{
                label: "Total Sales (₹)",
                data: salesData,
                fill: false,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.4,
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: "#ffffff"
                  }
                }
              },
              scales: {
                x: {
                  ticks: {
                    color: "#ffffff"
                  }
                },
                y: {
                  ticks: {
                    color: "#ffffff"
                  }
                }
              }
            }
          });
        }
      }
    } catch (error) {
      console.error("Error fetching sales report:", error);
    }
  }
  



  window.onload = function () {
    document.getElementById("filterType").value = "all";
    fetchReport();
  };
  
  async function downloadPDF() {
    await downloadSalesReport('pdf');
  }

  async function downloadExcel() {
    await downloadSalesReport('excel');
  }

  async function downloadSalesReport(format) {
    const filterType = document.getElementById("filterType").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    function formatRupees(amount) {
      return `₹${Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    
    try {
      const response = await axios.post(
        '/admin/sales-report/download',
        {
          format,         // 'pdf' or 'excel'
          filterType,
          startDate,
          endDate
        },
        { responseType: 'blob' } // Required to handle file data
      );

      const blob = new Blob([response.data], {
        type: format === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = format === 'pdf' ? 'SalesReport.pdf' : 'SalesReport.xlsx';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading sales report:", error);
      alert("Failed to download report. Please try again.");
    }
  }
    