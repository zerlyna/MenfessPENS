
// =====================================================
// MENFESS PENS - SENTIMENT DASHBOARD
// FINAL VERSION - CLAYMORPHISM UI
// =====================================================

// =====================================================
// 1. KONFIGURASI
// =====================================================

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei",
  "Juni", "Juli", "Agustus", "September", "Oktober"
];

const TOPICS = [
  "Akademik & Perkuliahan",
  "Kegiatan & Acara Kampus",
  "Kehidupan & Kesejahteraan Mahasiswa",
  "Layanan & Fasilitas Kampus",
  "Organisasi & Pengembangan Mahasiswa"
];

const SENTIMENTS = ["positif", "negatif", "netral"];

const COLORS = {
  positif: "#29966d",
  negatif: "#df6262",
  netral: "#e8c416",
  blue: "#14487a",
  blueDark: "#102f50",
  yellow: "#e8c416"
};

let currentData = [];
let selectedFile = null;
let charts = {};

// Mengatur font seluruh grafik Chart.js
Chart.defaults.font.family = "Poppins";
Chart.defaults.font.size = 11;
Chart.defaults.color = "#718198";
Chart.defaults.plugins.legend.labels.boxWidth = 10;
Chart.defaults.plugins.legend.labels.padding = 15;


// =====================================================
// 2. DATA DEMO JANUARI - OKTOBER 2026
// Data ini hanya ilustrasi, bukan data asli Menfess.
// =====================================================

const examples = [
  {
    topic: TOPICS[0],
    text: "Dosen menjelaskan materi perkuliahan dengan sangat baik"
  },
  {
    topic: TOPICS[0],
    text: "Jadwal kuliah sering berubah secara mendadak"
  },
  {
    topic: TOPICS[0],
    text: "Informasi jadwal UTS sudah dibagikan"
  },
  {
    topic: TOPICS[1],
    text: "Acara kampus tahun ini sangat seru dan bermanfaat"
  },
  {
    topic: TOPICS[1],
    text: "Informasi kegiatan kampus kurang jelas"
  },
  {
    topic: TOPICS[1],
    text: "Pendaftaran kegiatan kampus sudah dibuka"
  },
  {
    topic: TOPICS[2],
    text: "Lingkungan pertemanan di kampus sangat menyenangkan"
  },
  {
    topic: TOPICS[2],
    text: "Mahasiswa merasa kelelahan karena tugas terlalu banyak"
  },
  {
    topic: TOPICS[2],
    text: "Banyak mahasiswa menghabiskan waktu di kampus"
  },
  {
    topic: TOPICS[3],
    text: "Fasilitas perpustakaan cukup nyaman untuk belajar"
  },
  {
    topic: TOPICS[3],
    text: "Wifi kampus sering lambat saat digunakan"
  },
  {
    topic: TOPICS[3],
    text: "Beberapa ruang kelas sedang diperbaiki"
  },
  {
    topic: TOPICS[4],
    text: "Organisasi mahasiswa memberikan banyak pengalaman"
  },
  {
    topic: TOPICS[4],
    text: "Koordinasi organisasi masih kurang efektif"
  },
  {
    topic: TOPICS[4],
    text: "Pendaftaran anggota organisasi telah dibuka"
  }
];

