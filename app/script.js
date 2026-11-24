
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

// =====================================================
// 22. PENGEMBANGAN DASHBOARD MENFESS PENS
// =====================================================

// Konfigurasi analisis
const DAY = 86400000;
const SPIKE_THRESHOLD = 1.5;
const MIN_SPIKE_POSTS = 3;

Chart.defaults.font.family = "Poppins";
Chart.defaults.font.size = 12;
Chart.defaults.color = "#53677e";

// =====================================================
// 23. NORMALISASI TANGGAL POSTINGAN
// =====================================================

function parsePostingDate(value) {
  if (value instanceof Date && !isNaN(value)) {
    return Date.UTC(
      value.getFullYear(),
      value.getMonth(),
      value.getDate()
    );
  }

  const raw = String(value ?? "").trim();

  let match = raw.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:$|[ T])/
  );

  let year, month, day;

  if (match) {
    [, year, month, day] = match;
  } else {
    match = raw.match(
      /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:$|[ T])/
    );

    if (!match) return null;

    [, day, month, year] = match;
  }

  const timestamp = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return timestamp;
}

// =====================================================
// 24. STOPWORDS DAN EKSTRAKSI KATA KUNCI
// =====================================================

const EXTRA_STOPWORDS = new Set([
  "yang", "dan", "di", "ke", "dari",
  "untuk", "dengan", "ini", "itu",
  "ada", "atau", "karena", "saya",
  "aku", "kami", "kita", "mereka",
  "pada", "dalam", "sudah", "belum",
  "akan", "tidak", "bisa", "sangat",
  "lebih", "kurang", "jadi", "nya",
  "banyak", "sering", "beberapa",
  "banget", "juga", "masih", "saat",
  "secara", "telah", "seperti",
  "gitu", "kayak", "aja", "sih",
  "dong", "nih", "kalo", "kalau",
  "kampus", "mahasiswa", "pens",
  "menfess", "the", "and", "to",
  "is", "of", "in", "on", "a", "an"
]);

function tokenizeText(text) {
  return String(text)
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu) || [];
}

function extractKeywords(text) {
  return [...new Set(
    tokenizeText(text).filter(word =>
      word.length >= 3 &&
      !EXTRA_STOPWORDS.has(word) &&
      !/^\d+$/.test(word)
    )
  )];
}

function getKeywordCounts(data) {
  const counts = new Map();

  data.forEach(item => {
    extractKeywords(item.text).forEach(word => {
      counts.set(
        word,
        (counts.get(word) || 0) + 1
      );
    });
  });

  return [...counts.entries()].sort(
    (a, b) =>
      b[1] - a[1] ||
      a[0].localeCompare(b[0])
  );
}

// =====================================================
// 25. PENYESUAIAN DATA DEMO
// =====================================================

const originalCreateDemoData = createDemoData;

createDemoData = function () {
  const data = originalCreateDemoData();

  const monthCounters = {};

  return data.map(item => {
    const monthIndex = MONTHS.indexOf(item.month);

    monthCounters[item.month] =
      (monthCounters[item.month] || 0) + 1;

    const daysInMonth = new Date(
      Date.UTC(2026, monthIndex + 1, 0)
    ).getUTCDate();

    const day =
      ((monthCounters[item.month] - 1) %
        daysInMonth) + 1;

    return {
      ...item,
      date: Date.UTC(2026, monthIndex, day)
    };
  });
};

// =====================================================
// 26. NORMALISASI DATASET UPLOAD
// =====================================================

// Mempertahankan fungsi normalisasi sebelumnya,
// sekaligus menyimpan tanggal lengkap postingan.

transformUploadedRows = function (rows) {
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
    "timestamp",
    "waktu"
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

  const dateColumn = findColumn(headers, [
    "date",
    "tanggal",
    "created_at",
    "timestamp",
    "waktu_pengiriman",
    "time",
    "waktu"
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
  if (!monthColumn && !dateColumn) {
    missing.push("month atau date");
  }

  if (!topicColumn) missing.push("topic");
  if (!sentimentColumn) missing.push("sentiment");

  if (missing.length) {
    throw new Error(
      `Kolom wajib belum ditemukan: ${missing.join(", ")}`
    );
  }

  const transformed = rows.map(row => {
    const monthValue = monthColumn
      ? row[monthColumn]
      : "";

    const dateValue = dateColumn
      ? row[dateColumn]
      : monthValue;

    const timeValue = timeColumn
      ? row[timeColumn]
      : null;

    const date =
      parsePostingDate(dateValue) ??
      parsePostingDate(monthValue) ??
      parsePostingDate(timeValue);

    const month =
      normalizeMonth(monthValue) ||
      (Number.isFinite(date)
        ? MONTHS[new Date(date).getUTCMonth()]
        : null);

    let hour = extractHour(timeValue);

    if (hour === null) {
      hour = extractHour(dateValue);
    }

    if (hour === null) {
      hour = extractHour(monthValue);
    }

    return {
      text: normalizeText(row[textColumn]),
      month,
      topic: normalizeTopic(row[topicColumn]),
      sentiment: normalizeSentiment(
        row[sentimentColumn]
      ),
      hour,
      date
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
      "Tidak ada baris valid. Periksa format dataset."
    );
  }

  return {
    validRows,
    totalRows: rows.length,
    invalidRows: rows.length - validRows.length
  };
};

// =====================================================
// 27. FILTER DATA UNTUK ANALISIS PERBANDINGAN
// =====================================================

function getScopedData(ignoreSentiment = false) {
  const topic =
    document.getElementById("topicFilter").value;

  const sentiment =
    document.getElementById("sentimentFilter").value;

  const keyword =
    document.getElementById("keywordSearch")
      .value.trim().toLowerCase();

  return currentData.filter(item =>
    (topic === "all" || item.topic === topic) &&

    (
      ignoreSentiment ||
      sentiment === "all" ||
      item.sentiment === sentiment
    ) &&

    (
      !keyword ||
      item.text.toLowerCase().includes(keyword)
    )
  );
}

// =====================================================
// 28. ANALISIS LONJAKAN ISU
// =====================================================

function updateIssueSpike(data) {
  const list =
    document.getElementById("spikeList");

  const note =
    document.getElementById("spikeNote");

  const title =
    document.getElementById("spikeTitle");

  if (!list || !note || !title) return;

  list.replaceChildren();

  if (charts.spike) {
    charts.spike.destroy();
    delete charts.spike;
  }

  title.textContent = "Tren pembahasan";

  const datedData = data.filter(
    item => Number.isFinite(item.date)
  );

  if (!datedData.length) {
    note.textContent =
      "Tanggal lengkap belum tersedia. " +
      "Lonjakan isu mingguan belum dapat dihitung.";

    return;
  }

  const selectedMonth =
    document.getElementById("monthFilter").value;

  const anchors = currentData.filter(item =>
    Number.isFinite(item.date) &&
    (
      selectedMonth === "all" ||
      item.month === selectedMonth
    )
  );

  if (!anchors.length) {
    note.textContent =
      "Tidak ada tanggal postingan pada periode ini.";

    return;
  }

  const endDate = anchors.reduce(
    (max, item) => Math.max(max, item.date),
    -Infinity
  );

  const startDate = endDate - 34 * DAY;

  const availableDates = currentData
    .filter(item => Number.isFinite(item.date))
    .map(item => item.date);

  const earliestDate = availableDates.reduce(
    (min, date) => Math.min(min, date),
    Infinity
  );

  if (earliestDate > startDate) {
    note.textContent =
      "Diperlukan riwayat minimal 35 hari " +
      "untuk melakukan perbandingan mingguan.";

    return;
  }

  const analysisData = getScopedData().filter(item =>
    Number.isFinite(item.date) &&
    item.date >= startDate &&
    item.date <= endDate
  );

  const weeklyCounts = new Map();

  analysisData.forEach(item => {
    const weekIndex =
      4 - Math.floor(
        (endDate - item.date) / (7 * DAY)
      );

    if (weekIndex < 0 || weekIndex > 4) return;

    extractKeywords(item.text).forEach(word => {
      if (!weeklyCounts.has(word)) {
        weeklyCounts.set(word, [0, 0, 0, 0, 0]);
      }

      weeklyCounts.get(word)[weekIndex]++;
    });
  });

  const results = [...weeklyCounts.entries()]
    .map(([word, values]) => {
      const previousAverage =
        values.slice(0, 4)
          .reduce((a, b) => a + b, 0) / 4;

      const currentCount = values[4];

      const ratio = previousAverage > 0
        ? currentCount / previousAverage
        : null;

      return {
        word,
        values,
        previousAverage,
        currentCount,
        ratio,
        increase: currentCount - previousAverage
      };
    })

    .filter(item =>
      item.currentCount >= MIN_SPIKE_POSTS &&
      (
        item.previousAverage === 0 ||
        item.ratio >= SPIKE_THRESHOLD
      )
    )

    .sort((a, b) => b.increase - a.increase)
    .slice(0, 5);

  const endLabel = new Date(
    endDate
  ).toLocaleDateString("id-ID", {
    timeZone: "UTC"
  });

  note.textContent =
    `Periode 7 hari hingga ${endLabel}, ` +
    `dibanding rata-rata 4 minggu sebelumnya. ` +
    `Ambang lonjakan minimal ${SPIKE_THRESHOLD}× ` +
    `dan ${MIN_SPIKE_POSTS} postingan. ` +
    `${currentData.length - availableDates.length} ` +
    `postingan tanpa tanggal dikecualikan.`;

  if (!results.length) {
    list.innerHTML = `
      <p class="empty-state">
        Tidak ada lonjakan isu yang memenuhi ambang.
      </p>
    `;

    return;
  }

  results.forEach((item, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "spike-button";

    const change = item.ratio === null
      ? "Isu baru"
      : `↑ ${item.ratio.toFixed(1)}×`;

    button.innerHTML = `
      <span>${escapeHTML(item.word)}</span>
      <b>${change}</b>
    `;

    button.addEventListener("click", () => {
      list.querySelectorAll("button")
        .forEach(element => {
          element.classList.toggle(
            "active",
            element === button
          );
        });

      renderSpikeChart(
        item,
        analysisData,
        endDate
      );
    });

    list.appendChild(button);

    if (index === 0) {
      button.click();
    }
  });
}

// =====================================================
// 29. GRAFIK LONJAKAN ISU
// =====================================================

function renderSpikeChart(
  item,
  analysisData,
  endDate
) {
  const canvas =
    document.getElementById("spikeChart");

  const title =
    document.getElementById("spikeTitle");

  if (!canvas || !title) return;

  title.textContent =
    `Tren Pembahasan "${item.word}"`;

  if (charts.spike) {
    charts.spike.destroy();
  }

  charts.spike = new Chart(canvas, {
    type: "line",

    data: {
      labels: [
        "M-4",
        "M-3",
        "M-2",
        "M-1",
        "Terkini"
      ],

      datasets: [{
        label: "Jumlah Postingan",
        data: item.values,

        borderColor: "#e8c416",
        backgroundColor: "rgba(232,196,22,0.15)",

        borderWidth: 3,
        fill: true,
        tension: 0.25,

        pointRadius: 5,
        pointHoverRadius: 8,

        pointBackgroundColor: "#e8c416",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2
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
            label: context =>
              `${context.raw} postingan`
          }
        }
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            precision: 0
          },

          grid: {
            color: "#e4e9ef"
          }
        },

        x: {
          grid: {
            display: false
          }
        }
      },

      onHover: (event, elements) => {
        if (event.native?.target) {
          event.native.target.style.cursor =
            elements.length
              ? "pointer"
              : "default";
        }
      },

      onClick: (event, elements) => {
        if (!elements.length) return;

        const index = elements[0].index;

        const weekEnd =
          endDate - (4 - index) * 7 * DAY;

        const weekStart =
          weekEnd - 6 * DAY;

        const relatedPosts = analysisData.filter(
          row =>
            row.date >= weekStart &&
            row.date <= weekEnd &&
            extractKeywords(row.text)
              .includes(item.word)
        );

        openDetails(
          `${item.word} — Minggu ${index + 1}`,
          relatedPosts
        );
      }
    }
  });
}

