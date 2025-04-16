const PDFDocument = require("pdfkit");
const axios = require("axios");
const sharp = require("sharp");

const generatePDF = async (deliveryNote) => {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const client = deliveryNote.clientId || {};
    const project = deliveryNote.projectId || {};
    const user = deliveryNote.userId || {};
    const company = deliveryNote.company || {};
    const fecha = new Date(deliveryNote.createdAt || Date.now()).toLocaleDateString();

    // Header
    doc.rect(0, 0, doc.page.width, 70).fill("#3366cc");
    doc.fillColor("white").fontSize(24).text("DELIVERY NOTE", 50, 25, { align: "left" });

    doc.moveDown(3).fillColor("black").fontSize(10);

    // Client
    doc.text("DELIVER TO", 50, 90).text(client.name)
      .text(`${client.street}, ${client.number}`)
      .text(`${client.postal}, ${client.city}`)
      .text(client.province).text(client.email || "-");

    doc.text("SHIP TO", 250, 90).text(client.name, 250)
      .text(`${client.street}, ${client.number}`, 250)
      .text(`${client.postal}, ${client.city}`, 250)
      .text(client.province, 250).text(client.email || "-", 250);

    doc.text("DELIVERY DATE", 450, 90).text(fecha, 450)
      .text("PROJECT NAME", 450).text(project.name || "-", 450);

    // Company
    doc.moveDown(2).font("Helvetica-Bold").fontSize(12)
      .text(company.name || "Empresa", { align: "center" });

    doc.font("Helvetica").fontSize(10)
      .text(company.address || "", { align: "center" });

    // Table
    doc.moveDown();
    const tableTop = doc.y + 10;
    const itemY = tableTop + 20;

    doc.fillColor("#3366cc").font("Helvetica-Bold").fontSize(10)
      .text("DESCRIPTION", 50, tableTop)
      .text("UNIT PRICE", 250, tableTop)
      .text("QTY", 330, tableTop)
      .text("AMOUNT", 400, tableTop);

    doc.fillColor("black").font("Helvetica").fontSize(10);

    if (deliveryNote.format === "material") {
      doc.text(deliveryNote.material, 50, itemY)
        .text("0.00", 250, itemY)
        .text(deliveryNote.quantity?.toString() || "0", 330, itemY)
        .text("0.00", 400, itemY);
    } else {
      doc.text("Labor (hours)", 50, itemY)
        .text("0.00", 250, itemY)
        .text(deliveryNote.hours?.toString() || "0", 330, itemY)
        .text("0.00", 400, itemY);
    }

    // Signature
    doc.moveDown(4);
    doc.font("Helvetica-Bold").text("Signature", 50);

    try {
      if (deliveryNote.signBuffer && Buffer.isBuffer(deliveryNote.signBuffer)) {
        try {
          const resizedBuffer = await sharp(deliveryNote.signBuffer)
            .resize(600, 200, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
            .png()
            .toBuffer();

          doc.image(resizedBuffer, 50, doc.y + 5, { width: 120 });
        } catch (err) {
          doc.fillColor("red").text("[Error rendering buffer signature]");
        }
      } else if (deliveryNote.sign) {
        try {
          const res = await axios.get(deliveryNote.sign, { responseType: "arraybuffer" });
          const resizedBuffer = await sharp(res.data)
            .resize(600, 200, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
            .png()
            .toBuffer();

          doc.image(resizedBuffer, 50, doc.y + 5, { width: 120 });
        } catch (err) {
          doc.fillColor("red").text("[Error loading signature from URL]");
        }
      } else {
        doc.fillColor("#ccc").text("Pending signature");
      }
    } catch (err) {
      doc.fillColor("red").text("[Unexpected error handling signature]");
    }

    // Footer
    doc.moveDown(5);
    doc.fontSize(8).fillColor("gray")
      .text("Terms & Conditions", 50)
      .text("Payment is due within 15 days", 50)
      .text("Please make checks payable to: " + (company.name || "Your Company"), 50);

    doc.end();
  });
};

module.exports = { generatePDF };
