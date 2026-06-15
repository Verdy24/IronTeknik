const STORAGE_KEY = "offer-letter-items-v1";

let items = loadItems();

const itemForm = document.getElementById("itemForm");
const itemNameInput = document.getElementById("itemName");
const quantityInput = document.getElementById("quantity");
const unitInput = document.getElementById("unit");
const unitPriceInput = document.getElementById("unitPrice");
const servicePriceInput = document.getElementById("servicePrice");
const resetFormBtn = document.getElementById("resetFormBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const printBtn = document.getElementById("printBtn");
const currentDateEl = document.getElementById("currentDate");
const letterTableBody = document.getElementById("letterTableBody");
const grandTotalEl = document.getElementById("grandTotal");
const itemListEl = document.getElementById("itemList");

init();

function init() {
    currentDateEl.textContent = `Tangerang, ${formatDateIndonesia(new Date())}`;
    renderAll();
    attachEvents();
}

function attachEvents() {
    itemForm.addEventListener("submit", function (event) {
        event.preventDefault();
        addItem();
    });

    resetFormBtn.addEventListener("click", resetForm);

    clearAllBtn.addEventListener("click", function () {
        if (!items.length) return;
        const ok = confirm("Hapus semua data barang?");
        if (!ok) return;
        items = [];
        saveItems();
        renderAll();
    });

    printBtn.addEventListener("click", downloadPdf);

    [unitPriceInput, servicePriceInput].forEach(input => {
        input.addEventListener("input", function () {
            input.value = formatNumberInput(input.value);
        });
    });
}

function downloadPdf() {
    if (!items.length) {
        alert("Tambahkan minimal 1 barang terlebih dahulu.");
        return;
    }

    printBtn.disabled = true;
    printBtn.textContent = "Membuat PDF...";

    try {
        const fileName = `surat-penawaran-${formatDateFile(new Date())}.pdf`;
        const pdfBytes = buildOfferLetterPdf(items, currentDateEl.textContent);
        downloadBlob(pdfBytes, fileName, "application/pdf");
    } catch (error) {
        console.error(error);
        alert("PDF gagal dibuat. Coba gunakan browser Chrome atau Edge terbaru.");
    } finally {
        printBtn.disabled = false;
        printBtn.textContent = "Download PDF";
    }
}

function addItem() {
    const name = itemNameInput.value.trim();
    const quantity = Number(quantityInput.value);
    const unit = unitInput.value.trim().toUpperCase();
    const unitPrice = parseCurrency(unitPriceInput.value);
    const servicePrice = parseCurrency(servicePriceInput.value);

    if (!name) {
        alert("Nama barang wajib diisi.");
        return;
    }

    if (!quantity || quantity <= 0) {
        alert("Jumlah harus lebih dari 0.");
        return;
    }

    if (!unit) {
        alert("Satuan wajib diisi.");
        return;
    }

    if (!unitPrice || unitPrice <= 0) {
        alert("Harga satuan harus lebih dari 0.");
        return;
    }

    items.push({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        name,
        quantity,
        unit,
        unitPrice,
        servicePrice: servicePrice || 0
    });

    saveItems();
    renderAll();
    resetForm();
}

function resetForm() {
    itemForm.reset();
    quantityInput.value = 1;
    unitInput.value = "UNIT";
    itemNameInput.focus();
}

function renderAll() {
    renderLetterTable();
    renderItemList();
}

function renderLetterTable() {
    letterTableBody.innerHTML = "";

    if (!items.length) {
        letterTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">Belum ada data barang.</td>
            </tr>
        `;
        grandTotalEl.textContent = "0";
        return;
    }

    let grandTotal = 0;

    items.forEach((item, index) => {
        const itemSubtotal = item.quantity * item.unitPrice;
        const serviceSubtotal = item.quantity * item.servicePrice;
        const rowTotal = itemSubtotal + serviceSubtotal;
        grandTotal += rowTotal;

        const hasService = item.servicePrice > 0;
        const nameLines = hasService
            ? `<div class="main-name">${formatMultilineText(item.name)}</div><div class="service-name">JASA PEKERJAAN</div>`
            : `<div class="main-name">${formatMultilineText(item.name)}</div>`;
        const priceLines = hasService
            ? `<span class="money-line">${formatCurrency(item.unitPrice)}</span><span class="money-line service-money">${formatCurrency(item.servicePrice)}</span>`
            : `<span class="money-line">${formatCurrency(item.unitPrice)}</span>`;
        const amountLines = hasService
            ? `<span class="money-line">${formatCurrency(itemSubtotal)}</span><span class="money-line service-money">${formatCurrency(serviceSubtotal)}</span>`
            : `<span class="money-line">${formatCurrency(itemSubtotal)}</span>`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td class="name-cell">${nameLines}</td>
            <td class="quantity-cell">${item.quantity}</td>
            <td class="unit-cell">${escapeHtml(item.unit)}</td>
            <td class="price-lines">${priceLines}</td>
            <td class="amount-lines">${amountLines}</td>
            <td class="no-print action-col">
                <button type="button" class="table-action" onclick="deleteItem('${item.id}')">Hapus</button>
            </td>
        `;
        letterTableBody.appendChild(tr);
    });

    grandTotalEl.textContent = formatCurrency(grandTotal);
}