function createDemoData() {
  const result = [];

  const monthlyTotals = [
    45, 52, 58, 63, 70,
    74, 80, 85, 92, 100
  ];

  const sentimentWeights = [
    [0.48, 0.30, 0.22],
    [0.46, 0.32, 0.22],
    [0.45, 0.33, 0.22],
    [0.47, 0.31, 0.22],
    [0.44, 0.34, 0.22],
    [0.43, 0.35, 0.22],
    [0.45, 0.33, 0.22],
    [0.46, 0.32, 0.22],
    [0.44, 0.35, 0.21],
    [0.45, 0.34, 0.21]
  ];

  const hourWeights = [
    1, 1, 1, 1, 1, 2,
    3, 4, 5, 4, 4, 6,
    8, 7, 5, 4, 5, 7,
    9, 10, 9, 7, 5, 3
  ];

  let seed = 2026;

  function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  function weightedHour() {
    const totalWeight = hourWeights.reduce((a, b) => a + b, 0);
    let value = random() * totalWeight;

    for (let hour = 0; hour < 24; hour++) {
      value -= hourWeights[hour];

      if (value <= 0) return hour;
    }

    return 19;
  }

  monthlyTotals.forEach((total, monthIndex) => {
    for (let i = 0; i < total; i++) {
      const example = examples[
        Math.floor(random() * examples.length)
      ];

      const weights = sentimentWeights[monthIndex];
      const sentimentRandom = random();

      let sentiment;

      if (sentimentRandom < weights[0]) {
        sentiment = "positif";
      } else if (sentimentRandom < weights[0] + weights[1]) {
        sentiment = "negatif";
      } else {
        sentiment = "netral";
      }

      result.push({
        month: MONTHS[monthIndex],
        topic: example.topic,
        sentiment,
        text: example.text,
        hour: weightedHour()
      });
    }
  });

  return result;
}


// =====================================================
// 3. FUNGSI UTILITAS
// =====================================================

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeKey(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function normalizeMonth(value) {
  if (value instanceof Date && !isNaN(value)) {
    const monthNumber = value.getMonth() + 1;

    return monthNumber >= 1 && monthNumber <= 10
      ? MONTHS[monthNumber - 1]
      : null;
  }

  const raw = normalizeText(value);
  const key = normalizeKey(raw);

  const aliases = {
    "1": "Januari", "01": "Januari",
    januari: "Januari", jan: "Januari",

    "2": "Februari", "02": "Februari",
    februari: "Februari", feb: "Februari",

    "3": "Maret", "03": "Maret",
    maret: "Maret", mar: "Maret",

    "4": "April", "04": "April",
    april: "April", apr: "April",

    "5": "Mei", "05": "Mei", mei: "Mei",

    "6": "Juni", "06": "Juni",
    juni: "Juni", jun: "Juni",

    "7": "Juli", "07": "Juli",
    juli: "Juli", jul: "Juli",

    "8": "Agustus", "08": "Agustus",
    agustus: "Agustus", agu: "Agustus", aug: "Agustus",

    "9": "September", "09": "September",
    september: "September", sep: "September",

    "10": "Oktober", oktober: "Oktober",
    okt: "Oktober", oct: "Oktober"
  };

  if (aliases[key]) return aliases[key];

  // Format YYYY-MM-DD atau YYYY/MM/DD
  let match = raw.match(/^(\d{4})[-/](\d{1,2})[-/]\d{1,2}/);

  if (match) {
    const monthNumber = Number(match[2]);

    return monthNumber >= 1 && monthNumber <= 10
      ? MONTHS[monthNumber - 1]
      : null;
  }

  // Format DD-MM-YYYY atau DD/MM/YYYY
  match = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/]\d{4}$/);

  if (match) {
    const monthNumber = Number(match[2]);

    return monthNumber >= 1 && monthNumber <= 10
      ? MONTHS[monthNumber - 1]
      : null;
  }

  return null;
}

function normalizeSentiment(value) {
  const key = normalizeKey(value);

  const aliases = {
    positif: "positif",
    positive: "positif",
    negatif: "negatif",
    negative: "negatif",
    netral: "netral",
    neutral: "netral"
  };

  return aliases[key] || null;
}

function normalizeTopic(value) {
  const key = normalizeKey(value);

  const aliases = {
    akademik: TOPICS[0],
    perkuliahan: TOPICS[0],
    akademikperkuliahan: TOPICS[0],

    kegiatan: TOPICS[1],
    acarakampus: TOPICS[1],
    kegiatanacarakampus: TOPICS[1],

    kehidupanmahasiswa: TOPICS[2],
    kesejahteraanmahasiswa: TOPICS[2],
    kehidupandankesejahteraanmahasiswa: TOPICS[2],

    fasilitas: TOPICS[3],
    fasilitaskampus: TOPICS[3],
    layanankampus: TOPICS[3],
    layanandanfasilitaskampus: TOPICS[3],

    organisasi: TOPICS[4],
    pengembanganmahasiswa: TOPICS[4],
    organisasidanpengembanganmahasiswa: TOPICS[4]
  };

  return aliases[key] ||
    TOPICS.find(topic => normalizeKey(topic) === key) ||
    null;
}

