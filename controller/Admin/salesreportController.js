const Order =require('../../Models/orderModel')
const path = require("path");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");



const getSalesReport = async (req, res) => {
  try {
    let { filter = 'daily', startDate, endDate } = req.query;
    let matchQuery = {};

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    if (filter === 'daily') {
      matchQuery.orderDate = { $gte: startOfDay, $lt: endOfDay };
    } else if (filter === 'weekly') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      matchQuery.orderDate = { $gte: weekStart, $lt: endOfDay };
    } else if (filter === 'yearly') {
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear() + 1, 0, 1);
      matchQuery.orderDate = { $gte: yearStart, $lt: yearEnd };
    } else if (filter === 'custom' && startDate && endDate) {
      matchQuery.orderDate = {
        $gte: new Date(startDate),
        $lt: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    const salesData = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$grandTotal" },
          totalOrders: { $sum: 1 },
          totalDiscount: { $sum: "$discount" },
        },
      },
    ]);

    const reportData = salesData.length ? salesData[0] : { totalSales: 0, totalOrders: 0, totalDiscount: 0 };

    // Check if it's an AJAX request
    if (req.xhr) {
      return res.json(reportData);
    }

    res.render('Admin/pages/dashboard', {
      salesData: reportData,
      filter,
      startDate: startDate || '',
      endDate: endDate || ''
    });

  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).send('Internal Server Error');
  }
};




const generatePDF = (salesData, res) => {
  try {
    const doc = new PDFDocument();
    res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res); // Stream directly to response

    doc.fontSize(18).text("Sales Report", { align: "center" });
    doc.moveDown();

    // Ensure salesData is correct
    doc.fontSize(12).text(`Total Sales: ₹${salesData.totalSales?.toFixed(2) || 0}`);
    doc.text(`Total Orders: ${salesData.totalOrders || 0}`);
    doc.text(`Total Product Discounts: ₹${salesData.totalDiscount?.toFixed(2) || 0}`);
   

    doc.end();
  } catch (error) {
    console.error("Error generating PDF report:", error);
    res.status(500).send("Error generating PDF report");
  }
};


const generateExcel = async (salesData, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Report");

  worksheet.columns = [
    { header: "Total Sales", key: "totalSales", width: 20 },
    { header: "Total Orders", key: "totalOrders", width: 15 },
    { header: "Product Discounts", key: "totalDiscount", width: 20 },
    { header: "Coupon Discounts", key: "couponDiscount", width: 20 },
  ];

  worksheet.addRow(salesData); // Ensure data is correctly added

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=sales_report.xlsx");

  await workbook.xlsx.write(res);
  res.end();
};


const downloadSalesReport = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;
    let matchQuery = {};

    const today = new Date();
    if (filter === 'daily') {
      matchQuery.orderDate = {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      };
    } else if (filter === 'weekly') {
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      matchQuery.orderDate = {
        $gte: new Date(weekStart.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      };
    } else if (filter === 'yearly') {
      matchQuery.orderDate = {
        $gte: new Date(today.getFullYear(), 0, 1),
        $lt: new Date(today.getFullYear() + 1, 0, 1),
      };
    } else if (filter === 'custom' && startDate && endDate) {
      matchQuery.orderDate = {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      };
    }

    const salesData = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$grandTotal" },
          totalOrders: { $sum: 1 },
          totalDiscount: { $sum: "$discount" },
          couponDiscount: { $sum: "$couponDiscount" },
        },
      },
    ]);

    const formattedData = salesData.length > 0 ? salesData[0] : { totalSales: 0, totalOrders: 0, totalDiscount: 0, couponDiscount: 0 };

    if (req.query.format === "pdf") {
      generatePDF(formattedData, res);
    } else if (req.query.format === "excel") {
      await generateExcel(formattedData, res);
    } else {
      res.status(400).send("Invalid format requested.");
    }
  } catch (error) {
    console.error("Error downloading report:", error);
    res.status(500).send("Internal Server Error");
  }
};


module.exports = { getSalesReport,downloadSalesReport };