// =====================================================
// 30. RINGKASAN ANALISIS OTOMATIS
// =====================================================

function updateInsightSummary(data) {
  const container =
    document.getElementById("insightList");

  const title =
    document.getElementById("insightTitle");

  if (!container || !title) return;

  const selectedMonth =
    document.getElementById("monthFilter").value;

  const selectedSentiment =
    document.getElementById("sentimentFilter").value;

  const availableMonths = MONTHS.filter(month =>
    currentData.some(item => item.month === month)
  );

  const focusMonth = selectedMonth === "all"
    ? availableMonths.at(-1)
    : selectedMonth;

  title.textContent =
    selectedMonth === "all"
      ? "Ringkasan Analisis Seluruh Periode"
      : `Ringkasan Analisis ${selectedMonth}`;

  if (!data.length) {
    container.innerHTML = `
      <p class="empty-state">
        Tidak ada data pada filter yang dipilih.
      </p>
    `;

    return;
  }

  const previousMonth =
    MONTHS[MONTHS.indexOf(focusMonth) - 1];

  const comparisonData = getScopedData(true);

  const currentMonthData = comparisonData.filter(
    item => item.month === focusMonth
  );

  const previousMonthData = comparisonData.filter(
    item => item.month === previousMonth
  );

  let sentimentInsight;

  if (selectedSentiment !== "all") {
    sentimentInsight =
      "Pilih semua sentimen untuk melihat " +
      "perbandingan proporsi sentimen negatif.";
  } else if (
    currentMonthData.length &&
    previousMonthData.length
  ) {
    const currentNegative = percentage(
      countBy(
        currentMonthData,
        "sentiment",
        "negatif"
      ),
      currentMonthData.length
    );

    const previousNegative = percentage(
      countBy(
        previousMonthData,
        "sentiment",
        "negatif"
      ),
      previousMonthData.length
    );

    const change =
      currentNegative - previousNegative;

    const direction = change > 0
      ? "meningkat"
      : change < 0
        ? "menurun"
        : "tetap";

    sentimentInsight =
      `Proporsi sentimen negatif ${direction} ` +
      `${Math.abs(change).toFixed(1)} poin persentase ` +
      `pada ${focusMonth} dibanding ${previousMonth}.`;
  } else {
    sentimentInsight =
      "Data periode sebelumnya belum tersedia " +
      "untuk perbandingan sentimen negatif.";
  }

  const rankedTopics = TOPICS.map(topic => ({
    topic,
    count: countBy(data, "topic", topic)
  })).sort((a, b) => b.count - a.count);

  const dominantTopic = rankedTopics[0];

  const keywords = getKeywordCounts(data)
    .slice(0, 3)
    .map(item => item[0]);

  const peakHour =
    document.getElementById("peakHour")
      .textContent;

  const insights = [
    {
      icon: "↗",
      text: sentimentInsight
    },

    {
      icon: "▤",
      text: dominantTopic.count
        ? `Topik dominan: ${dominantTopic.topic} ` +
          `(${dominantTopic.count} postingan).`
        : "Belum ada topik dominan."
    },

    {
      icon: "#",
      text: keywords.length
        ? `Kata kunci menonjol: ${keywords.join(", ")}.`
        : "Belum ada kata kunci menonjol."
    },

    {
      icon: "◷",
      text: peakHour !== "--:--"
        ? `Jam pengiriman tersibuk: ${peakHour}.`
        : "Informasi jam pengiriman belum tersedia."
    }
  ];

  container.innerHTML = insights.map(item => `
    <div class="insight-row">
      <span class="insight-icon">
        ${item.icon}
      </span>

      <span>
        ${escapeHTML(item.text)}
      </span>
    </div>
  `).join("");
}

// =====================================================
// 31. KATA KUNCI INTERAKTIF
// =====================================================

updateKeywords = function (data) {
  const container =
    document.getElementById("keywordCloud");

  container.replaceChildren();

  const topKeywords = getKeywordCounts(data)
    .slice(0, 15);

  if (!topKeywords.length) {
    container.innerHTML = `
      <p class="empty-state">
        Belum ada kata kunci.
      </p>
    `;

    return;
  }

  topKeywords.forEach(([word, count]) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "keyword";

    button.innerHTML = `
      ${escapeHTML(word)}
      <b>${count}</b>
    `;

    button.title =
      `Lihat ${count} postingan terkait ${word}`;

    button.addEventListener("click", () => {
      const relatedPosts = data.filter(item =>
        extractKeywords(item.text).includes(word)
      );

      openDetails(
        `Kata Kunci: ${word}`,
        relatedPosts
      );
    });

    container.appendChild(button);
  });
};

// =====================================================
// 32. TOTAL POSTINGAN DI TENGAH DONUT
// =====================================================

function updateDonutTotal(data) {
  const element =
    document.getElementById("donutTotal");

  if (element) {
    element.textContent =
      formatNumber(data.length);
  }
}

// =====================================================
// 33. MODAL DETAIL POSTINGAN
// =====================================================

let detailData = [];
let detailLimit = 30;

function openDetails(title, data) {
  const dialog =
    document.getElementById("detailDialog");

  if (!dialog) return;

  detailData = data;
  detailLimit = 30;

  document.getElementById(
    "detailTitle"
  ).textContent = title;

  renderDetails();

  if (!dialog.open) {
    dialog.showModal();
  }
}

function renderDetails() {
  const rows =
    document.getElementById("detailRows");

  const count =
    document.getElementById("detailCount");

  const moreButton =
    document.getElementById("moreDetail");

  count.textContent =
    `${formatNumber(detailData.length)} postingan`;

  if (!detailData.length) {
    rows.innerHTML = `
      <p class="empty-state">
        Tidak ada postingan terkait.
      </p>
    `;

    moreButton.hidden = true;
    return;
  }

  rows.innerHTML = detailData
    .slice(0, detailLimit)
    .map(item => {
      const date = Number.isFinite(item.date)
        ? new Date(item.date).toLocaleDateString(
            "id-ID",
            { timeZone: "UTC" }
          )
        : item.month;

      return `
        <article class="detail-post">

          <div class="detail-post-meta">
            <small>
              ${escapeHTML(date)}
            </small>

            <span class="sentiment-label ${escapeHTML(
              item.sentiment
            )}">
              ${escapeHTML(item.sentiment)}
            </span>
          </div>

          <p>
            ${escapeHTML(item.text)}
          </p>

          <small>
            ${escapeHTML(item.topic)}
          </small>

        </article>
      `;
    }).join("");

  moreButton.hidden =
    detailData.length <= detailLimit;
}

document.getElementById(
  "closeDetail"
)?.addEventListener("click", () => {
  document.getElementById(
    "detailDialog"
  ).close();
});

document.getElementById(
  "moreDetail"
)?.addEventListener("click", () => {
  detailLimit += 30;
  renderDetails();
});

// =====================================================
// 34. INTERAKTIVITAS GRAFIK
// =====================================================

function bindChartInteraction(chart, handler) {
  if (!chart) return;

  chart.options.onClick = (event, elements) => {
    if (!elements.length) return;

    handler(elements[0]);
  };

  chart.options.onHover = (event, elements) => {
    if (event.native?.target) {
      event.native.target.style.cursor =
        elements.length
          ? "pointer"
          : "default";
    }
  };

  chart.update("none");
}

function makeClickable(element, handler) {
  element.tabIndex = 0;

  element.setAttribute("role", "button");

  element.onclick = handler;

  element.onkeydown = event => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      handler();
    }
  };
}

function enableTrendInteraction() {
  bindChartInteraction(charts.trend, element => {
    const month =
      charts.trend.data.labels[element.index];

    const sentiment =
      charts.trend.data.datasets[
        element.datasetIndex
      ].label.toLowerCase();

    const relatedPosts = getFilteredData()
      .filter(item =>
        item.month === month &&
        item.sentiment === sentiment
      );

    openDetails(
      `${month} — Sentimen ${sentiment}`,
      relatedPosts
    );
  });
}