function findColumn(headers, candidates) {
  const normalizedHeaders = headers.map(normalizeKey);

  for (const candidate of candidates) {
    const index = normalizedHeaders.indexOf(
      normalizeKey(candidate)
    );

    if (index !== -1) return headers[index];
  }

  return null;
}

function countBy(data, key, value) {
  return data.filter(item => item[key] === value).length;
}

function percentage(part, total) {
  return total ? (part / total) * 100 : 0;
}

function formatNumber(value) {
  return Number(value).toLocaleString("id-ID");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}


// =====================================================
// 4. EKSTRAKSI JAM PENGIRIMAN
// =====================================================

function extractHour(value) {
  if (value instanceof Date && !isNaN(value)) {
    return value.getHours();
  }

  if (typeof value === "number" && value >= 0 && value < 1) {
    return Math.floor(value * 24);
  }

  const raw = normalizeText(value);

  if (!raw) return null;

  // Format HH:mm atau HH:mm:ss
  let match = raw.match(
    /(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/
  );

  if (match) {
    const hour = Number(match[1]);

    return hour >= 0 && hour <= 23 ? hour : null;
  }

  return null;
}


// =====================================================
// 5. NAVIGASI SIDEBAR
// =====================================================

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    const target = button.dataset.page;

    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    document.querySelectorAll(".page").forEach(page => {
      page.classList.toggle(
        "active",
        page.id === target
      );
    });

    const isDashboard = target === "dashboard";

    document.getElementById("pageHeading").textContent =
      isDashboard ? "Dashboard Overview" : "Upload Dataset";

    document.getElementById("pageSubheading").textContent =
      isDashboard
        ? "Pantau sentimen dan aktivitas pengiriman Menfess PENS."
        : "Unggah dataset untuk memperbarui hasil analisis dashboard.";

    setTimeout(() => {
      Object.values(charts).forEach(chart => {
        if (chart) chart.resize();
      });
    }, 100);
  });
});


// =====================================================
// 6. FILTER DASHBOARD
// =====================================================

function getFilteredData() {
  const month = document.getElementById("monthFilter").value;
  const topic = document.getElementById("topicFilter").value;
  const sentiment = document.getElementById("sentimentFilter").value;

  const keyword = document.getElementById("keywordSearch")
    .value.trim().toLowerCase();

  return currentData.filter(item => {
    const matchMonth =
      month === "all" || item.month === month;

    const matchTopic =
      topic === "all" || item.topic === topic;

    const matchSentiment =
      sentiment === "all" || item.sentiment === sentiment;

    const matchKeyword =
      !keyword || item.text.toLowerCase().includes(keyword);

    return (
      matchMonth &&
      matchTopic &&
      matchSentiment &&
      matchKeyword
    );
  });
}

[
  "monthFilter",
  "topicFilter",
  "sentimentFilter"
].forEach(id => {
  document.getElementById(id).addEventListener(
    "change",
    updateDashboard
  );
});

document.getElementById("keywordSearch").addEventListener(
  "input",
  updateDashboard
);

document.getElementById("resetFilters").addEventListener(
  "click",
  () => {
    resetAllFilters();
    updateDashboard();
  }
);

function resetAllFilters() {
  document.getElementById("monthFilter").value = "all";
  document.getElementById("topicFilter").value = "all";
  document.getElementById("sentimentFilter").value = "all";
  document.getElementById("keywordSearch").value = "";
  document.getElementById("trendSentimentFilter").value = "all";
}


// =====================================================
// 7. UPDATE DASHBOARD
// =====================================================