function renderItemList() {
    itemListEl.innerHTML = "";

    if (!items.length) {
        itemListEl.classList.add("empty-state");
        itemListEl.textContent = "Belum ada barang yang ditambahkan.";
        return;
    }

    itemListEl.classList.remove("empty-state");

    items.forEach((item, index) => {
        const itemSubtotal = item.quantity * item.unitPrice;
        const serviceSubtotal = item.quantity * item.servicePrice;
        const total = itemSubtotal + serviceSubtotal;

        const div = document.createElement("div");
        div.className = "item-preview";
        div.innerHTML = `
            <strong>${index + 1}. ${escapeHtml(item.name)}</strong>
            <small>Jumlah: ${item.quantity} ${escapeHtml(item.unit)}</small>
            <small>Harga barang: ${formatCurrency(item.unitPrice)} x ${item.quantity} = ${formatCurrency(itemSubtotal)}</small>
            <small>Harga jasa: ${formatCurrency(item.servicePrice)} x ${item.quantity} = ${formatCurrency(serviceSubtotal)}</small>
            <small><strong>Total: ${formatCurrency(total)}</strong></small>
        `;
        itemListEl.appendChild(div);
    });
}

function deleteItem(id) {
    items = items.filter(item => item.id !== id);
    saveItems();
    renderAll();
}