function enableDashboardInteraction(data) {

  // Klik diagram sentimen
  bindChartInteraction(
    charts.sentiment,
    element => {
      const sentiment =
        SENTIMENTS[element.index];

      openDetails(
        `Sentimen ${sentiment}`,
        data.filter(item =>
          item.sentiment === sentiment
        )
      );
    }
  );

  // Klik grafik kategori
  bindChartInteraction(
    charts.category,
    element => {
      const topic = TOPICS[element.index];

      openDetails(
        topic,
        data.filter(item =>
          item.topic === topic
        )
      );
    }
  );

  // Klik grafik jam sibuk
  bindChartInteraction(
    charts.rush,
    element => {
      const hour = element.index;

      const formattedHour =
        String(hour).padStart(2, "0");

      openDetails(
        `Postingan Pukul ${formattedHour}:00`,
        data.filter(item =>
          item.hour === hour
        )
      );
    }
  );

  // Klik tren sentimen
  enableTrendInteraction();

  // Klik legenda sentimen
  document.querySelectorAll(
    ".legend-item"
  ).forEach((element, index) => {
    makeClickable(element, () => {
      const sentiment = SENTIMENTS[index];

      openDetails(
        `Sentimen ${sentiment}`,
        data.filter(item =>
          item.sentiment === sentiment
        )
      );
    });
  });

  // Klik prioritas evaluasi
  document.querySelectorAll(
    ".priority-item"
  ).forEach(element => {
    const topic = element
      .querySelector(".priority-name")
      .textContent.trim();

    makeClickable(element, () => {
      openDetails(
        `Sentimen Negatif — ${topic}`,
        data.filter(item =>
          item.topic === topic &&
          item.sentiment === "negatif"
        )
      );
    });
  });
}

// =====================================================
// 35. SINKRONISASI GRAFIK TREN DAN FILTER
// =====================================================

const originalUpdateTrendChart = updateTrendChart;

updateTrendChart = function () {
  originalUpdateTrendChart();

  if (!charts.trend) return;

  const selectedMonth =
    document.getElementById("monthFilter").value;

  const globalSentiment =
    document.getElementById("sentimentFilter").value;

  const localSentiment =
    document.getElementById(
      "trendSentimentFilter"
    ).value;

  const data = getFilteredData();

  const labels = selectedMonth === "all"
    ? MONTHS
    : [selectedMonth];

  const selectedSentiments = SENTIMENTS.filter(
    sentiment =>
      (
        globalSentiment === "all" ||
        sentiment === globalSentiment
      ) &&
      (
        localSentiment === "all" ||
        sentiment === localSentiment
      )
  );

  charts.trend.data.labels = labels;

  charts.trend.data.datasets =
    selectedSentiments.map(sentiment => ({
      label:
        sentiment.charAt(0).toUpperCase() +
        sentiment.slice(1),

      data: labels.map(month =>
        data.filter(item =>
          item.month === month &&
          item.sentiment === sentiment
        ).length
      ),

      borderColor: COLORS[sentiment],
      backgroundColor: COLORS[sentiment],

      borderWidth: 3,
      tension: 0.3,

      pointRadius: 4,
      pointHoverRadius: 7
    }));

  charts.trend.update();

  enableTrendInteraction();
};

// =====================================================
// 36. STATUS DATA DAN PERIODE
// =====================================================

function updateDataInformation() {
  const status =
    document.getElementById("dataStatus");

  const notice =
    document.querySelector(".notice");

  const period =
    document.querySelector(".year-chip");

  const isDemo =
    status.textContent.trim() === "Data Demo";

  if (notice) {
    notice.hidden = !isDemo;
  }

  const availableMonths = MONTHS.filter(
    month => currentData.some(
      item => item.month === month
    )
  );

  if (period) {
    period.textContent = availableMonths.length
      ? `${availableMonths[0]} – ${availableMonths.at(-1)}`
      : "Tidak ada data";
  }
}

// =====================================================
// 37. UPDATE DASHBOARD FINAL
// =====================================================

updateDashboard = function () {
  const data = getFilteredData();

  // Komponen dashboard sebelumnya
  updateKPI(data);
  updateSentimentChart(data);
  updateTrendChart();
  updateCategoryChart(data);
  updateRushHour(data);
  updateKeywords(data);
  updatePriorities(data);

  // Komponen tambahan
  updateDonutTotal(data);
  updateIssueSpike(data);
  updateInsightSummary(data);
  updateDataInformation();

  // Interaktivitas
  enableDashboardInteraction(data);
};

// =====================================================
// 38. SINKRONISASI EVENT LISTENER
// =====================================================

[
  "monthFilter",
  "topicFilter",
  "sentimentFilter"
].forEach(id => {
  const element = document.getElementById(id);

  const replacement = element.cloneNode(true);

  replacement.value = element.value;

  element.replaceWith(replacement);

  replacement.addEventListener(
    "change",
    updateDashboard
  );
});

const keywordInput =
  document.getElementById("keywordSearch");

const replacementKeyword =
  keywordInput.cloneNode(true);

replacementKeyword.value = keywordInput.value;

keywordInput.replaceWith(replacementKeyword);

replacementKeyword.addEventListener(
  "input",
  updateDashboard
);

const trendFilter =
  document.getElementById("trendSentimentFilter");

const replacementTrend =
  trendFilter.cloneNode(true);

replacementTrend.value = trendFilter.value;

trendFilter.replaceWith(replacementTrend);

replacementTrend.addEventListener(
  "change",
  updateTrendChart
);

// =====================================================
// 39. KONSISTENSI BAHASA DASHBOARD
// =====================================================

function updateDashboardLanguage() {
  const brand =
    document.querySelector(".brand-text small");

  if (brand) {
    brand.textContent = "Dasbor Analisis Sentimen";
  }

  const headings = {
    "Dashboard Overview": "Ringkasan Dasbor",
    "Sentiment Overview": "Komposisi Sentimen",
    "Rush Hour Menfess": "Jam Sibuk Menfess",
    "Keyword Teratas": "Kata Kunci Teratas",
    "Upload Dataset": "Unggah Dataset",
    "Upload Dataset Menfess": "Unggah Dataset Menfess",
    "Issue Spike": "Lonjakan Isu"
  };

  document.querySelectorAll("h1, h2, h3")
    .forEach(element => {
      const text = element.textContent.trim();

      if (headings[text]) {
        element.textContent = headings[text];
      }
    });

  const keywordLabel = document.querySelector(
    'label[for="keywordSearch"]'
  );

  if (keywordLabel) {
    keywordLabel.textContent = "Cari Kata Kunci";
  }

  const uploadNav = document.querySelector(
    '[data-page="upload"] span:last-child'
  );

  if (uploadNav) {
    uploadNav.textContent = "Unggah Data";
  }
}

document.querySelectorAll(".nav-item")
  .forEach(button => {
    button.addEventListener("click", () => {
      updateDashboardLanguage();
    });
  });

// =====================================================
// 40. INISIALISASI DASHBOARD
// =====================================================

initializeDashboard();

updateDashboardLanguage();

console.log(
  "Menfess PENS — Pengembangan dashboard berhasil dimuat."
);


// =====================================================
// MENFESS PENS - PENGEMBANGAN DASHBOARD V2
// =====================================================