function updateDashboard() {
  const data = getFilteredData();

  updateKPI(data);
  updateSentimentChart(data);
  updateTrendChart();
  updateCategoryChart(data);
  updateRushHour(data);
  updateKeywords(data);
  updatePriorities(data);
}


// =====================================================
// 8. RINGKASAN SENTIMEN
// =====================================================

function updateKPI(data) {
  const total = data.length;

  const positive = countBy(data, "sentiment", "positif");
  const negative = countBy(data, "sentiment", "negatif");
  const neutral = countBy(data, "sentiment", "netral");

  document.getElementById("totalPosts").textContent =
    formatNumber(total);

  document.getElementById("positiveTotal").textContent =
    formatNumber(positive);

  document.getElementById("negativeTotal").textContent =
    formatNumber(negative);

  document.getElementById("neutralTotal").textContent =
    formatNumber(neutral);

  document.getElementById("positivePercent").textContent =
    `${percentage(positive, total).toFixed(1)}% dari total`;

  document.getElementById("negativePercent").textContent =
    `${percentage(negative, total).toFixed(1)}% dari total`;

  document.getElementById("neutralPercent").textContent =
    `${percentage(neutral, total).toFixed(1)}% dari total`;
}


// =====================================================
// 9. DISTRIBUSI SENTIMEN
// =====================================================

function updateSentimentChart(data) {
  const values = SENTIMENTS.map(sentiment =>
    countBy(data, "sentiment", sentiment)
  );

  if (charts.sentiment) {
    charts.sentiment.destroy();
  }

  charts.sentiment = new Chart(
    document.getElementById("sentimentChart"),
    {
      type: "doughnut",

      data: {
        labels: ["Positif", "Negatif", "Netral"],

        datasets: [{
          data: values,

          backgroundColor: [
            COLORS.positif,
            COLORS.negatif,
            COLORS.netral
          ],

          borderWidth: 0,
          hoverOffset: 7
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",

        plugins: {
          legend: {
            display: false
          },

          tooltip: {
            titleFont: {
              family: "Poppins",
              size: 12
            },

            bodyFont: {
              family: "Poppins",
              size: 11
            }
          }
        }
      }
    }
  );

  const total = data.length;

  document.getElementById("sentimentLegend").innerHTML =
    SENTIMENTS.map((sentiment, index) => {
      const colors = [
        COLORS.positif,
        COLORS.negatif,
        COLORS.netral
      ];

      return `
        <div class="legend-item">
          <span class="legend-name">
            <i
              class="legend-dot"
              style="background:${colors[index]}"
            ></i>

            ${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
          </span>

          <span class="legend-value">
            ${values[index]}
            (${percentage(values[index], total).toFixed(1)}%)
          </span>
        </div>
      `;
    }).join("");
}


// =====================================================
// 10. TREN SENTIMEN JANUARI - OKTOBER
// =====================================================

document.getElementById("trendSentimentFilter")
  .addEventListener("change", updateTrendChart);

function updateTrendChart() {
  const selectedSentiment =
    document.getElementById("trendSentimentFilter").value;

  const selectedMonth =
    document.getElementById("monthFilter").value;

  const selectedTopic =
    document.getElementById("topicFilter").value;

  const keyword = document.getElementById("keywordSearch")
    .value.trim().toLowerCase();

  const trendData = currentData.filter(item => {
    return (
      (selectedMonth === "all" || item.month === selectedMonth) &&
      (selectedTopic === "all" || item.topic === selectedTopic) &&
      (!keyword || item.text.toLowerCase().includes(keyword))
    );
  });

  const datasets = SENTIMENTS
    .filter(sentiment =>
      selectedSentiment === "all" ||
      sentiment === selectedSentiment
    )
    .map(sentiment => ({
      label: sentiment.charAt(0).toUpperCase() +
        sentiment.slice(1),

      data: MONTHS.map(month =>
        countBy(
          trendData.filter(item => item.month === month),
          "sentiment",
          sentiment
        )
      ),

      borderColor: COLORS[sentiment],
      backgroundColor: COLORS[sentiment],
      borderWidth: 3,
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 7
    }));

  if (charts.trend) {
    charts.trend.destroy();
  }

  charts.trend = new Chart(
    document.getElementById("trendChart"),
    {
      type: "line",

      data: {
        labels: MONTHS,
        datasets
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
          intersect: false,
          mode: "index"
        },

        plugins: {
          legend: {
            position: "bottom",

            labels: {
              usePointStyle: true,
              boxWidth: 9,
              padding: 18,

              font: {
                family: "Poppins",
                size: 11
              }
            }
          }
        },

        scales: {
          y: {
            beginAtZero: true,

            ticks: {
              precision: 0,
              font: {
                family: "Poppins",
                size: 11
              }
            },

            grid: {
              color: "#e5eaf1"
            }
          },

          x: {
            ticks: {
              font: {
                family: "Poppins",
                size: 10
              }
            },

            grid: {
              display: false
            }
          }
        }
      }
    }
  );
}


// =====================================================
// 11. ANALISIS KATEGORI
// =====================================================

function updateCategoryChart(data) {
  const values = TOPICS.map(topic =>
    countBy(data, "topic", topic)
  );

  if (charts.category) {
    charts.category.destroy();
  }

  charts.category = new Chart(
    document.getElementById("categoryChart"),
    {
      type: "bar",

      data: {
        labels: [
          ["Akademik &", "Perkuliahan"],
          ["Kegiatan & Acara", "Kampus"],
          ["Kehidupan &", "Kesejahteraan"],
          ["Layanan & Fasilitas", "Kampus"],
          ["Organisasi &", "Pengembangan"]
        ],

        datasets: [{
          label: "Jumlah Postingan",
          data: values,

          backgroundColor: [
            "#14487a",
            "#376b99",
            "#e8c416",
            "#77a2c5",
            "#29966d"
          ],

          borderRadius: 8,
          maxBarThickness: 40
        }]
      },

      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false
          }
        },

        scales: {
          x: {
            beginAtZero: true,

            ticks: {
              precision: 0,

              font: {
                family: "Poppins",
                size: 10
              }
            },

            grid: {
              color: "#e5eaf1"
            }
          },

          y: {
            ticks: {
              font: {
                family: "Poppins",
                size: 10
              }
            },

            grid: {
              display: false
            }
          }
        }
      }
    }
  );
}