function formatDateFile(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDateIndonesia(date) {
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

function formatCurrency(value) {
    const number = Number(value) || 0;
    return number.toLocaleString("id-ID");
}

function parseCurrency(value) {
    return Number(String(value).replace(/[^0-9]/g, "")) || 0;
}

function formatNumberInput(value) {
    const number = parseCurrency(value);
    return number ? formatCurrency(number) : "";
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatMultilineText(value) {
    return escapeHtml(value).replace(/\n/g, "<br>");
}

function saveItems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadItems() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function buildOfferLetterPdf(dataItems, dateText) {
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const marginLeft = mmToPt(20);
    const marginRight = mmToPt(18);
    const marginTop = mmToPt(22);
    const marginBottom = mmToPt(18);
    const tableWidth = pageWidth - marginLeft - marginRight;
    const columns = [28, 194, 42, 42, 88, tableWidth - 28 - 194 - 42 - 42 - 88];
    const columnX = [marginLeft];

    for (let i = 0; i < columns.length; i++) {
        columnX.push(columnX[i] + columns[i]);
    }

    let pages = [];
    let page = createPdfPage(pageWidth, pageHeight);
    let y = pageHeight - marginTop;

    function addPage() {
        pages.push(page.commands.join("\n"));
        page = createPdfPage(pageWidth, pageHeight);
        y = pageHeight - marginTop;
    }

    function drawTextLine(text, x, size = 10.5, options = {}) {
        page.text(text, x, y, size, options);
        y -= options.lineHeight || size * 1.45;
    }

    function drawParagraph(text, x, maxWidth, size = 10.5, options = {}) {
        const lines = wrapPdfText(text, maxWidth, size);
        lines.forEach(line => {
            page.text(line, x, y, size, options);
            y -= options.lineHeight || size * 1.45;
        });
    }

    function drawAddressBlock() {
        page.text(dateText, pageWidth - marginRight, y, 10.5, { align: "right" });
        y -= 25;

        drawTextLine("Kepada Yth.", marginLeft, 10.5);
        drawTextLine("PT. COMETA CAN", marginLeft, 10.5);
        drawTextLine("Jalan Telesonic Ujung KM.8 No. 5", marginLeft, 10.5);
        drawTextLine("Pasir Jaya, Jati Uwung", marginLeft, 10.5);
        drawTextLine("Kota Tangerang, Banten 15135", marginLeft, 10.5);
        y -= 7;

        drawTextLine("Perihal: Penawaran Harga Jasa Gulung dan Servis Dinamo", marginLeft, 10.5, { bold: true });
        y -= 7;

        drawTextLine("Dengan hormat,", marginLeft, 10.5);
        drawParagraph(
            "Sehubungan dengan kebutuhan jasa servis dan gulung dinamo, bersama ini kami sampaikan penawaran harga dengan rincian sebagai berikut:",
            marginLeft,
            tableWidth,
            10.5
        );
        y -= 8;
    }

    function drawTableHeader() {
        const headerHeight = 24;
        const top = y;
        const bottom = y - headerHeight;

        page.line(marginLeft, top, marginLeft + tableWidth, top, 0.7);
        page.line(marginLeft, bottom, marginLeft + tableWidth, bottom, 0.7);

        columnX.forEach(x => page.line(x, top, x, bottom, 0.7));

        const headers = ["No", "Nama Barang", "Jumlah", "Unit", "Harga Satuan (Rp)", "Jumlah (Rp)"];
        headers.forEach((header, index) => {
            const centerX = columnX[index] + columns[index] / 2;
            page.text(header, centerX, top - 15, 8.5, { bold: true, align: "center" });
        });

        y = bottom;
    }

    function drawItemRow(item, index) {
        const hasService = item.servicePrice > 0;
        const nameLines = wrapPdfText(item.name, columns[1] - 14, 9.3);
        const nameHeight = nameLines.length * 12 + (hasService ? 20 : 0);
        const moneyHeight = hasService ? 31 : 13;
        const rowHeight = Math.max(34, nameHeight + 12, moneyHeight + 12);
        const top = y;
        const bottom = y - rowHeight;

        page.line(marginLeft, top, marginLeft + tableWidth, top, 0.6);
        page.line(marginLeft, bottom, marginLeft + tableWidth, bottom, 0.6);
        columnX.forEach(x => page.line(x, top, x, bottom, 0.6));

        const midY = top - rowHeight / 2 - 3;
        page.text(String(index + 1), columnX[0] + columns[0] / 2, midY, 9.5, { align: "center" });
        page.text(String(item.quantity), columnX[2] + columns[2] / 2, midY, 9.5, { align: "center" });
        page.text(String(item.unit).toUpperCase(), columnX[3] + columns[3] / 2, midY, 9.5, { align: "center" });

        let nameY = top - 14;
        nameLines.forEach(line => {
            page.text(line, columnX[1] + 7, nameY, 9.3);
            nameY -= 12;
        });

        if (hasService) {
            nameY -= 7;
            page.text("JASA PEKERJAAN", columnX[1] + 7, nameY, 9.3);
        }

        const itemSubtotal = item.quantity * item.unitPrice;
        const serviceSubtotal = item.quantity * item.servicePrice;
        let priceY = top - 14;
        page.text(formatCurrency(item.unitPrice), columnX[5] - 7, priceY, 9.3, { align: "right" });
        page.text(formatCurrency(itemSubtotal), columnX[6] - 7, priceY, 9.3, { align: "right" });

        if (hasService) {
            priceY -= 19;
            page.text(formatCurrency(item.servicePrice), columnX[5] - 7, priceY, 9.3, { align: "right" });
            page.text(formatCurrency(serviceSubtotal), columnX[6] - 7, priceY, 9.3, { align: "right" });
        }

        y = bottom;
    }

    function drawTotalRow(total) {
        const rowHeight = 23;
        const top = y;
        const bottom = y - rowHeight;
        const labelX1 = columnX[0];
        const labelX2 = columnX[5];

        page.line(marginLeft, top, marginLeft + tableWidth, top, 0.7);
        page.line(marginLeft, bottom, marginLeft + tableWidth, bottom, 0.7);
        page.line(labelX1, top, labelX1, bottom, 0.7);
        page.line(labelX2, top, labelX2, bottom, 0.7);
        page.line(columnX[6], top, columnX[6], bottom, 0.7);

        page.text("Jumlah", labelX1 + (labelX2 - labelX1) / 2, top - 15, 9.5, { bold: true, align: "center" });
        page.text(formatCurrency(total), columnX[6] - 7, top - 15, 9.5, { bold: true, align: "right" });

        y = bottom - 15;
    }

    function drawFinalSection() {
        drawTextLine("Note:", marginLeft, 10.5, { bold: true });
        drawTextLine("* Harga belum termasuk pajak (PPN 11%).", marginLeft, 10.5);

        const notePrefix = "* Pembayaran dilakukan melalui transfer bank BCA ";
        const rekText = "no rek 7130 9908 64";
        const noteSuffix = " atas nama Heri Widodo.";
        page.text(notePrefix, marginLeft, y, 10.5);
        page.text(rekText, marginLeft + estimatePdfTextWidth(notePrefix, 10.5), y, 10.5, { bold: true });
        page.text(noteSuffix, marginLeft + estimatePdfTextWidth(notePrefix, 10.5) + estimatePdfTextWidth(rekText, 10.5, true) + 4, y, 10.5);
        y -= 24;

        drawParagraph(
            "Demikian penawaran ini kami sampaikan. Kami berharap dapat menjalin kerja sama yang baik dengan perusahaan Anda. Atas perhatian dan kepercayaannya, kami ucapkan terima kasih.",
            marginLeft,
            tableWidth,
            10.5
        );
        y -= 18;

        drawTextLine("Hormat kami,", marginLeft, 10.5);
        drawTextLine("IRON TEKNIK", marginLeft, 10.5, { bold: true });
        y -= 40;
        drawTextLine("Heri Widodo", marginLeft, 10.5);
    }

    drawAddressBlock();
    drawTableHeader();

    const grandTotal = dataItems.reduce((total, item) => {
        return total + (item.quantity * item.unitPrice) + (item.quantity * item.servicePrice);
    }, 0);

    dataItems.forEach((item, index) => {
        const hasService = item.servicePrice > 0;
        const rowPreviewLines = wrapPdfText(item.name, columns[1] - 14, 9.3).length;
        const estimatedRowHeight = Math.max(34, rowPreviewLines * 12 + (hasService ? 32 : 12));
        const reserveFinalSpace = index === dataItems.length - 1 ? 190 : 40;

        if (y - estimatedRowHeight < marginBottom + reserveFinalSpace) {
            addPage();
            page.text("Lanjutan Penawaran Harga", marginLeft, y, 11, { bold: true });
            y -= 22;
            drawTableHeader();
        }

        drawItemRow(item, index);
    });

    if (y < marginBottom + 205) {
        addPage();
        page.text("Lanjutan Penawaran Harga", marginLeft, y, 11, { bold: true });
        y -= 22;
        drawTableHeader();
    }

    drawTotalRow(grandTotal);
    drawFinalSection();

    pages.push(page.commands.join("\n"));

    return createPdfFile(pages, pageWidth, pageHeight);
}

function createPdfPage(width, height) {
    return {
        width,
        height,
        commands: [],
        text(value, x, y, size, options = {}) {
            const text = escapePdfText(value);
            const font = options.bold ? "F2" : "F1";
            let drawX = x;

            if (options.align === "right") {
                drawX = x - estimatePdfTextWidth(value, size, options.bold);
            } else if (options.align === "center") {
                drawX = x - estimatePdfTextWidth(value, size, options.bold) / 2;
            }

            this.commands.push(`BT /${font} ${fixed(size)} Tf 1 0 0 1 ${fixed(drawX)} ${fixed(y)} Tm (${text}) Tj ET`);
        },
        line(x1, y1, x2, y2, width = 0.5) {
            this.commands.push(`${fixed(width)} w ${fixed(x1)} ${fixed(y1)} m ${fixed(x2)} ${fixed(y2)} l S`);
        }
    };
}

function createPdfFile(pageStreams, pageWidth, pageHeight) {
    const objects = [];

    function addObject(body) {
        objects.push(body);
        return objects.length;
    }

    const catalogId = addObject("");
    const pagesId = addObject("");
    const regularFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    const boldFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    const pageIds = [];

    pageStreams.forEach(stream => {
        const contentId = addObject(`<< /Length ${asciiByteLength(stream)} >>\nstream\n${stream}\nendstream`);
        const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${fixed(pageWidth)} ${fixed(pageHeight)}] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
        pageIds.push(pageId);
    });

    objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

    let pdf = "%PDF-1.4\n% Full offline PDF generator\n";
    const offsets = [0];

    objects.forEach((body, index) => {
        offsets.push(asciiByteLength(pdf));
        pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
    });

    const xrefOffset = asciiByteLength(pdf);
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";

    for (let i = 1; i < offsets.length; i++) {
        pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new TextEncoder().encode(pdf);
}

function downloadBlob(bytes, fileName, mimeType) {
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function mmToPt(value) {
    return value * 2.8346456693;
}

function fixed(value) {
    return Number(value).toFixed(2);
}

function asciiByteLength(value) {
    return new TextEncoder().encode(value).length;
}

function escapePdfText(value) {
    return sanitizePdfText(value)
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");
}

function sanitizePdfText(value) {
    return String(value ?? "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[–—]/g, "-")
        .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");
}

function wrapPdfText(value, maxWidth, size) {
    const paragraphs = sanitizePdfText(value).split(/\r?\n/);
    const lines = [];

    paragraphs.forEach(paragraph => {
        const words = paragraph.trim().split(/\s+/).filter(Boolean);

        if (!words.length) {
            lines.push("");
            return;
        }

        let current = "";

        words.forEach(word => {
            const test = current ? `${current} ${word}` : word;

            if (estimatePdfTextWidth(test, size) <= maxWidth || !current) {
                current = test;
            } else {
                lines.push(current);
                current = word;
            }
        });

        if (current) {
            lines.push(current);
        }
    });

    return lines;
}

function estimatePdfTextWidth(value, size, bold = false) {
    const text = sanitizePdfText(value);
    let units = 0;

    for (const char of text) {
        if (char === " ") units += 0.28;
        else if (char === "." || char === "," || char === ":" || char === ";" || char === "'" || char === "i" || char === "l" || char === "I") units += 0.28;
        else if (char === "m" || char === "w" || char === "M" || char === "W") units += 0.82;
        else if (/[0-9]/.test(char)) units += 0.56;
        else if (/[A-Z]/.test(char)) units += 0.62;
        else units += 0.50;
    }

    return units * size * (bold ? 1.04 : 1);
}
