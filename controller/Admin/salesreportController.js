const Order = require("../../Models/orderModel");
const path = require("path");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");


const getDashboard = async (req, res) => {
  try {
    const bestSellingProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      {
        $lookup: {
          from: "products", 
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          totalQuantity: 1,
           images: "$product.images"
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    const bestSellingCategories = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category", 
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      {
        $project: {
          category: "$_id",
          totalQuantity: 1,
          _id: 0,
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    res.render("Admin/pages/dashboard", {
      bestSellingProducts,
      bestSellingCategories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};


const getFilteredOrders = async (startDate, endDate, filterType) => {
  let matchQuery = {};
  const today = new Date();
  let start, end;

  switch (filterType) {
    case "daily":
      start = new Date(today.setHours(0, 0, 0, 0));
      end = new Date(today.setHours(23, 59, 59, 999));
      break;
    case "weekly":
      start = new Date(today.setDate(today.getDate() - 7));
      end = new Date();
      break;
    case "monthly":
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case "yearly":
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
      break;
      case "custom":
        start = new Date(startDate);
        end = new Date(endDate);
        
     
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error("Invalid startDate or endDate provided.");
        }
      
        end.setHours(23, 59, 59, 999);
        break;
  }

  if (start && end) {
    matchQuery.createdAt = { $gte: start, $lte: end };
  }

  matchQuery.orderStatus = "delivered";

  const orders = await Order.find(matchQuery)
    .populate("userId")
    .populate("items.productId")
    .populate('couponId')
    .sort({ createdAt: -1 });

  let totalSales = 0;
  let totalOrders = orders.length;
  let totalCouponDiscount = 0;
  let totalOfferDiscount = 0;

  const orderList = orders.map(order => {
    const couponDiscount = Math.round(order.couponDiscount || 0);
    const grandTotal =Math.round( order.grandTotal || 0);
    const shippingCharge =Math.round( order.shippingCharge || 0);
    const paymentMethod = order.paymentMethod || "N/A";
    let offerDiscount = 0;
  
    order.items.forEach(item => {
      const product = item.productId;
      if (product?.offer?.isActive && product?.offer?.discountPercentage > 0) {
        const discountAmount = (item.price * product.offer.discountPercentage) / 100;
        offerDiscount += discountAmount * item.quantity;
      }
    });

    offerDiscount = Math.round(offerDiscount);
  
    totalSales += grandTotal + couponDiscount; 
    totalCouponDiscount += couponDiscount;
    totalOfferDiscount += offerDiscount;
  
    return {
      id: order._id,
      name: order.userId?.full_name || 'Unknown',
      date: order.createdAt.toDateString(),
      items: order.items.length,
      grandTotal,
      shippingCharge,
      paymentMethod,
      couponDiscount: parseFloat(couponDiscount.toFixed(2)),
      offerDiscount: parseFloat(offerDiscount.toFixed(2))
    };
  });
  totalSales = Math.round(totalSales);
  totalCouponDiscount = Math.round(totalCouponDiscount);
  totalOfferDiscount = Math.round(totalOfferDiscount);

  return {
    orders: orderList,
    totalSales,
    totalOrders,
    totalCouponDiscount,
    totalOfferDiscount
  };

  
};


const getSalesReport = async (req, res) => {
  try {
    const { filterType, startDate, endDate } = req.body;

    const {
      orders,
      totalSales,
      totalOrders,
      totalCouponDiscount,
      totalOfferDiscount
    } = await getFilteredOrders(startDate, endDate, filterType);

    res.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        totalCouponDiscount,
        totalOfferDiscount,
        orders
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




const downloadSalesReport = async (req, res) => {
  try {
    const { filterType, startDate, endDate, format } = req.body;

    const {
      orders,
      totalSales,
      totalOrders,
      totalCouponDiscount,
      totalOfferDiscount
    } = await getFilteredOrders(startDate, endDate, filterType);

    const reportTitle =
      filterType === "all"
        ? "All Sales Report"
        : filterType === "custom"
        ? "Custom Sales Report"
        : `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Sales Report`;

    function formatRupees(amount) {
      const cleanedAmount = String(amount).replace(/[^\d.-]/g, '');
      const number = Number(cleanedAmount);
      return isNaN(number)
        ? '0.00'
        : `${number.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
    }

    if (format === "pdf") {
 
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=SalesReport.pdf");
      doc.pipe(res);

      doc.fillColor("#1f4e78").fontSize(20).text(reportTitle, { align: "center" }).moveDown(0.5);

      if (filterType === "custom") {
        doc.fontSize(12).fillColor("black").text(`From: ${startDate} To: ${endDate}`, { align: "center" }).moveDown();
      }

      doc.fontSize(12).fillColor("black").text(`Total Sales: ${formatRupees(totalSales)}`);
      doc.text(`Total Coupon Discount: ${formatRupees(totalCouponDiscount)}`);
      doc.text(`Total Offer Discount: ${formatRupees(totalOfferDiscount)}`);
      doc.text(`Total Orders: ${totalOrders}`).moveDown();

      const tableTop = doc.y;
      const rowHeight = 30;
      const headers = [
        "Order ID", "Customer Name", "Date", "Items",
        "Grand Total", "Offer Discount", "Coupon Discount", "Payment"
      ];
      const columnWidths = [70, 90, 60, 90, 70, 60, 70, 60];
      const startX = doc.x;

      doc.fontSize(10).fillColor("white").font("Helvetica-Bold");
      let x = startX;
      headers.forEach((header, i) => {
        doc.rect(x, tableTop, columnWidths[i], rowHeight)
          .fillAndStroke("#1f4e78", "#1f4e78");

        doc.fillColor("white").text(header, x + 5, tableTop + 8, {
          width: columnWidths[i] - 10,
          align: "center",
        });

        x += columnWidths[i];
      });

      let y = tableTop + rowHeight;
      doc.font("Helvetica").fillColor("black");

      orders.forEach((order) => {
        x = startX;
        const values = [
          order.id,
          order.name,
          order.date,
          order.items,
          formatRupees(order.grandTotal),
          formatRupees(order.offerDiscount),
          formatRupees(order.couponDiscount),
          order.paymentMethod
        ];

        values.forEach((value, i) => {
          value = String(value).replace(/[^\x00-\x7F.,0-9-]/g, '');

          doc.rect(x, y, columnWidths[i], rowHeight)
            .strokeColor("#cccccc")
            .lineWidth(0.5)
            .stroke();

          doc.text(value, x + 5, y + 8, {
            width: columnWidths[i] - 10,
            align: "center",
          });

          x += columnWidths[i];
        });

        y += rowHeight;
        if (y + rowHeight > doc.page.height - 50) {
          doc.addPage();
          y = 30;
        }
      });

      doc.end();
    }

    // ✅ EXCEL Export
    else if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");

      // Title & Date
      worksheet.addRow([reportTitle]).font = { size: 16, bold: true };
      if (filterType === "custom") {
        worksheet.addRow([`From: ${startDate} To: ${endDate}`]);
      }
      worksheet.addRow([]);

      // Summary
      worksheet.addRow(["Total Sales", formatRupees(totalSales)]);
      worksheet.addRow(["Total Coupon Discount", formatRupees(totalCouponDiscount)]);
      worksheet.addRow(["Total Offer Discount", formatRupees(totalOfferDiscount)]);
      worksheet.addRow(["Total Orders", totalOrders]);
      worksheet.addRow([]);

      // Table Headers
      const headers = [
        "Order ID", "Customer Name", "Date", "Items",
        "Grand Total", "Offer Discount", "Coupon Discount", "Payment"
      ];
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1F4E78' }
        };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center' };
      });

      // Table Data
      orders.forEach(order => {
        worksheet.addRow([
          order.id,
          order.name,
          order.date,
          order.items,
          formatRupees(order.grandTotal),
          formatRupees(order.offerDiscount),
          formatRupees(order.couponDiscount),
          order.paymentMethod
        ]);
      });

      // Set response headers
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=SalesReport.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    }

    // Invalid format
    else {
      res.status(400).json({ success: false, message: "Invalid format" });
    }
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



module.exports = {
  getDashboard,
  getSalesReport,
  downloadSalesReport
};