// =====================================================
// 12. RUSH HOUR PENGIRIMAN MENFESS
// =====================================================

function updateRushHour(data) {
  const hourlyCounts = Array(24).fill(0);

  data.forEach(item => {
    if (
      Number.isInteger(item.hour) &&
      item.hour >= 0 &&
      item.hour <= 23
    ) {
      hourlyCounts[item.hour]++;
    }
  });

  const hasTimeData = data.some(item =>
    Number.isInteger(item.hour) &&
    item.hour >= 0 &&
    item.hour <= 23
  );

  if (charts.rush) {
    charts.rush.destroy();
  }

  const peakCount = Math.max(...hourlyCounts);
  const peakIndex = hourlyCounts.indexOf(peakCount);

  charts.rush = new Chart(
    document.getElementById("rushChart"),
    {
      type: "bar",

      data: {
        labels: Array.from(
          { length: 24 },
          (_, hour) => String(hour).padStart(2, "0")
        ),

        datasets: [{
          label: "Jumlah Menfess",
          data: hourlyCounts,

          backgroundColor: hourlyCounts.map(count =>
            count === peakCount && count > 0
              ? COLORS.yellow
              : "#8eacc7"
          ),

          borderRadius: 5,
          maxBarThickness: 15
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false
          },

          tooltip: {
            callbacks: {
              title: items =>
                `${items[0].label}:00–${items[0].label}:59`,

              label: item =>
                `${item.raw} postingan`
            }
          }
        },

        scales: {
          x: {
            grid: {
              display: false
            },

            ticks: {
              autoSkip: false,
              maxRotation: 0,

              font: {
                family: "Poppins",
                size: 9
              },

              callback: function(value, index) {
                return index % 3 === 0
                  ? this.getLabelForValue(value)
                  : "";
              }
            }
          },

          y: {
            beginAtZero: true,

            ticks: {
              precision: 0,

              font: {
                family: "Poppins",
                size: 10
              }
            },

            grid: {
              color: "#e5eaf1"
            }
          }
        }
      }
    }
  );

  const peakHourElement =
    document.getElementById("peakHour");

  const insightElement =
    document.getElementById("rushInsight");

  if (!hasTimeData) {
    peakHourElement.textContent = "--:--";

    insightElement.textContent =
      "Dataset belum memiliki informasi jam pengiriman. Tambahkan kolom time agar Rush Hour dapat dihitung.";

    return;
  }

  if (peakCount === 0) {
    peakHourElement.textContent = "--:--";

    insightElement.textContent =
      "Belum ada data jam pengiriman pada filter yang dipilih.";

    return;
  }

  const formattedHour =
    `${String(peakIndex).padStart(2, "0")}:00`;

  const total = hourlyCounts.reduce((a, b) => a + b, 0);

  const peakPercentage =
    percentage(peakCount, total);

  peakHourElement.textContent = formattedHour;

  insightElement.textContent =
    `Waktu pengiriman paling ramai adalah pukul ${formattedHour}–${String(peakIndex).padStart(2, "0")}:59, dengan ${peakCount} postingan (${peakPercentage.toFixed(1)}% dari data yang terfilter).`;
}