(() => {

  // ===================================================
  // 1. KONFIGURASI
  // ===================================================

  const el = id => document.getElementById(id);

  const PAGE_SIZE = 10;
  const ONE_DAY = 86400000;

  let explorerPage = 0;
  let newestFirst = true;

  const pageInformation = {
    issues: {
      title: "Lonjakan Isu",
      description:
        "Pantau peningkatan pembahasan isu dan kata kunci Menfess."
    },

    explorer: {
      title: "Eksplorasi Postingan",
      description:
        "Telusuri postingan berdasarkan topik, sentimen, dan kata kunci."
    },

    comparison: {
      title: "Perbandingan Periode",
      description:
        "Bandingkan perubahan sentimen dan topik antarperiode."
    }
  };

  Chart.defaults.font.family = "Poppins";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = "#65768b";


  // ===================================================
  // 2. FUNGSI UTILITAS
  // ===================================================

  function capitalize(value) {
    const text = String(value ?? "");

    return text.charAt(0).toUpperCase() +
      text.slice(1);
  }

  function formatDecimal(value) {
    return Number(value).toLocaleString("id-ID", {
      maximumFractionDigits: 1
    });
  }

  function signedPoints(value) {
    return `${value > 0 ? "+" : ""}${formatDecimal(value)} poin`;
  }

  function formatDate(row) {
    if (Number.isFinite(row.date)) {
      return new Date(row.date).toLocaleDateString(
        "id-ID",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC"
        }
      );
    }

    return row.month || "—";
  }

  function anonymizePost(text) {
    return String(text ?? "")

      // Samarkan email
      .replace(
        /[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,
        "[email disamarkan]"
      )

      // Samarkan username
      .replace(
        /@[\w]+/g,
        "[akun disamarkan]"
      )

      // Samarkan nomor telepon
      .replace(
        /(?:\+62|08)\d[\d\s-]{7,14}\d/g,
        "[nomor disamarkan]"
      )

      // Samarkan URL
      .replace(
        /https?:\/\/[^\s]+/gi,
        "[tautan disamarkan]"
      );
  }

  function normalizeConfidence(value) {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === ""
    ) {
      return null;
    }

    const raw = String(value)
      .trim()
      .replace(",", ".");

    let number = Number(raw.replace("%", ""));

    if (raw.includes("%")) {
      number /= 100;
    }

    return Number.isFinite(number) &&
      number >= 0 &&
      number <= 1
        ? number
        : null;
  }

  function formatConfidence(value) {
    const score = normalizeConfidence(value);

    if (score === null) return "—";

    return score.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  const stopWordsV2 = new Set([
    "yang", "dan", "di", "ke", "dari",
    "untuk", "dengan", "ini", "itu",
    "ada", "atau", "karena", "saya",
    "aku", "kami", "kita", "mereka",
    "pada", "dalam", "sudah", "belum",
    "akan", "tidak", "bisa", "sangat",
    "lebih", "kurang", "jadi", "nya",
    "banyak", "sering", "beberapa",
    "banget", "juga", "masih", "saat",
    "secara", "telah", "seperti",
    "gitu", "kayak", "aja", "sih",
    "dong", "nih", "kalau", "kalo",
    "kampus", "mahasiswa", "pens",
    "menfess", "the", "and", "to",
    "is", "of", "in", "on"
  ]);

  function getPostWords(text) {
    const words = String(text ?? "")
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) || [];

    return [...new Set(
      words.filter(word =>
        word.length >= 3 &&
        !stopWordsV2.has(word) &&
        !/^\d+$/.test(word)
      )
    )];
  }

  function addOptions(id, values, allLabel) {
    const select = el(id);

    if (!select) return;

    const oldValue = select.value;

    select.replaceChildren();

    if (allLabel) {
      select.add(new Option(allLabel, "all"));
    }

    values.forEach(value => {
      select.add(
        new Option(capitalize(value), value)
      );
    });

    if (
      [...select.options].some(
        option => option.value === oldValue
      )
    ) {
      select.value = oldValue;
    }
  }

  function getMonthOptions() {
    return MONTHS.filter(month =>
      currentData.some(row => row.month === month)
    );
  }


  // ===================================================
  // 3. MEMBUAT NAVIGASI SIDEBAR
  // ===================================================

  function createNavigation() {
    const navigation =
      document.querySelector(".navigation");

    const uploadButton =
      navigation.querySelector('[data-page="upload"]');

    const menus = [
      {
        page: "issues",
        icon: "↗",
        label: "Lonjakan Isu"
      },

      {
        page: "explorer",
        icon: "▤",
        label: "Eksplorasi Postingan"
      },

      {
        page: "comparison",
        icon: "▥",
        label: "Perbandingan Periode"
      }
    ];

    menus.forEach(menu => {
      if (
        navigation.querySelector(
          `[data-page="${menu.page}"]`
        )
      ) {
        return;
      }

      const button =
        document.createElement("button");

      button.type = "button";

      button.className = "nav-item";

      button.dataset.page = menu.page;

      button.innerHTML = `
        <span class="nav-icon">${menu.icon}</span>
        <span>${menu.label}</span>
      `;

      navigation.insertBefore(
        button,
        uploadButton
      );
    });

    const dashboardButton =
      navigation.querySelector(
        '[data-page="dashboard"] span:last-child'
      );

    if (dashboardButton) {
      dashboardButton.textContent = "Dasbor";
    }

    if (uploadButton) {
      uploadButton.querySelector(
        "span:last-child"
      ).textContent = "Unggah Data";
    }
  }


  // ===================================================
  // 4. TEMPLATE FILTER HALAMAN
  // ===================================================

  function createFilters(prefix) {
    return `
      <div class="analytics-filters">

        <div class="form-field">
          <label for="${prefix}Month">
            Periode
          </label>

          <select id="${prefix}Month"></select>
        </div>

        <div class="form-field">
          <label for="${prefix}Topic">
            Topik
          </label>

          <select id="${prefix}Topic"></select>
        </div>

        <div class="form-field">
          <label for="${prefix}Sentiment">
            Sentimen
          </label>

          <select id="${prefix}Sentiment"></select>
        </div>

        <div class="form-field">
          <label for="${prefix}Keyword">
            Kata Kunci
          </label>

          <input
            id="${prefix}Keyword"
            type="search"
            placeholder="Cari kata kunci..."
          >
        </div>

      </div>
    `;
  }


  // ===================================================
  // 5. MEMBUAT HALAMAN LONJAKAN ISU
  // ===================================================

  function createIssuePage() {
    const main =
      document.querySelector(".main-content");

    const footer =
      main.querySelector(".footer");

    const page =
      document.createElement("section");

    page.id = "issues";

    page.className =
      "page analytics-page issue-page";

    page.innerHTML = `
      <section class="widget-card">

        <div class="analytics-header">

          <div class="analytics-header-icon">
            ↗
          </div>

          <div>
            <h2>Lonjakan Isu</h2>

            <p>
              Identifikasi kata kunci dengan peningkatan
              pembahasan dalam periode mingguan.
            </p>
          </div>

        </div>

        ${createFilters("issue")}

        <div
          id="issueNoteV2"
          class="analysis-note"
        ></div>

        <div class="spike-layout">

          <div>

            <h4 style="margin-bottom:14px">
              Kata Kunci dengan Lonjakan
            </h4>

            <div
              id="issueListV2"
              class="spike-list"
            ></div>

          </div>

          <div>

            <h4 id="issueChartTitleV2">
              Tren Pembahasan Mingguan
            </h4>

            <div class="chart-box spike-chart-box">

              <canvas id="issueChartV2"></canvas>

            </div>

          </div>

        </div>

        <div class="issue-method">

          <strong>Metode Deteksi Lonjakan</strong>

          <p>
            Jumlah postingan selama tujuh hari terkini
            dibandingkan dengan rata-rata empat minggu
            sebelumnya. Lonjakan ditampilkan apabila
            jumlah postingan meningkat minimal 1,5 kali
            dengan sedikitnya tiga postingan pada
            minggu terkini.
          </p>

          <p>
            Pilih kata kunci untuk melihat tren.
            Klik titik grafik untuk melihat
            postingan terkait.
          </p>

        </div>

      </section>
    `;

    main.insertBefore(page, footer);

    // Hapus kartu Lonjakan Isu dari dashboard utama.
    // Elemen lama dipertahankan dalam wadah tersembunyi
    // agar fungsi JavaScript lama tidak mengalami error.

    const oldSpike =
      el("spikeList")?.closest(".widget-card");

    if (oldSpike) {
      const hiddenStorage =
        document.createElement("div");

      hiddenStorage.style.display = "none";

      hiddenStorage.setAttribute(
        "aria-hidden",
        "true"
      );

      hiddenStorage.appendChild(oldSpike);

      main.appendChild(hiddenStorage);
    }
  }


  // ===================================================
  // 6. MEMBUAT HALAMAN EKSPLORASI POSTINGAN
  // ===================================================

  function createExplorerPage() {
    const main =
      document.querySelector(".main-content");

    const footer =
      main.querySelector(".footer");

    const page =
      document.createElement("section");

    page.id = "explorer";

    page.className =
      "page analytics-page explorer-page";

    page.innerHTML = `
      <section class="widget-card">

        <div class="analytics-header">

          <div class="analytics-header-icon">
            ▤
          </div>

          <div>

            <h2>Eksplorasi Postingan</h2>

            <p>
              Lihat postingan berdasarkan periode,
              topik, sentimen, dan kata kunci tertentu.
            </p>

          </div>

        </div>

        ${createFilters("explore")}

        <div
          class="explorer-count"
          id="explorerCountV2"
        >
          0 postingan ditemukan
        </div>

        <div class="explorer-table-wrapper">

          <table class="explorer-table">

            <colgroup>
              <col style="width:15%">
              <col style="width:37%">
              <col style="width:14%">
              <col style="width:24%">
              <col style="width:10%">
            </colgroup>

            <thead>

              <tr>

                <th>
                  <button
                    class="table-sort"
                    id="sortPostsV2"
                  >
                    Tanggal ↕
                  </button>
                </th>

                <th>Postingan</th>

                <th>Sentimen</th>

                <th>Topik</th>

                <th>Confidence</th>

              </tr>

            </thead>

            <tbody id="explorerRowsV2"></tbody>

          </table>

        </div>

        <div class="explorer-pagination">

          <button id="previousPostsV2">
            ← Sebelumnya
          </button>

          <span id="explorerPageV2">
            Halaman 1
          </span>

          <button id="nextPostsV2">
            Berikutnya →
          </button>

        </div>

        <p class="compare-disclaimer">
          Informasi kontak dan nama akun disamarkan
          secara otomatis. Nama pribadi yang tertulis
          dalam postingan tetap memerlukan pemeriksaan
          manual sebelum publikasi. Confidence hanya
          ditampilkan jika tersedia dalam dataset.
        </p>

      </section>
    `;

    main.insertBefore(page, footer);
  }


  // ===================================================
  // 7. MEMBUAT HALAMAN PERBANDINGAN PERIODE
  // ===================================================

  function createComparisonPage() {
    const main =
      document.querySelector(".main-content");

    const footer =
      main.querySelector(".footer");

    const page =
      document.createElement("section");

    page.id = "comparison";

    page.className =
      "page analytics-page comparison-page";

    page.innerHTML = `
      <section class="widget-card">

        <div class="analytics-header">

          <div class="analytics-header-icon">
            ▥
          </div>

          <div>

            <h2>Perbandingan Periode</h2>

            <p>
              Bandingkan distribusi sentimen dan topik
              pada dua periode untuk melihat perubahan
              percakapan Menfess.
            </p>

          </div>

        </div>

        <div class="compare-layout">

          <div>

            <div class="compare-periods">

              <div class="form-field">

                <label for="comparePeriodA">
                  Periode A
                </label>

                <select id="comparePeriodA">
                </select>

              </div>

              <div class="form-field">

                <label for="comparePeriodB">
                  Periode B
                </label>

                <select id="comparePeriodB">
                </select>

              </div>

            </div>

            <div
              id="compareStatsV2"
              class="compare-stats"
            ></div>

          </div>

          <div class="compare-chart-panel">

            <h3>
              Perbandingan Distribusi Sentimen
            </h3>

            <div class="chart-box compare-chart-box">

              <canvas id="compareChartV2">
              </canvas>

            </div>

            <div
              id="compareInsightV2"
              class="compare-insight"
            ></div>

            <p class="compare-disclaimer">
              Perbandingan menunjukkan perubahan
              percakapan Menfess, bukan hubungan
              sebab-akibat.
            </p>

          </div>

        </div>

      </section>
    `;

    main.insertBefore(page, footer);
  }


  // ===================================================
  // 8. MENGISI FILTER
  // ===================================================

  function populatePageFilters() {
    const availableMonths = getMonthOptions();

    ["issue", "explore"].forEach(prefix => {

      addOptions(
        prefix + "Month",
        availableMonths,
        "Semua Periode"
      );

      addOptions(
        prefix + "Topic",
        TOPICS,
        "Semua Topik"
      );

      addOptions(
        prefix + "Sentiment",
        SENTIMENTS,
        "Semua Sentimen"
      );
    });

    addOptions(
      "comparePeriodA",
      availableMonths
    );

    addOptions(
      "comparePeriodB",
      availableMonths
    );
  }

  function setDefaultComparison() {
    const months = getMonthOptions();

    if (months.length >= 2) {
      el("comparePeriodA").value =
        months[months.length - 2];

      el("comparePeriodB").value =
        months[months.length - 1];

    } else if (months.length === 1) {

      el("comparePeriodA").value = months[0];

      el("comparePeriodB").value = months[0];
    }
  }


  // ===================================================
  // 9. FILTER INDEPENDEN
  // ===================================================

  function getPageData(
    prefix,
    ignoreMonth = false
  ) {
    const month =
      el(prefix + "Month").value;

    const topic =
      el(prefix + "Topic").value;

    const sentiment =
      el(prefix + "Sentiment").value;

    const keyword =
      el(prefix + "Keyword")
        .value.trim().toLowerCase();

    return currentData.filter(row => {

      const matchMonth =
        ignoreMonth ||
        month === "all" ||
        row.month === month;

      const matchTopic =
        topic === "all" ||
        row.topic === topic;

      const matchSentiment =
        sentiment === "all" ||
        row.sentiment === sentiment;

      const matchKeyword =
        !keyword ||
        row.text.toLowerCase().includes(keyword);

      return (
        matchMonth &&
        matchTopic &&
        matchSentiment &&
        matchKeyword
      );
    });
  }


  // ===================================================
  // 10. DETAIL POSTINGAN
  // ===================================================

  function showPostDetails(title, rows) {

    const safeRows = rows.map(row => ({
      ...row,
      text: anonymizePost(row.text)
    }));

    if (typeof openDetails === "function") {

      openDetails(title, safeRows);

      return;
    }

    // Fallback jika modal lama belum tersedia.

    const preview = safeRows
      .slice(0, 10)
      .map(row =>
        `${formatDate(row)} | ${row.sentiment}\n` +
        `${row.text}`
      )
      .join("\n\n");

    alert(
      `${title}\n\n` +
      (preview || "Tidak ada postingan.")
    );
  }


  // ===================================================
  // 11. ANALISIS LONJAKAN ISU
  // ===================================================

  function renderIssuePage() {
    const list = el("issueListV2");

    const note = el("issueNoteV2");

    const title = el("issueChartTitleV2");

    list.replaceChildren();

    title.textContent =
      "Tren Pembahasan Mingguan";

    if (charts.issueV2) {

      charts.issueV2.destroy();

      delete charts.issueV2;
    }

    const month =
      el("issueMonth").value;

    const allDated = currentData.filter(
      row => Number.isFinite(row.date)
    );

    const anchors = allDated.filter(row =>
      month === "all" ||
      row.month === month
    );

    if (!anchors.length) {
      note.textContent =
        "Tanggal lengkap postingan belum tersedia.";

      list.innerHTML = `
        <p class="empty-state">
          Analisis mingguan belum dapat dilakukan.
        </p>
      `;

      return;
    }

    const endDate = anchors.reduce(
      (maximum, row) =>
        Math.max(maximum, row.date),
      -Infinity
    );

    const startDate =
      endDate - 34 * ONE_DAY;

    const earliestDate = allDated.reduce(
      (minimum, row) =>
        Math.min(minimum, row.date),
      Infinity
    );

    if (earliestDate > startDate) {

      note.textContent =
        "Diperlukan riwayat minimal 35 hari " +
        "untuk menghitung lonjakan mingguan.";

      return;
    }

    const scoped = getPageData(
      "issue",
      true
    );

    const windowData = scoped.filter(row =>

      Number.isFinite(row.date) &&

      row.date >= startDate &&

      row.date <= endDate
    );

    const keywordMap = new Map();

    windowData.forEach(row => {

      const weekIndex =
        4 - Math.floor(
          (endDate - row.date) /
          (7 * ONE_DAY)
        );

      if (
        weekIndex < 0 ||
        weekIndex > 4
      ) {
        return;
      }

      getPostWords(row.text).forEach(word => {

        if (!keywordMap.has(word)) {

          keywordMap.set(
            word,
            [0, 0, 0, 0, 0]
          );
        }

        keywordMap.get(word)[weekIndex]++;
      });
    });

    const results = [...keywordMap.entries()]

      .map(([word, values]) => {

        const baseline =
          values.slice(0, 4)
            .reduce((a, b) => a + b, 0) / 4;

        const latest = values[4];

        const ratio = baseline > 0
          ? latest / baseline
          : null;

        return {
          word,
          values,
          baseline,
          latest,
          ratio,
          increase: latest - baseline
        };
      })

      .filter(item =>

        item.latest >= 3 &&

        (
          item.baseline === 0 ||
          item.ratio >= 1.5
        )
      )

      .sort((a, b) =>
        b.increase - a.increase
      )

      .slice(0, 8);

    const periodEnd =
      new Date(endDate)
        .toLocaleDateString("id-ID", {
          timeZone: "UTC"
        });

    note.textContent =
      `Periode tujuh hari hingga ${periodEnd}. ` +
      `Dibandingkan rata-rata empat minggu sebelumnya. ` +
      `${scoped.length - scoped.filter(
        row => Number.isFinite(row.date)
      ).length} postingan tanpa tanggal dikecualikan.`;

    if (!results.length) {

      list.innerHTML = `
        <p class="empty-state">
          Tidak ada kata kunci yang memenuhi
          ambang lonjakan pada periode ini.
        </p>
      `;

      return;
    }

    results.forEach((item, index) => {

      const button =
        document.createElement("button");

      button.type = "button";

      button.className = "spike-button";

      const change = item.ratio === null
        ? "Isu baru"
        : `↑ ${formatDecimal(item.ratio)}×`;

      button.innerHTML = `
        <span>
          ${escapeHTML(capitalize(item.word))}
          <small style="
            display:block;
            font-size:11px;
            color:#718198;
            margin-top:5px;
          ">
            ${item.latest} postingan minggu terkini
          </small>
        </span>

        <b>${change}</b>
      `;

      button.onclick = () => {

        list.querySelectorAll("button")
          .forEach(element => {

            element.classList.toggle(
              "active",
              element === button
            );
          });

        renderIssueChart(
          item,
          windowData,
          endDate
        );
      };

      list.appendChild(button);

      if (index === 0) {
        button.click();
      }
    });
  }


  // ===================================================
  // 12. GRAFIK LONJAKAN ISU
  // ===================================================

  function renderIssueChart(
    item,
    windowData,
    endDate
  ) {
    if (charts.issueV2) {

      charts.issueV2.destroy();
    }

    el("issueChartTitleV2").textContent =
      `Tren Pembahasan "${capitalize(item.word)}"`;

    charts.issueV2 = new Chart(

      el("issueChartV2"),

      {
        type: "line",

        data: {

          labels: [
            "M-4",
            "M-3",
            "M-2",
            "M-1",
            "Terkini"
          ],

          datasets: [{

            label: "Jumlah Postingan",

            data: item.values,

            borderColor: "#e8b900",

            backgroundColor:
              "rgba(232,185,0,0.14)",

            borderWidth: 3,

            fill: true,

            tension: 0.25,

            pointRadius: 5,

            pointHoverRadius: 8,

            pointBackgroundColor: "#e8b900",

            pointBorderColor: "#ffffff",

            pointBorderWidth: 2

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

                label: context =>
                  `${context.raw} postingan`
              }
            }
          },

          scales: {

            y: {

              beginAtZero: true,

              ticks: {
                precision: 0
              },

              grid: {
                color: "#e1e8f0"
              }
            },

            x: {

              grid: {
                display: false
              }
            }
          },

          onHover: (event, elements) => {

            if (event.native?.target) {

              event.native.target.style.cursor =
                elements.length
                  ? "pointer"
                  : "default";
            }
          },

          onClick: (event, elements) => {

            if (!elements.length) return;

            const index =
              elements[0].index;

            const weekEnd =
              endDate -
              (4 - index) * 7 * ONE_DAY;

            const weekStart =
              weekEnd - 6 * ONE_DAY;

            const related = windowData.filter(row =>

              row.date >= weekStart &&

              row.date <= weekEnd &&

              getPostWords(row.text)
                .includes(item.word)
            );

            showPostDetails(
              `Pembahasan ${item.word}`,
              related
            );
          }
        }
      }
    );
  }


  // ===================================================
  // 13. EKSPLORASI POSTINGAN
  // ===================================================

  function renderExplorer() {
    const data = getPageData("explore");

    const sorted = [...data].sort((a, b) => {

      const dateA = Number.isFinite(a.date)
        ? a.date
        : MONTHS.indexOf(a.month) * 32 * ONE_DAY;

      const dateB = Number.isFinite(b.date)
        ? b.date
        : MONTHS.indexOf(b.month) * 32 * ONE_DAY;

      // Tanggal lengkap didahulukan jika tersedia.

      if (
        Number.isFinite(a.date) !==
        Number.isFinite(b.date)
      ) {

        return Number.isFinite(a.date)
          ? -1
          : 1;
      }

      return newestFirst
        ? dateB - dateA
        : dateA - dateB;
    });

    const totalPages = Math.max(
      1,
      Math.ceil(sorted.length / PAGE_SIZE)
    );

    explorerPage = Math.max(
      0,
      Math.min(explorerPage, totalPages - 1)
    );

    const start =
      explorerPage * PAGE_SIZE;

    const visibleRows =
      sorted.slice(start, start + PAGE_SIZE);

    el("explorerCountV2").innerHTML = `
      <strong>
        ${formatNumber(sorted.length)}
        postingan ditemukan
      </strong>

      <span>
        · Klik baris untuk melihat detail postingan.
      </span>
    `;

    const body =
      el("explorerRowsV2");

    body.replaceChildren();

    visibleRows.forEach(row => {

      const tr =
        document.createElement("tr");

      const postText =
        anonymizePost(row.text);

      const sentimentIcon = {
        positif: "☺",
        negatif: "☹",
        netral: "—"
      };

      tr.innerHTML = `

        <td>
          ${escapeHTML(formatDate(row))}
        </td>

        <td>
          <span class="post-preview">
            ${escapeHTML(postText)}
          </span>
        </td>

        <td>
          <span class="sentiment-pill
            ${escapeHTML(row.sentiment)}">

            ${sentimentIcon[row.sentiment] || ""}

            ${escapeHTML(capitalize(row.sentiment))}

          </span>
        </td>

        <td>
          ${escapeHTML(row.topic)}
        </td>

        <td>
          <span class="confidence-pill">
            ${formatConfidence(row.confidence)}
          </span>
        </td>
      `;

      tr.tabIndex = 0;

      tr.setAttribute(
        "role",
        "button"
      );

      tr.onclick = () => {

        showPostDetails(
          "Detail Postingan",
          [row]
        );
      };

      tr.onkeydown = event => {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          tr.click();
        }
      };

      body.appendChild(tr);
    });

    if (!visibleRows.length) {

      body.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            Tidak ada postingan yang sesuai
            dengan filter.
          </td>
        </tr>
      `;
    }

    el("explorerPageV2").textContent =
      `Halaman ${explorerPage + 1} dari ${totalPages}`;

    el("previousPostsV2").disabled =
      explorerPage === 0;

    el("nextPostsV2").disabled =
      explorerPage >= totalPages - 1;
  }


  // ===================================================
  // 14. PERBANDINGAN PERIODE
  // ===================================================

  function renderComparison() {
    const periodA =
      el("comparePeriodA").value;

    const periodB =
      el("comparePeriodB").value;

    const dataA = currentData.filter(
      row => row.month === periodA
    );

    const dataB = currentData.filter(
      row => row.month === periodB
    );

    const stats =
      el("compareStatsV2");

    const insight =
      el("compareInsightV2");

    if (charts.comparisonV2) {

      charts.comparisonV2.destroy();

      delete charts.comparisonV2;
    }

    if (periodA === periodB) {

      stats.innerHTML = `
        <p class="empty-state">
          Pilih dua periode yang berbeda.
        </p>
      `;

      insight.textContent =
        "Perbandingan membutuhkan dua periode berbeda.";

      return;
    }

    if (!dataA.length || !dataB.length) {

      stats.innerHTML = `
        <p class="empty-state">
          Data salah satu periode belum tersedia.
        </p>
      `;

      insight.textContent =
        "Perbandingan belum dapat dihitung.";

      return;
    }

    function share(data, key, value) {

      return data.filter(
        row => row[key] === value
      ).length / data.length * 100;
    }

    const valuesA = SENTIMENTS.map(
      sentiment =>
        share(dataA, "sentiment", sentiment)
    );

    const valuesB = SENTIMENTS.map(
      sentiment =>
        share(dataB, "sentiment", sentiment)
    );

    const negativeIndex =
      SENTIMENTS.indexOf("negatif");

    const negativeA =
      valuesA[negativeIndex];

    const negativeB =
      valuesB[negativeIndex];

    const negativeChange =
      negativeB - negativeA;

    const topicChanges = TOPICS.map(topic => {

      const proportionA =
        share(dataA, "topic", topic);

      const proportionB =
        share(dataB, "topic", topic);

      return {

        topic,

        proportionA,

        proportionB,

        change:
          proportionB - proportionA
      };

    }).sort(
      (a, b) => b.change - a.change
    );

    const mostIncreasing =
      topicChanges.find(
        row => row.change > 0
      );

    const mostDecreasing =
      [...topicChanges].reverse()
        .find(row => row.change < 0);

    function compareCard(
      label,
      value,
      change,
      color
    ) {
      return `
        <div class="compare-stat">

          <small>${escapeHTML(label)}</small>

          <strong>
            ${escapeHTML(value)}
          </strong>

          <span class="compare-change ${color}">
            ${escapeHTML(change)}
          </span>

        </div>
      `;
    }

    stats.innerHTML =

      compareCard(

        "Sentimen Negatif",

        `${formatDecimal(negativeA)}% → ` +
        `${formatDecimal(negativeB)}%`,

        signedPoints(negativeChange),

        negativeChange > 0
          ? "negative"
          : negativeChange < 0
            ? "positive"
            : "neutral"
      )

      +

      compareCard(

        "Topik Paling Meningkat",

        mostIncreasing
          ? mostIncreasing.topic
          : "Tidak ada peningkatan",

        mostIncreasing
          ? signedPoints(mostIncreasing.change)
          : "—",

        "positive"
      )

      +

      compareCard(

        "Topik Paling Menurun",

        mostDecreasing
          ? mostDecreasing.topic
          : "Tidak ada penurunan",

        mostDecreasing
          ? signedPoints(mostDecreasing.change)
          : "—",

        "neutral"
      );

    renderComparisonChart(
      periodA,
      periodB,
      dataA,
      dataB,
      valuesA,
      valuesB
    );

    const direction = negativeChange > 0
      ? "meningkat"
      : negativeChange < 0
        ? "menurun"
        : "tetap";

    insight.innerHTML = `

      <strong>Ringkasan Perbandingan</strong>

      <p style="margin-top:7px">

        Pada periode ${escapeHTML(periodB)},
        proporsi sentimen negatif

        <strong>
          ${direction}
          ${formatDecimal(Math.abs(negativeChange))}
          poin persentase
        </strong>

        dibandingkan periode
        ${escapeHTML(periodA)}.

      </p>

      ${
        mostIncreasing
          ? `
            <p style="margin-top:7px">

              Topik dengan kenaikan proporsi terbesar
              adalah

              <strong>
                ${escapeHTML(mostIncreasing.topic)}
              </strong>.

            </p>
          `
          : ""
      }

      <p style="margin-top:7px">

        Jumlah postingan periode A:
        <strong>${dataA.length}</strong>.

        Jumlah postingan periode B:
        <strong>${dataB.length}</strong>.

      </p>
    `;
  }


  // ===================================================
  // 15. GRAFIK PERBANDINGAN PERIODE
  // ===================================================

  function renderComparisonChart(
    periodA,
    periodB,
    dataA,
    dataB,
    valuesA,
    valuesB
  ) {

    const percentageLabels = {

      id: "comparisonPercentageLabels",

      afterDatasetsDraw(chart) {

        const ctx = chart.ctx;

        ctx.save();

        ctx.font =
          "600 11px Poppins";

        ctx.fillStyle =
          "#153e63";

        ctx.textAlign =
          "center";

        ctx.textBaseline =
          "bottom";

        chart.data.datasets.forEach(
          (dataset, datasetIndex) => {

            const meta =
              chart.getDatasetMeta(datasetIndex);

            if (meta.hidden) return;

            meta.data.forEach((bar, index) => {

              ctx.fillText(

                `${formatDecimal(dataset.data[index])}%`,

                bar.x,

                bar.y - 5
              );
            });
          }
        );

        ctx.restore();
      }
    };

    charts.comparisonV2 = new Chart(

      el("compareChartV2"),

      {
        type: "bar",

        data: {

          labels: SENTIMENTS.map(capitalize),

          datasets: [

            {

              label: periodA,

              data: valuesA,

              backgroundColor: "#91bee3",

              borderRadius: 6,

              maxBarThickness: 55
            },

            {

              label: periodB,

              data: valuesB,

              backgroundColor: "#245884",

              borderRadius: 6,

              maxBarThickness: 55
            }
          ]
        },

        plugins: [
          percentageLabels
        ],

        options: {

          responsive: true,

          maintainAspectRatio: false,

          layout: {

            padding: {
              top: 20
            }
          },

          plugins: {

            legend: {

              position: "top",

              labels: {

                usePointStyle: true,

                padding: 18
              }
            },

            tooltip: {

              callbacks: {

                label: context =>
                  `${context.dataset.label}: ` +
                  `${formatDecimal(context.raw)}%`
              }
            }
          },

          scales: {

            y: {

              beginAtZero: true,

              suggestedMax: Math.max(
                ...valuesA,
                ...valuesB
              ) + 10,

              ticks: {

                callback: value =>
                  `${value}%`
              },

              grid: {
                color: "#e1e8f0"
              }
            },

            x: {

              grid: {
                display: false
              }
            }
          },

          onHover: (event, elements) => {

            if (event.native?.target) {

              event.native.target.style.cursor =
                elements.length
                  ? "pointer"
                  : "default";
            }
          },

          onClick: (event, elements) => {

            if (!elements.length) return;

            const element =
              elements[0];

            const data =
              element.datasetIndex === 0
                ? dataA
                : dataB;

            const period =
              element.datasetIndex === 0
                ? periodA
                : periodB;

            const sentiment =
              SENTIMENTS[element.index];

            showPostDetails(

              `${period} — Sentimen ${sentiment}`,

              data.filter(
                row => row.sentiment === sentiment
              )
            );
          }
        }
      }
    );
  }


  // ===================================================
  // 16. MEMPERTAHANKAN CONFIDENCE DATASET
  // ===================================================

  const previousTransform =
    transformUploadedRows;

  transformUploadedRows = function (rows) {

    const result =
      previousTransform(rows);

    if (!rows.length) {

      return result;
    }

    const headers =
      Object.keys(rows[0]);

    const confidenceColumn = findColumn(
      headers,
      [
        "confidence",
        "confidence_score",
        "sentiment_confidence",
        "prediction_score",
        "probability"
      ]
    );

    if (!confidenceColumn) {

      result.validRows.forEach(row => {

        row.confidence =
          normalizeConfidence(row.confidence);
      });

      return result;
    }

    // Hubungkan confidence menggunakan data hasil
    // normalisasi agar baris invalid tidak menyebabkan
    // ketidaksesuaian posisi data.

    const confidenceQueues = new Map();

    function makeKey(row) {

      return JSON.stringify([
        row.text,
        row.month,
        row.topic,
        row.sentiment,
        row.hour,
        row.date ?? null
      ]);
    }

    // Normalisasi per baris untuk menjaga pasangan
    // antara hasil validasi dan confidence asli.

    rows.forEach(rawRow => {

      try {

        const normalized =
          previousTransform([rawRow]).validRows[0];

        if (!normalized) return;

        const key =
          makeKey(normalized);

        if (!confidenceQueues.has(key)) {

          confidenceQueues.set(key, []);
        }

        confidenceQueues.get(key).push(

          normalizeConfidence(
            rawRow[confidenceColumn]
          )
        );

      } catch (error) {

        // Baris invalid dilewati.
      }
    });

    result.validRows.forEach(row => {

      const queue =
        confidenceQueues.get(makeKey(row));

      row.confidence =
        queue?.length
          ? queue.shift()
          : null;
    });

    return result;
  };


  // ===================================================
  // 17. EVENT LISTENER FILTER
  // ===================================================

  function registerFilterEvents() {

    ["Month", "Topic", "Sentiment", "Keyword"]
      .forEach(suffix => {

        const issueFilter =
          el("issue" + suffix);

        const explorerFilter =
          el("explore" + suffix);

        const eventName =
          suffix === "Keyword"
            ? "input"
            : "change";

        issueFilter.addEventListener(
          eventName,
          renderIssuePage
        );

        explorerFilter.addEventListener(
          eventName,
          () => {

            explorerPage = 0;

            renderExplorer();
          }
        );
      });

    el("comparePeriodA")
      .addEventListener(
        "change",
        renderComparison
      );

    el("comparePeriodB")
      .addEventListener(
        "change",
        renderComparison
      );

    el("sortPostsV2").onclick = () => {

      newestFirst = !newestFirst;

      explorerPage = 0;

      renderExplorer();
    };

    el("previousPostsV2").onclick = () => {

      explorerPage--;

      renderExplorer();
    };

    el("nextPostsV2").onclick = () => {

      explorerPage++;

      renderExplorer();
    };
  }


  // ===================================================
  // 18. NAVIGASI HALAMAN BARU
  // ===================================================

  function openAnalyticsPage(target) {

    document.querySelectorAll(".nav-item")
      .forEach(button => {

        button.classList.toggle(
          "active",
          button.dataset.page === target
        );
      });

    document.querySelectorAll(".page")
      .forEach(page => {

        page.classList.toggle(
          "active",
          page.id === target
        );
      });

    if (pageInformation[target]) {

      el("pageHeading").textContent =
        pageInformation[target].title;

      el("pageSubheading").textContent =
        pageInformation[target].description;
    }

    populatePageFilters();

    if (target === "issues") {

      renderIssuePage();
    }

    if (target === "explorer") {

      explorerPage = 0;

      renderExplorer();
    }

    if (target === "comparison") {

      renderComparison();
    }

    setTimeout(() => {

      Object.values(charts)
        .forEach(chart => {

          if (chart) chart.resize();
        });

    }, 100);
  }

  function registerNavigation() {

    Object.keys(pageInformation)
      .forEach(target => {

        const button =
          document.querySelector(
            `[data-page="${target}"]`
          );

        button.addEventListener(
          "click",
          () => openAnalyticsPage(target)
        );
      });

    // Pertahankan navigasi dashboard lama.

    document.querySelector(
      '[data-page="dashboard"]'
    ).addEventListener("click", () => {

      el("pageHeading").textContent =
        "Ringkasan Dasbor";

      el("pageSubheading").textContent =
        "Pantau sentimen dan aktivitas Menfess PENS.";
    });

    document.querySelector(
      '[data-page="upload"]'
    ).addEventListener("click", () => {

      el("pageHeading").textContent =
        "Unggah Dataset";
    });
  }


  // ===================================================
  // 19. SINKRONISASI DATASET BARU
  // ===================================================

  let lastDataReference = currentData;

  const previousDashboardUpdate =
    updateDashboard;

  updateDashboard = function () {

    previousDashboardUpdate();

    // Perbarui pilihan periode saat dataset berubah.

    if (lastDataReference !== currentData) {

      lastDataReference = currentData;

      explorerPage = 0;

      populatePageFilters();

      setDefaultComparison();
    }

    if (el("issues")?.classList.contains("active")) {

      renderIssuePage();
    }

    if (el("explorer")?.classList.contains("active")) {

      renderExplorer();
    }

    if (
      el("comparison")?.classList.contains("active")
    ) {

      renderComparison();
    }
  };


  // ===================================================
  // 20. PERBAIKAN URUTAN FILTER DAN KPI
  // ===================================================

  function improveDashboardLayout() {

    const filter =
      document.querySelector(".filter-card");

    const kpi =
      document.querySelector(".kpi-grid");

    if (filter && kpi) {

      kpi.parentNode.insertBefore(
        filter,
        kpi
      );
    }

    const brand =
      document.querySelector(".brand-text small");

    if (brand) {

      brand.textContent =
        "Analisis Sentimen";
    }
  }


  // ===================================================
  // 21. INISIALISASI DASHBOARD V2
  // ===================================================

  function initializeDashboardV2() {

    // Hindari inisialisasi dua kali.

    if (el("explorer") || el("issues")) {

      return;
    }

    createNavigation();

    createIssuePage();

    createExplorerPage();

    createComparisonPage();

    populatePageFilters();

    setDefaultComparison();

    registerFilterEvents();

    registerNavigation();

    improveDashboardLayout();

    console.log(
      "Menfess PENS Dashboard V2 berhasil dimuat."
    );
  }

  initializeDashboardV2();

})();

// Memindahkan Ringkasan Analisis ke bawah dashboard
(() => {
  const dashboard = document.getElementById("dashboard");
  const insightTitle = document.getElementById("insightTitle");
  const insightCard = insightTitle?.closest(".widget-card");
  const analysisGrid = insightCard?.parentElement;

  if (dashboard && insightCard) {
    dashboard.appendChild(insightCard);

    insightCard.style.marginTop = "14px";
    insightCard.style.width = "100%";

    // Hapus wadah lama jika sudah kosong
    if (
      analysisGrid?.classList.contains("analysis-grid") &&
      analysisGrid.children.length === 0
    ) {
      analysisGrid.remove();
    }
  }
})();

// Pindahkan Ringkasan Analisis ke bawah Prioritas Evaluasi
(() => {
  const insightCard = document
    .getElementById("insightTitle")
    ?.closest(".widget-card");

  const priorityCard =
    document.querySelector(".priority-widget");

  if (insightCard && priorityCard) {
    const oldParent = insightCard.parentElement;

    priorityCard.after(insightCard);

    insightCard.classList.add("compact-summary");
    insightCard.style.marginTop = "0";
    insightCard.style.width = "100%";

    if (
      oldParent.classList.contains("analysis-grid") &&
      oldParent.children.length === 0
    ) {
      oldParent.remove();
    }
  }
})();


// =====================================================
// REDESIGN UPLOAD DATASET - DUAL MODE
// =====================================================

(() => {

  const uploadPage = document.getElementById("upload");

  if (!uploadPage) return;

  // Hindari inisialisasi ganda
  if (document.getElementById("datasetModeTabs")) {
    return;
  }

  let uploadMode = "main";

  // ===================================================
  // 1. SIMPAN KOMPONEN UPLOAD YANG SUDAH ADA
  // ===================================================

  const oldDropzone =
    document.getElementById("dropzone");

  const oldSelectedFile =
    document.getElementById("selectedFile");

  const oldProcessButton =
    document.getElementById("processFile");

  const oldUploadMessage =
    document.getElementById("uploadMessage");

  const oldTemplateButton =
    document.getElementById("downloadTemplate");

  const oldRemoveButton =
    document.getElementById("removeFile");

  if (
    !oldDropzone ||
    !oldSelectedFile ||
    !oldProcessButton ||
    !oldUploadMessage ||
    !oldTemplateButton
  ) {
    console.warn(
      "Komponen halaman upload belum lengkap."
    );

    return;
  }

  // ===================================================
  // 2. MEMBUAT TAMPILAN BARU
  // ===================================================

  uploadPage.innerHTML = `

    <div class="dataset-upload-page">

      <section class="widget-card dataset-upload-panel">

        <div class="dataset-tabs" id="datasetModeTabs">

          <button
            type="button"
            class="dataset-tab active"
            data-upload-mode="main"
            aria-pressed="true"
          >

            <div class="dataset-tab-icon">▤</div>

            <div class="dataset-tab-text">

              <strong>
                Perbarui Dataset Utama
              </strong>

              <small>
                Tambahkan data ke dashboard utama
              </small>

            </div>

            <span class="dataset-tab-check">✓</span>

          </button>


          <button
            type="button"
            class="dataset-tab"
            data-upload-mode="custom"
            aria-pressed="false"
          >

            <div class="dataset-tab-icon">▥</div>

            <div class="dataset-tab-text">

              <strong>
                Analisis Dataset Mandiri
              </strong>

              <small>
                Analisis dataset secara terpisah
              </small>

            </div>

            <span class="dataset-tab-check">✓</span>

          </button>

        </div>


        <!-- INFORMASI DATASET UTAMA -->

        <div id="mainDatasetInfo">

          <div class="dataset-meta-grid">

            <div class="dataset-meta-item">

              <small>Total data saat ini</small>

              <strong id="mainDatasetTotal">—</strong>

            </div>


            <div class="dataset-meta-item">

              <small>Periode awal</small>

              <strong id="mainDatasetStart">—</strong>

            </div>


            <div class="dataset-meta-item">

              <small>Periode terakhir</small>

              <strong id="mainDatasetEnd">—</strong>

            </div>

          </div>

        </div>


        <!-- INFORMASI DATASET MANDIRI -->

        <div id="customDatasetInfo" hidden>

          <div class="dataset-custom-info">

            <div class="dataset-tab-icon">▥</div>

            <div>

              <strong>
                Analisis Dataset Secara Terpisah
              </strong>

              <p>
                Gunakan dataset lain untuk menjalankan
                seluruh fitur analisis tanpa mengubah
                dataset utama Menfess PENS.
              </p>

            </div>

          </div>

        </div>


        <!-- KETENTUAN DATASET -->

        <div class="dataset-rule">

          <span class="dataset-rule-icon">ⓘ</span>

          <div>

            <strong id="datasetRuleTitle"></strong>

            <p id="datasetRuleText"></p>

          </div>

        </div>


        <!-- TEMPAT UPLOAD -->

        <div id="datasetDropzoneSlot"></div>

        <div id="datasetSelectedFileSlot"></div>


        <!-- TOMBOL ACTION -->

        <div class="dataset-upload-actions">

          <div id="datasetTemplateSlot"></div>

          <div id="datasetProcessSlot"></div>

        </div>


        <div id="datasetMessageSlot"></div>

        <p class="dataset-ui-note" id="datasetModeNote">
        </p>

      </section>


      <!-- RIWAYAT UNGGAHAN -->

      <section
        class="widget-card dataset-history-card"
        id="mainUploadHistory"
      >

        <div class="dataset-history-heading">

          <h3>Riwayat Unggah Dataset</h3>

          <p>
            Daftar penambahan data ke dataset utama.
          </p>

        </div>

        <div class="dataset-history-scroll">

          <table class="dataset-history-table">

            <thead>

              <tr>

                <th>Nama File</th>

                <th>Periode</th>

                <th>Data Baru</th>

                <th>Tanggal Unggah</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody id="datasetHistoryRows">

              <tr>

                <td colspan="5">

                  <div class="dataset-history-empty">

                    <span>▤</span>

                    Riwayat unggahan belum tersedia.

                  </div>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </section>


      <!-- STATUS DATASET MANDIRI -->

      <section
        class="widget-card dataset-history-card"
        id="customUploadStatus"
        hidden
      >

        <div class="dataset-history-heading">

          <h3>Informasi Dataset Mandiri</h3>

          <p>
            Status dataset yang sedang dianalisis.
          </p>

        </div>

        <div class="dataset-history-empty">

          <span>▥</span>

          Belum ada dataset mandiri yang aktif.

          <br>

          Unggah dataset untuk memulai analisis.

        </div>

        <button
          type="button"
          class="outline-button"
          id="returnMainDataset"
          disabled
          style="display:block; margin:0 auto;"
        >

          ← Kembali ke Dataset Utama

        </button>

      </section>


      <!-- FORMAT DATASET -->

      <details class="widget-card dataset-format-card">

        <summary>
          Panduan Format Dataset
        </summary>

        <div class="format-list">

          <div>

            <strong>text</strong>

            <span>Isi postingan Menfess</span>

          </div>

          <div>

            <strong>created_at</strong>

            <span>Tanggal dan jam postingan</span>

          </div>

          <div>

            <strong>sentiment</strong>

            <span>Positif, negatif, atau netral</span>

          </div>

          <div>

            <strong>topic</strong>

            <span>Kategori pembahasan</span>

          </div>

          <div>

            <strong>confidence</strong>

            <span>Skor prediksi (opsional)</span>

          </div>

          <div>

            <strong>tweet_id</strong>

            <span>ID unik postingan (opsional)</span>

          </div>

        </div>

        <p class="dataset-format-note">

          Gunakan tanggal lengkap dengan format
          YYYY-MM-DD HH:mm:ss agar seluruh fitur
          analisis dapat digunakan.

          Dataset sementara harus memiliki label
          sentimen dan topik sampai integrasi model
          tersedia.

        </p>

      </details>

    </div>

  `;

  // ===================================================
  // 3. PASANG KEMBALI KOMPONEN UPLOAD LAMA
  // ===================================================

  const el = id => document.getElementById(id);

  el("datasetDropzoneSlot")
    .appendChild(oldDropzone);

  el("datasetSelectedFileSlot")
    .appendChild(oldSelectedFile);

  el("datasetProcessSlot")
    .appendChild(oldProcessButton);

  el("datasetMessageSlot")
    .appendChild(oldUploadMessage);

  el("datasetTemplateSlot")
    .appendChild(oldTemplateButton);

  oldTemplateButton.className =
    "dataset-template-button";

  oldTemplateButton.textContent =
    "↓ Unduh Template Dataset";

  oldProcessButton.textContent =
    "Tambahkan Data";

  // Perbarui teks dropzone

  const dropzoneTitle =
    oldDropzone.querySelector("strong");

  const dropzoneDescription =
    oldDropzone.querySelector("span");

  const dropzoneIcon =
    oldDropzone.querySelector(".drop-icon");

  if (dropzoneTitle) {

    dropzoneTitle.textContent =
      "Tarik dan letakkan dataset di sini";

  }

  if (dropzoneDescription) {

    dropzoneDescription.textContent =
      "Mendukung format CSV, XLSX, dan XLS";

  }

  if (dropzoneIcon) {

    dropzoneIcon.textContent = "⇧";

  }

  // ===================================================
  // 4. MENCEGAH UPLOAD LAMA MENGGANTI DATA UTAMA
  // ===================================================

  // Tahap ini khusus UI.
  // Handler lama diblokir sementara agar dataset
  // utama tidak tertimpa oleh proses upload lama.

  oldProcessButton.addEventListener(
    "click",
    event => {

      event.preventDefault();

      event.stopImmediatePropagation();

      oldUploadMessage.textContent =
        "File siap diproses. Fitur penyimpanan " +
        "dan validasi dataset akan aktif setelah " +
        "backend terhubung.";

      oldUploadMessage.className =
        "upload-message";

    },
    true
  );

  // ===================================================
  // 5. MEMBUAT TEMPLATE DATASET BARU
  // ===================================================

  oldTemplateButton.addEventListener(
    "click",
    event => {

      event.preventDefault();

      event.stopImmediatePropagation();

      if (typeof XLSX === "undefined") {

        oldUploadMessage.textContent =
          "Library Excel belum berhasil dimuat.";

        oldUploadMessage.className =
          "upload-message error";

        return;
      }

      const template = [

        {
          text: "Contoh postingan Menfess",
          created_at: "2026-11-01 10:30:00",
          sentiment: "",
          topic: "",
          confidence: "",
          tweet_id: ""
        },

        {
          text: "Contoh postingan berikutnya",
          created_at: uploadMode === "main"
            ? "2026-11-02 19:30:00"
            : "2026-12-01 19:30:00",
          sentiment: "",
          topic: "",
          confidence: "",
          tweet_id: ""
        }

      ];

      const worksheet =
        XLSX.utils.json_to_sheet(template);

      worksheet["!cols"] = [
        { wch: 50 },
        { wch: 23 },
        { wch: 15 },
        { wch: 40 },
        { wch: 15 },
        { wch: 25 }
      ];

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Dataset Menfess"
      );

      const filename = uploadMode === "main"
        ? "Template_Dataset_Utama.xlsx"
        : "Template_Dataset_Mandiri.xlsx";

      XLSX.writeFile(workbook, filename);

    },
    true
  );

  // ===================================================
  // 6. RESET FILE KETIKA BERPINDAH TAB
  // ===================================================

  function resetUploadFile() {

    if (oldRemoveButton) {

      oldRemoveButton.click();

    } else {

      const input = el("fileInput");

      if (input) input.value = "";

      oldSelectedFile.hidden = true;

      oldProcessButton.disabled = true;

    }

    oldUploadMessage.textContent = "";

    oldUploadMessage.className =
      "upload-message";

  }

  // ===================================================
  // 7. INFORMASI DATASET AWAL
  // ===================================================

  function updateDatasetPreview() {

    const data =
      typeof currentData !== "undefined"
        ? currentData
        : [];

    el("mainDatasetTotal").textContent =
      data.length.toLocaleString("id-ID");

    const dates = data
      .filter(row => Number.isFinite(row.date))
      .map(row => row.date);

    if (dates.length) {

      const first = dates.reduce(
        (a, b) => Math.min(a, b)
      );

      const last = dates.reduce(
        (a, b) => Math.max(a, b)
      );

      const options = {
        month: "short",
        year: "numeric",
        timeZone: "UTC"
      };

      el("mainDatasetStart").textContent =
        new Date(first).toLocaleDateString(
          "id-ID",
          options
        );

      el("mainDatasetEnd").textContent =
        new Date(last).toLocaleDateString(
          "id-ID",
          options
        );

    } else {

      el("mainDatasetStart").textContent = "Jan 2026";

      el("mainDatasetEnd").textContent = "Okt 2026";

    }

  }

  // ===================================================
  // 8. PERPINDAHAN MODE UNGGAH
  // ===================================================

  function setUploadMode(mode) {

    uploadMode = mode;

    const isMain = mode === "main";

    document.querySelectorAll(".dataset-tab")
      .forEach(button => {

        const active =
          button.dataset.uploadMode === mode;

        button.classList.toggle(
          "active",
          active
        );

        button.setAttribute(
          "aria-pressed",
          String(active)
        );

      });

    // Ganti informasi dataset

    el("mainDatasetInfo").hidden = !isMain;

    el("customDatasetInfo").hidden = isMain;

    el("mainUploadHistory").hidden = !isMain;

    el("customUploadStatus").hidden = isMain;

    // Ganti ketentuan dataset

    el("datasetRuleTitle").textContent =
      isMain
        ? "Ketentuan Penambahan Data"
        : "Ketentuan Dataset Mandiri";

    el("datasetRuleText").textContent =
      isMain
        ? "Dataset hanya boleh berisi postingan " +
          "mulai 1 November 2026. Data baru akan " +
          "ditambahkan tanpa menghapus dataset " +
          "utama sebelumnya."
        : "Dataset dapat menggunakan periode dan " +
          "tahun bebas, dengan minimal dua bulan " +
          "kalender berbeda. Dataset utama tidak " +
          "akan berubah.";

    // Ganti tombol action

    oldProcessButton.textContent =
      isMain
        ? "Tambahkan Data"
        : "Mulai Analisis";

    // Ganti keterangan bawah

    el("datasetModeNote").textContent =
      isMain
        ? "Mode penambahan permanen. Validasi tanggal, " +
          "pemeriksaan duplikat, dan penyimpanan " +
          "akan ditangani oleh backend."
        : "Mode analisis sementara. Seluruh fitur " +
          "dashboard nantinya mengikuti dataset aktif " +
          "dan dapat dikembalikan ke dataset utama.";

    resetUploadFile();

    if (isMain) {

      updateDatasetPreview();

    }

  }

  // ===================================================
  // 9. EVENT LISTENER TAB
  // ===================================================

  document.querySelectorAll(".dataset-tab")
    .forEach(button => {

      button.addEventListener("click", () => {

        if (
          uploadMode === button.dataset.uploadMode
        ) return;

        setUploadMode(
          button.dataset.uploadMode
        );

      });

    });

  // ===================================================
  // 10. SINKRONISASI SIDEBAR
  // ===================================================

  const uploadNavigation =
    document.querySelector(
      '[data-page="upload"]'
    );

  if (uploadNavigation) {

    uploadNavigation.addEventListener(
      "click",
      () => {

        const heading = el("pageHeading");

        const subheading = el("pageSubheading");

        if (heading) {

          heading.textContent =
            "Unggah Dataset";

        }

        if (subheading) {

          subheading.textContent =
            "Kelola dataset utama dan analisis " +
            "dataset secara mandiri.";

        }

        updateDatasetPreview();

      }
    );

  }

  // ===================================================
  // 11. INISIALISASI UI
  // ===================================================

  setUploadMode("main");

  console.log(
    "Menfess PENS: Dual Mode Upload UI berhasil dimuat."
  );

})();

