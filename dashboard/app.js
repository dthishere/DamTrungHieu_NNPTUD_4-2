const API = "https://api.escuelajs.co/api/v1/products";

let products = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 10;
let sortField = "";
let sortAsc = true;

// LOAD DATA
async function loadData() {
  const res = await fetch(API);
  products = await res.json();
  render();
}

// RENDER TABLE
function render() {
  filteredData = [...products];

  // SEARCH
  const keyword = searchInput.value.toLowerCase();
  filteredData = filteredData.filter(p =>
    p.title.toLowerCase().includes(keyword)
  );

  // SORT
  if (sortField) {
    filteredData.sort((a, b) => {
      if (typeof a[sortField] === "string") {
        return sortAsc
          ? a[sortField].localeCompare(b[sortField])
          : b[sortField].localeCompare(a[sortField]);
      }
      return sortAsc
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    });
  }

  // PAGINATION
  const start = (currentPage - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);

  tableBody.innerHTML = pageData.map(p => `
    <tr onclick="openDetail(${p.id})" title="${p.description}">
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>$${p.price}</td>
      <td>${p.category?.name}</td>
      <td><img src="${p.images[0]}" width="50"></td>
    </tr>
  `).join("");

  renderPagination(filteredData.length);
}

// PAGINATION
function renderPagination(total) {
  const pages = Math.ceil(total / pageSize);
  pagination.innerHTML = "";

  for (let i = 1; i <= pages; i++) {
    pagination.innerHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link" onclick="goPage(${i})">${i}</a>
      </li>
    `;
  }
}

function goPage(p) {
  currentPage = p;
  render();
}

// SORT
function sortBy(field) {
  if (sortField === field) sortAsc = !sortAsc;
  else {
    sortField = field;
    sortAsc = true;
  }
  render();
}

// OPEN DETAIL
function openDetail(id) {
  const p = products.find(x => x.id === id);

  editId.value = p.id;
  editTitle.value = p.title;
  editPrice.value = p.price;
  editDesc.value = p.description;

  new bootstrap.Modal(detailModal).show();
}

// UPDATE PRODUCT
async function updateProduct() {
  await fetch(`${API}/${editId.value}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: editTitle.value,
      price: Number(editPrice.value),
      description: editDesc.value,
      categoryId: 1,
      images: ["https://placeimg.com/640/480/any"]
    })
  });

  await loadData();
  bootstrap.Modal.getInstance(detailModal).hide();
}

// CREATE PRODUCT
async function createProduct() {
  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: newTitle.value,
      price: Number(newPrice.value),
      description: newDesc.value,
      categoryId: 1,
      images: ["https://placeimg.com/640/480/any"]
    })
  });

  newTitle.value = "";
  newPrice.value = "";
  newDesc.value = "";

  await loadData();
  bootstrap.Modal.getInstance(createModal).hide();
}

// EXPORT CSV (VIEW HIỆN TẠI)
function exportCSV() {
  let csv = "ID,Title,Price,Category\n";
  filteredData.forEach(p => {
    csv += `${p.id},"${p.title}",${p.price},"${p.category?.name}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "products_view.csv";
  a.click();
}

// EVENTS
searchInput.oninput = () => {
  currentPage = 1;
  render();
};

pageSize.onchange = e => {
  pageSize = Number(e.target.value);
  currentPage = 1;
  render();
};

// INIT
loadData();