// =====================================================
// 13. KEYWORD TERATAS
// =====================================================

function updateKeywords(data) {
  const stopwords = new Set([
    "yang", "dan", "di", "ke", "dari", "untuk",
    "dengan", "ini", "itu", "ada", "atau", "karena",
    "saya", "aku", "kami", "kita", "mereka", "pada",
    "dalam", "sudah", "belum", "akan", "tidak", "bisa",
    "sangat", "lebih", "kurang", "jadi", "nya",
    "the", "and", "to", "is", "of", "in", "on", "a", "an"
  ]);

  const counts = {};

  data.forEach(item => {
    const words = item.text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/);

    words.forEach(word => {
      if (word.length < 3 || stopwords.has(word)) {
        return;
      }

      counts[word] = (counts[word] || 0) + 1;
    });
  });

  const topWords = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const container =
    document.getElementById("keywordCloud");

  if (!topWords.length) {
    container.innerHTML =
      `<p class="empty-state">Belum ada keyword.</p>`;

    return;
  }

  container.innerHTML = topWords.map(([word, count]) => `
    <span class="keyword">
      ${escapeHTML(word)}
      <b>${count}</b>
    </span>
  `).join("");
}


// =====================================================
// 14. PRIORITAS EVALUASI
// =====================================================

function updatePriorities(data) {
  const results = TOPICS.map(topic => {
    const topicData = data.filter(
      item => item.topic === topic
    );

    const negative = countBy(
      topicData,
      "sentiment",
      "negatif"
    );

    return {
      topic,
      total: topicData.length,
      negative,
      rate: percentage(negative, topicData.length)
    };
  })
  .filter(item => item.total > 0)
  .sort((a, b) => b.rate - a.rate);

  const container =
    document.getElementById("priorityList");

  if (!results.length) {
    container.innerHTML =
      `<p class="empty-state">Belum ada data untuk dianalisis.</p>`;

    return;
  }

  container.innerHTML = results.map(item => `
    <div class="priority-item">
      <div>
        <div class="priority-name">
          ${escapeHTML(item.topic)}
        </div>

        <div class="priority-bar">
          <div
            class="priority-fill"
            style="width:${item.rate}%"
          ></div>
        </div>
      </div>

      <div class="priority-value">
        ${item.rate.toFixed(1)}%
      </div>
    </div>
  `).join("");
}


// =====================================================
// 15. UPLOAD DATASET
// =====================================================

const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const selectedFileBox = document.getElementById("selectedFile");
const processButton = document.getElementById("processFile");

