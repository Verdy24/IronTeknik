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

    printBtn.addEventListener("click", function () {
        if (!items.length) {
            alert("Tambahkan minimal 1 barang terlebih dahulu.");
            return;
        }
        window.print();
    });

    [unitPriceInput, servicePriceInput].forEach(input => {
        input.addEventListener("input", function () {
            input.value = formatNumberInput(input.value);
        });
    });
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
