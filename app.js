document.addEventListener("DOMContentLoaded", () => {
  fetch("data/project_data.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Không thể tải file JSON: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      renderSummary(data);
      renderGpmbTable(data.gpmb);
      renderConstruction(data.construction);
      renderChart(data.gpmb);
      initMap();
    })
    .catch(err => {
      console.error("Lỗi khi nạp dữ liệu:", err);
    });
});

function renderSummary(data) {
  const gpmb = data.gpmb;
  const constr = data.construction;

  const gpmbPercent = Math.round((gpmb.handedOverAreaM2 / gpmb.totalAreaM2) * 100);
  document.getElementById("kpiGpmbPercent").innerText = `${gpmbPercent}%`;
  document.getElementById("kpiGpmbDetail").innerText = `${gpmb.handedOverHouseholds} / ${gpmb.totalHouseholds} hộ dân`;

  const disbursedTy = (gpmb.disbursedVND / 1e9).toFixed(1);
  const budgetTy = (gpmb.budgetVND / 1e9).toFixed(1);
  document.getElementById("kpiDisbursed").innerText = `${disbursedTy} Tỷ`;
  document.getElementById("kpiBudgetDetail").innerText = `Kế hoạch: ${budgetTy} Tỷ`;

  document.getElementById("kpiConstructionPercent").innerText = `${constr.overallProgress}%`;
}

function renderGpmbTable(gpmb) {
  const tbody = document.getElementById("gpmbTableBody");
  tbody.innerHTML = gpmb.items.map(item => `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-6 py-4 font-medium text-slate-900">${item.id}</td>
      <td class="px-6 py-4">${item.plot}</td>
      <td class="px-6 py-4">${item.area.toLocaleString()} m²</td>
      <td class="px-6 py-4">
        <div class="w-full bg-slate-200 rounded-full h-2.5 max-w-xs">
          <div class="bg-sky-600 h-2.5 rounded-full" style="width: ${item.progress}%"></div>
        </div>
        <span class="text-xs text-slate-500 mt-1 inline-block">${item.progress}%</span>
      </td>
      <td class="px-6 py-4">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.progress === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }">
          ${item.status}
        </span>
      </td>
    </tr>
  `).join("");
}

function renderConstruction(construction) {
  const container = document.getElementById("constructionList");
  container.innerHTML = construction.tasks.map(task => `
    <div class="border border-slate-200 p-4 rounded-lg bg-slate-50/50">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-1">
        <div>
          <span class="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-700 mr-2">
            ${task.category}
          </span>
          <span class="font-medium text-slate-800">${task.task}</span>
        </div>
        <span class="text-sm font-bold ${task.progress === 100 ? 'text-emerald-600' : 'text-amber-600'}">
          ${task.progress}% - ${task.status}
        </span>
      </div>
      <div class="w-full bg-slate-200 rounded-full h-2">
        <div class="${task.progress === 100 ? 'bg-emerald-500' : 'bg-amber-500'} h-2 rounded-full transition-all duration-500" style="width: ${task.progress}%"></div>
      </div>
    </div>
  `).join("");
}

function renderChart(gpmb) {
  const ctx = document.getElementById("disbursementChart").getContext("2d");
  const conLai = (gpmb.budgetVND - gpmb.disbursedVND) / 1e9;
  const daGiaiNgan = gpmb.disbursedVND / 1e9;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Đã giải ngân (Tỷ)", "Còn lại (Tỷ)"],
      datasets: [{
        data: [daGiaiNgan, conLai],
        backgroundColor: ["#10b981", "#cbd5e1"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

// KHỞI TẠO BẢN ĐỒ VỆ TINH + GIAO THÔNG (LEAFLET + ESRI)
function initMap() {
  const canDuocCoords = [10.5985, 106.6024];

  // 1. Lớp bản đồ vệ tinh ESRI độ phân giải cao
  const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    }
  );

  // 2. Lớp bản đồ giao thông đường phố chuẩn (OpenStreetMap)
  const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  });

  // 3. Khởi tạo bản đồ với lớp mặc định là Vệ tinh
  const map = L.map("map", {
    center: canDuocCoords,
    zoom: 16,
    layers: [satelliteLayer]
  });

  // 4. Marker định vị Trạm biến áp 220kV Cần Đước
  const marker = L.marker(canDuocCoords).addTo(map);
  marker.bindPopup(`
    <div style="font-size: 13px; line-height: 1.5;">
      <b style="color: #0284c7; font-size: 14px;">TBA 220kV CẦN ĐƯỚC</b><br>
      • <b>Địa điểm:</b> Ấp 1A, Xã Tân Trạch, Cần Đước, Long An<br>
      • <b>Hạng mục:</b> Lắp MBA AT2 (220/110kV - 250MVA)<br>
      • <b>Ngăn lộ:</b> E04, E05 đấu nối TBA 110kV Tân Trụ
    </div>
  `).openPopup();

  // 5. Polygon ranh giới mặt bằng GPMB mở rộng trạm (màu vàng nổi bật trên nền vệ tinh)
  const gpmbPolygon = L.polygon([
    [10.5975, 106.6010],
    [10.5995, 106.6012],
    [10.5992, 106.6035],
    [10.5972, 106.6032]
  ], {
    color: "#eab308",
    fillColor: "#facc15",
    fillOpacity: 0.35,
    weight: 2
  }).addTo(map);

  gpmbPolygon.bindPopup("<b>Ranh giới đất mở rộng trạm (Đã bàn giao mặt bằng)</b>");

  // 6. Bộ điều khiển chuyển đổi lớp nền (Layers Control)
  const baseMaps = {
    "Ảnh vệ tinh (ESRI)": satelliteLayer,
    "Bản đồ giao thông": streetLayer
  };

  const overlayMaps = {
    "Vị trí TBA": marker,
    "Ranh GPMB": gpmbPolygon
  };

  L.control.layers(baseMaps, overlayMaps, { position: "topright" }).addTo(map);
}