document.getElementById("chooseFile").addEventListener(
  "click",
  () => fileInput.click()
);

fileInput.addEventListener("change", event => {
  setSelectedFile(event.target.files[0]);
});

function setSelectedFile(file) {
  if (!file) return;

  const allowed = [".csv", ".xlsx", ".xls"];

  const extension = file.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();

  if (!allowed.includes(extension)) {
    showUploadMessage(
      "Format file tidak didukung. Gunakan CSV, XLS, atau XLSX.",
      "error"
    );

    return;
  }

  selectedFile = file;

  document.getElementById("fileName").textContent =
    file.name;

  document.getElementById("fileInfo").textContent =
    `${(file.size / 1024).toFixed(1)} KB`;

  selectedFileBox.hidden = false;
  processButton.disabled = false;

  showUploadMessage("", "");
}


// Tombol hapus file
document.getElementById("removeFile").addEventListener(
  "click",
  () => {
    selectedFile = null;
    fileInput.value = "";

    selectedFileBox.hidden = true;
    processButton.disabled = true;

    showUploadMessage("", "");
  }
);


// Drag and drop
dropzone.addEventListener("dragover", event => {
  event.preventDefault();
  dropzone.classList.add("dragover");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragover");
});

dropzone.addEventListener("drop", event => {
  event.preventDefault();

  dropzone.classList.remove("dragover");

  setSelectedFile(event.dataTransfer.files[0]);
});


// =====================================================
// 16. MEMBACA CSV / EXCEL
// =====================================================

function readUploadedFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => {
      try {
        let workbook;

        if (file.name.toLowerCase().endsWith(".csv")) {
          workbook = XLSX.read(
            event.target.result,
            { type: "string" }
          );
        } else {
          workbook = XLSX.read(
            event.target.result,
            {
              type: "array",
              cellDates: true
            }
          );
        }

        const sheet =
          workbook.Sheets[workbook.SheetNames[0]];

        resolve(
          XLSX.utils.sheet_to_json(
            sheet,
            { defval: "" }
          )
        );

      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("File gagal dibaca."));
    };

    if (file.name.toLowerCase().endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}


// =====================================================
// 17. NORMALISASI DATA UPLOAD
// =====================================================

function transformUploadedRows(rows) {
  if (!rows.length) {
    throw new Error("Dataset kosong.");
  }

  const headers = Object.keys(rows[0]);

  const textColumn = findColumn(headers, [
    "text",
    "clean_text",
    "isi_postingan",
    "postingan",
    "konten",
    "tweet",
    "message",
    "caption"
  ]);

  const monthColumn = findColumn(headers, [
    "month",
    "bulan",
    "tanggal",
    "date",
    "created_at",
    "waktu",
    "timestamp"
  ]);

  const topicColumn = findColumn(headers, [
    "topic",
    "kategori",
    "category",
    "topik",
    "label_topik"
  ]);

  const sentimentColumn = findColumn(headers, [
    "sentiment",
    "sentimen",
    "label_sentimen",
    "prediksi_sentimen",
    "hasil_sentimen"
  ]);

  const timeColumn = findColumn(headers, [
    "time",
    "jam",
    "waktu_pengiriman",
    "created_at",
    "timestamp",
    "tanggal",
    "date"
  ]);

  const missing = [];

  if (!textColumn) missing.push("text");
  if (!monthColumn) missing.push("month");
  if (!topicColumn) missing.push("topic");
  if (!sentimentColumn) missing.push("sentiment");

  if (missing.length) {
    throw new Error(
      `Kolom wajib belum ditemukan: ${missing.join(", ")}`
    );
  }

  const transformed = rows.map(row => {
    const monthValue = row[monthColumn];

    const timeValue = timeColumn
      ? row[timeColumn]
      : null;

    const month = normalizeMonth(monthValue);

    let hour = extractHour(timeValue);

    if (hour === null) {
      hour = extractHour(monthValue);
    }

    return {
      text: normalizeText(row[textColumn]),
      month,
      topic: normalizeTopic(row[topicColumn]),
      sentiment: normalizeSentiment(row[sentimentColumn]),
      hour
    };
  });

  const validRows = transformed.filter(item =>
    item.text &&
    item.month &&
    item.topic &&
    item.sentiment
  );

  if (!validRows.length) {
    throw new Error(
      "Tidak ada baris valid. Periksa format bulan, kategori, dan sentimen."
    );
  }

  return {
    validRows,
    totalRows: rows.length,
    invalidRows: rows.length - validRows.length
  };
}


// =====================================================
// 18. PROSES UPLOAD
// =====================================================

processButton.addEventListener("click", async () => {
  if (!selectedFile) return;

  processButton.disabled = true;
  processButton.textContent = "Memproses...";

  try {
    const rows = await readUploadedFile(selectedFile);

    const result = transformUploadedRows(rows);

    currentData = result.validRows;

    resetAllFilters();

    const timeCount = currentData.filter(item =>
      Number.isInteger(item.hour)
    ).length;

    document.getElementById("dataStatus").textContent =
      "Dataset Upload";

    document.getElementById("dataStatus").style.background =
      "#e7f5ed";

    document.getElementById("dataStatus").style.color =
      "#23845e";

    updateDashboard();

    showUploadMessage(
      `Berhasil memproses ${formatNumber(result.validRows.length)} data valid. ` +
      `${formatNumber(result.invalidRows)} baris dilewati. ` +
      `${formatNumber(timeCount)} data memiliki informasi jam.`,
      "success"
    );

    document.querySelector(
      '[data-page="dashboard"]'
    ).click();

  } catch (error) {
    showUploadMessage(
      error.message ||
      "Terjadi kesalahan saat membaca dataset.",
      "error"
    );

  } finally {
    processButton.disabled = false;
    processButton.textContent = "Proses Dataset";
  }
});

function showUploadMessage(message, type) {
  const element =
    document.getElementById("uploadMessage");

  element.textContent = message;
  element.className = `upload-message ${type}`;
}


// =====================================================
// 19. DOWNLOAD TEMPLATE DATASET
// =====================================================

document.getElementById("downloadTemplate").addEventListener(
  "click",
  () => {
    const template = [
      {
        text: "Dosen menjelaskan materi dengan baik",
        month: "Januari",
        topic: TOPICS[0],
        sentiment: "positif",
        time: "2026-01-10 08:30:00"
      },
      {
        text: "Wifi kampus sering mengalami gangguan",
        month: "Februari",
        topic: TOPICS[3],
        sentiment: "negatif",
        time: "2026-02-12 19:45:00"
      },
      {
        text: "Informasi kegiatan kampus telah dibagikan",
        month: "Maret",
        topic: TOPICS[1],
        sentiment: "netral",
        time: "2026-03-05 12:15:00"
      }
    ];

    const worksheet =
      XLSX.utils.json_to_sheet(template);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Dataset Menfess"
    );

    XLSX.writeFile(
      workbook,
      "Template_Dataset_Menfess.xlsx"
    );
  }
);


// =====================================================
// 20. KEMBALI KE DATA DEMO
// =====================================================

document.getElementById("restoreDemo").addEventListener(
  "click",
  () => {
    currentData = createDemoData();

    resetAllFilters();

    document.getElementById("dataStatus").textContent =
      "Data Demo";

    document.getElementById("dataStatus").style.background =
      "#fff8d9";

    document.getElementById("dataStatus").style.color =
      "#927500";

    updateDashboard();

    showUploadMessage(
      "Dashboard dikembalikan ke data demo Januari–Oktober 2026.",
      "success"
    );

    document.querySelector(
      '[data-page="dashboard"]'
    ).click();
  }
);


// =====================================================
// 21. INISIALISASI DASHBOARD
// =====================================================

function initializeDashboard() {
  currentData = createDemoData();

  updateDashboard();

  console.log(
    "Menfess PENS Dashboard berhasil diinisialisasi."
  );

  console.log(
    `Total data demo: ${currentData.length} postingan`
  );
}

initializeDashboard();
