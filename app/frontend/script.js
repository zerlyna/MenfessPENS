// =====================================================
// MENFESS PENS - SENTIMENT DASHBOARD
// =====================================================

// 1. KONFIGURASI

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

Chart.defaults.font.family = "Poppins";
Chart.defaults.font.size = 12;
Chart.defaults.color = "#65768b";
Chart.defaults.plugins.legend.labels.boxWidth = 10;
Chart.defaults.plugins.legend.labels.padding = 15;


// =====================================================
// 2. DATA DEMO JANUARI - OKTOBER 2026
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
        const totalWeight = hourWeights.reduce(
            (a, b) => a + b,
            0
        );

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
            } else if (
                sentimentRandom < weights[0] + weights[1]
            ) {
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
        "1": "Januari",
        "01": "Januari",
        januari: "Januari",
        jan: "Januari",

        "2": "Februari",
        "02": "Februari",
        februari: "Februari",
        feb: "Februari",

        "3": "Maret",
        "03": "Maret",
        maret: "Maret",
        mar: "Maret",

        "4": "April",
        "04": "April",
        april: "April",
        apr: "April",

        "5": "Mei",
        "05": "Mei",
        mei: "Mei",

        "6": "Juni",
        "06": "Juni",
        juni: "Juni",
        jun: "Juni",

        "7": "Juli",
        "07": "Juli",
        juli: "Juli",
        jul: "Juli",

        "8": "Agustus",
        "08": "Agustus",
        agustus: "Agustus",
        agu: "Agustus",
        aug: "Agustus",

        "9": "September",
        "09": "September",
        september: "September",
        sep: "September",

        "10": "Oktober",
        oktober: "Oktober",
        okt: "Oktober",
        oct: "Oktober"
    };

    if (aliases[key]) return aliases[key];

    let match = raw.match(
        /^(\d{4})[-/](\d{1,2})[-/]\d{1,2}/
    );

    if (match) {
        const monthNumber = Number(match[2]);

        return monthNumber >= 1 && monthNumber <= 10
            ? MONTHS[monthNumber - 1]
            : null;
    }

    match = raw.match(
        /^(\d{1,2})[-/](\d{1,2})[-/]\d{4}$/
    );

    if (match) {
        const monthNumber = Number(match[2]);

        return monthNumber >= 1 && monthNumber <= 10
            ? MONTHS[monthNumber - 1]
            : null;
    }

    return null;
}


// =====================================================
// LANJUTAN FUNGSI UTILITAS
// =====================================================

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

    if (
        typeof value === "number" &&
        value >= 0 &&
        value < 1
    ) {
        return Math.floor(value * 24);
    }

    const raw = normalizeText(value);

    if (!raw) return null;

    const match = raw.match(
        /(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/
    );

    if (match) {
        const hour = Number(match[1]);

        return hour >= 0 && hour <= 23
            ? hour
            : null;
    }

    return null;
}


// =====================================================
// 5. NAVIGASI SIDEBAR
// =====================================================

document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", () => {

        const target = button.dataset.page;

        document.querySelectorAll(".nav-item")
            .forEach(item => {

                item.classList.toggle(
                    "active",
                    item === button
                );

            });

        document.querySelectorAll(".page")
            .forEach(page => {

                page.classList.toggle(
                    "active",
                    page.id === target
                );

            });

        const isDashboard = target === "dashboard";

        document.getElementById("pageHeading").textContent =
            isDashboard
                ? "Dashboard Overview"
                : "Upload Dataset";

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

    const month =
        document.getElementById("monthFilter").value;

    const topic =
        document.getElementById("topicFilter").value;

    const sentiment =
        document.getElementById("sentimentFilter").value;

    const keyword =
        document.getElementById("keywordSearch")
            .value.trim().toLowerCase();

    return currentData.filter(item => {

        const matchMonth =
            month === "all" || item.month === month;

        const matchTopic =
            topic === "all" || item.topic === topic;

        const matchSentiment =
            sentiment === "all" ||
            item.sentiment === sentiment;

        const matchKeyword =
            !keyword ||
            item.text.toLowerCase().includes(keyword);

        return (
            matchMonth &&
            matchTopic &&
            matchSentiment &&
            matchKeyword
        );

    });

}


// Event listener filter

[
    "monthFilter",
    "topicFilter",
    "sentimentFilter"
].forEach(id => {

    document.getElementById(id).addEventListener(
        "change",
        () => updateDashboard()
    );

});

document.getElementById("keywordSearch")
    .addEventListener("input", () => updateDashboard());

document.getElementById("resetFilters")
    .addEventListener("click", () => {

        resetAllFilters();
        updateDashboard();

    });

function resetAllFilters() {

    document.getElementById("monthFilter").value = "all";

    document.getElementById("topicFilter").value = "all";

    document.getElementById("sentimentFilter").value = "all";

    document.getElementById("keywordSearch").value = "";

    document.getElementById("trendSentimentFilter").value = "all";

}


// =====================================================
// 7. KPI RINGKASAN SENTIMEN
// =====================================================

function updateKPI(data) {

    const total = data.length;

    const positive = countBy(
        data,
        "sentiment",
        "positif"
    );

    const negative = countBy(
        data,
        "sentiment",
        "negatif"
    );

    const neutral = countBy(
        data,
        "sentiment",
        "netral"
    );

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
// 8. DISTRIBUSI SENTIMEN
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

                labels: [
                    "Positif",
                    "Negatif",
                    "Netral"
                ],

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

            const label =
                sentiment.charAt(0).toUpperCase() +
                sentiment.slice(1);

            return `

                <div class="legend-item">

                    <span class="legend-name">

                        <i
                            class="legend-dot"
                            style="background:${colors[index]}"
                        ></i>

                        ${label}

                    </span>

                    <span class="legend-value">

                        ${values[index]}

                        (${percentage(
                            values[index],
                            total
                        ).toFixed(1)}%)

                    </span>

                </div>

            `;

        }).join("");

}


// =====================================================
// 9. TREN SENTIMEN
// =====================================================

document.getElementById("trendSentimentFilter")
    .addEventListener(
        "change",
        () => updateTrendChart()
    );

function updateTrendChart() {

    const selectedSentiment =
        document.getElementById(
            "trendSentimentFilter"
        ).value;

    const selectedMonth =
        document.getElementById("monthFilter").value;

    const selectedTopic =
        document.getElementById("topicFilter").value;

    const keyword =
        document.getElementById("keywordSearch")
            .value.trim().toLowerCase();

    const trendData = currentData.filter(item => {

        return (

            (
                selectedMonth === "all" ||
                item.month === selectedMonth
            ) &&

            (
                selectedTopic === "all" ||
                item.topic === selectedTopic
            ) &&

            (
                !keyword ||
                item.text.toLowerCase().includes(keyword)
            )

        );

    });

    const datasets = SENTIMENTS

        .filter(sentiment =>

            selectedSentiment === "all" ||
            sentiment === selectedSentiment

        )

        .map(sentiment => ({

            label:
                sentiment.charAt(0).toUpperCase() +
                sentiment.slice(1),

            data: MONTHS.map(month =>

                countBy(

                    trendData.filter(
                        item => item.month === month
                    ),

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
// 10. DISTRIBUSI KATEGORI
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
// 11. JAM SIBUK MENFESS
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

    const total = hourlyCounts.reduce(
        (a, b) => a + b, 0
    );

    const peakCount = Math.max(...hourlyCounts);
    const peakIndex = hourlyCounts.indexOf(peakCount);

    if (charts.rush) {
        charts.rush.destroy();
    }

    charts.rush = new Chart(
        document.getElementById("rushChart"),
        {
            type: "bar",

            data: {
                labels: Array.from(
                    { length: 24 },
                    (_, hour) =>
                        String(hour).padStart(2, "0")
                ),

                datasets: [{
                    label: "Jumlah Postingan",
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

    if (!total) {
        peakHourElement.textContent = "--:--";

        insightElement.textContent =
            "Belum ada informasi jam pengiriman pada data yang dipilih.";

        return;
    }

    const hour = String(peakIndex).padStart(2, "0");

    const peakPercentage =
        percentage(peakCount, total).toFixed(1);

    peakHourElement.textContent = `${hour}:00`;

    insightElement.textContent =
        `Waktu pengiriman paling ramai adalah pukul ` +
        `${hour}:00–${hour}:59, dengan ${peakCount} ` +
        `postingan (${peakPercentage}% dari data ` +
        `yang memiliki informasi jam).`;
}


// =====================================================
// 12. PRIORITAS EVALUASI
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
            rate: percentage(
                negative,
                topicData.length
            )
        };

    })
    .filter(item => item.total > 0)
    .sort((a, b) => b.rate - a.rate);

    const container =
        document.getElementById("priorityList");

    if (!results.length) {
        container.innerHTML = `
            <p class="empty-state">
                Belum ada data untuk dianalisis.
            </p>
        `;

        return;
    }

    container.innerHTML = results.map(item => `

        <div
            class="priority-item"
            data-topic="${escapeHTML(item.topic)}"
            title="${item.negative} postingan negatif dari ${item.total} postingan"
        >

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
// 13. NORMALISASI TANGGAL POSTINGAN
// =====================================================

const DAY = 86400000;
const SPIKE_THRESHOLD = 1.5;
const MIN_SPIKE_POSTS = 3;

function parsePostingDate(value) {
    if (value instanceof Date && !isNaN(value)) {
        return Date.UTC(
            value.getFullYear(),
            value.getMonth(),
            value.getDate()
        );
    }

    const raw = normalizeText(value);

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
// 14. PENYESUAIAN TANGGAL DATA DEMO
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
            date: Date.UTC(2026, monthIndex, day),
            confidence: null
        };
    });
};


// =====================================================
// 15. STOPWORDS DAN EKSTRAKSI KATA KUNCI
// =====================================================

const EXTRA_STOPWORDS = new Set(`

    yang dan di ke dari untuk dengan
    ini itu ada atau karena saya aku
    kami kita mereka pada dalam sudah
    belum akan tidak bisa sangat lebih
    kurang jadi nya banyak sering
    beberapa banget juga masih saat
    secara telah seperti gitu kayak
    aja sih dong nih kalau kalo
    kampus mahasiswa pens menfess
    the and to is of in on a an

`.trim().split(/\s+/));

function tokenizeText(text) {
    return String(text ?? "")
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
// 16. KATA KUNCI TERATAS
// =====================================================

function updateKeywords(data) {
    const container =
        document.getElementById("keywordCloud");

    const topWords =
        getKeywordCounts(data).slice(0, 15);

    if (!topWords.length) {
        container.innerHTML = `
            <p class="empty-state">
                Belum ada kata kunci.
            </p>
        `;

        return;
    }

    container.innerHTML = topWords.map(
        ([word, count]) => `

            <button
                type="button"
                class="keyword"
                data-keyword="${escapeHTML(word)}"
                title="${count} postingan"
            >

                ${escapeHTML(word)}

                <b>${formatNumber(count)}</b>

            </button>

        `
    ).join("");

    container.querySelectorAll(".keyword")
        .forEach(button => {
            button.addEventListener("click", () => {
                const keyword =
                    document.getElementById("keywordSearch");

                keyword.value =
                    button.dataset.keyword;

                updateDashboard();
            });
        });
}


// =====================================================
// 17. FILTER UNTUK ANALISIS PERIODE
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
// 18. KOMPONEN UPLOAD DATASET
// =====================================================

const fileInput =
    document.getElementById("fileInput");

const dropzone =
    document.getElementById("dropzone");

const selectedFileBox =
    document.getElementById("selectedFile");

const processButton =
    document.getElementById("processFile");


// Pesan status upload

function showUploadMessage(message, type = "") {
    const element =
        document.getElementById("uploadMessage");

    if (!element) return;

    element.textContent = message;

    element.className =
        `upload-message ${type}`;
}


// Pemilihan file

function setSelectedFile(file) {
    if (!file) return;

    const allowed = [".csv", ".xlsx", ".xls"];

    const extension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

    if (!allowed.includes(extension)) {
        resetSelectedFile();

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

    showUploadMessage("");
}


// Reset file

function resetSelectedFile() {
    selectedFile = null;

    fileInput.value = "";

    selectedFileBox.hidden = true;

    processButton.disabled = true;

    showUploadMessage("");
}


// Event pemilihan file

document.getElementById("chooseFile")
    .addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", event => {
    setSelectedFile(event.target.files[0]);
});

document.getElementById("removeFile")
    .addEventListener("click", resetSelectedFile);


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
// 19. PEMBACAAN CSV DAN EXCEL
// =====================================================

async function readUploadedFile(file) {
    if (typeof XLSX === "undefined") {
        throw new Error(
            "Library SheetJS belum berhasil dimuat."
        );
    }

    let workbook;

    if (file.name.toLowerCase().endsWith(".csv")) {
        const content = await file.text();

        workbook = XLSX.read(content, {
            type: "string"
        });

    } else {
        const content = await file.arrayBuffer();

        workbook = XLSX.read(content, {
            type: "array",
            cellDates: true
        });
    }

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
        throw new Error(
            "File tidak memiliki worksheet."
        );
    }

    return XLSX.utils.sheet_to_json(
        workbook.Sheets[sheetName],
        {
            defval: ""
        }
    );
}


// =====================================================
// 20. NORMALISASI CONFIDENCE SCORE
// =====================================================

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

    let score = Number(raw.replace("%", ""));

    if (raw.includes("%")) {
        score /= 100;
    }

    return Number.isFinite(score) &&
        score >= 0 &&
        score <= 1
            ? score
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


// =====================================================
// 21. NORMALISASI DATASET UPLOAD
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
        "timestamp",
        "waktu"
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

    const confidenceColumn = findColumn(headers, [
        "confidence",
        "confidence_score",
        "sentiment_confidence",
        "prediction_score",
        "probability"
    ]);

    const idColumn = findColumn(headers, [
        "tweet_id",
        "post_id",
        "id"
    ]);


    // Validasi kolom wajib

    const missing = [];

    if (!textColumn) missing.push("text");

    if (!monthColumn && !dateColumn) {
        missing.push("month atau created_at");
    }

    if (!topicColumn) missing.push("topic");

    if (!sentimentColumn) missing.push("sentiment");

    if (missing.length) {
        throw new Error(
            `Kolom wajib belum ditemukan: ${missing.join(", ")}`
        );
    }


    // Normalisasi setiap baris

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

            (
                Number.isFinite(date)
                    ? MONTHS[new Date(date).getUTCMonth()]
                    : null
            );

        const hour =
            extractHour(timeValue) ??
            extractHour(dateValue) ??
            extractHour(monthValue);

        return {
            text: normalizeText(
                row[textColumn]
            ),

            month,

            date,

            hour,

            topic: normalizeTopic(
                row[topicColumn]
            ),

            sentiment: normalizeSentiment(
                row[sentimentColumn]
            ),

            confidence: confidenceColumn
                ? normalizeConfidence(
                    row[confidenceColumn]
                )
                : null,

            tweet_id: idColumn
                ? normalizeText(row[idColumn])
                : null
        };
    });


    // Ambil baris yang memenuhi format

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
}


// =====================================================
// 22. RINGKASAN ANALISIS
// =====================================================

function updateInsightSummary(data) {
    const title =
        document.getElementById("insightTitle");

    const container =
        document.getElementById("insightList");

    if (!title || !container) return;

    const selectedMonth =
        document.getElementById("monthFilter").value;

    title.textContent =
        selectedMonth === "all"
            ? "Ringkasan Analisis Seluruh Periode"
            : `Ringkasan Analisis ${selectedMonth}`;

    if (!data.length) {
        container.innerHTML = `
            <p class="empty-state">
                Belum ada data untuk dianalisis.
            </p>
        `;

        return;
    }

    // =================================================
    // PERUBAHAN SENTIMEN NEGATIF
    // =================================================

    const scopedData = getScopedData(true);

    const availableMonths = MONTHS.filter(month =>
        scopedData.some(row => row.month === month)
    );

    const currentMonth =
        selectedMonth === "all"
            ? availableMonths[availableMonths.length - 1]
            : selectedMonth;

    const monthIndex =
        MONTHS.indexOf(currentMonth);

    const previousMonth =
        monthIndex > 0
            ? MONTHS[monthIndex - 1]
            : null;

    const currentMonthData =
        scopedData.filter(
            row => row.month === currentMonth
        );

    const previousMonthData =
        scopedData.filter(
            row => row.month === previousMonth
        );

    let sentimentText =
        "Belum tersedia periode pembanding.";

    let sentimentIcon = "↔";
    let sentimentClass = "neutral";

    if (
        currentMonthData.length &&
        previousMonthData.length
    ) {
        const currentRate = percentage(
            countBy(
                currentMonthData,
                "sentiment",
                "negatif"
            ),
            currentMonthData.length
        );

        const previousRate = percentage(
            countBy(
                previousMonthData,
                "sentiment",
                "negatif"
            ),
            previousMonthData.length
        );

        const change =
            currentRate - previousRate;

        const absoluteChange =
            Math.abs(change).toFixed(1);

        if (change > 0) {
            sentimentText =
                `Sentimen negatif meningkat ` +
                `${absoluteChange} poin persentase ` +
                `dibanding ${previousMonth}.`;

            sentimentIcon = "↗";
            sentimentClass = "negative";

        } else if (change < 0) {
            sentimentText =
                `Sentimen negatif menurun ` +
                `${absoluteChange} poin persentase ` +
                `dibanding ${previousMonth}.`;

            sentimentIcon = "↘";
            sentimentClass = "positive";

        } else {
            sentimentText =
                `Proporsi sentimen negatif tetap ` +
                `dibanding ${previousMonth}.`;
        }
    }


    // =================================================
    // TOPIK DOMINAN
    // =================================================

    const topicCounts = TOPICS.map(topic => ({
        topic,
        count: countBy(data, "topic", topic)
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

    const dominantTopic = topicCounts[0];

    const topicText = dominantTopic

        ? `${dominantTopic.topic} menjadi topik ` +
          `terbanyak dengan ${dominantTopic.count} ` +
          `postingan (${percentage(
              dominantTopic.count,
              data.length
          ).toFixed(1)}%).`

        : "Belum ada topik dominan.";


    // =================================================
    // KATA KUNCI MENONJOL
    // =================================================

    const topKeywords =
        getKeywordCounts(data).slice(0, 3);

    const keywordText = topKeywords.length

        ? topKeywords.map(
            ([word, count]) =>
                `${word} (${count})`
        ).join(", ") + "."

        : "Belum ada kata kunci yang tersedia.";


    // =================================================
    // JAM PENGIRIMAN TERSIBUK
    // =================================================

    const hourCounts = Array(24).fill(0);

    data.forEach(row => {
        if (
            Number.isInteger(row.hour) &&
            row.hour >= 0 &&
            row.hour <= 23
        ) {
            hourCounts[row.hour]++;
        }
    });

    const peakCount =
        Math.max(...hourCounts);

    const peakHour =
        hourCounts.indexOf(peakCount);

    const formattedHour =
        String(peakHour).padStart(2, "0");

    const rushText = peakCount > 0

        ? `Aktivitas tertinggi terjadi pukul ` +
          `${formattedHour}:00–${formattedHour}:59 ` +
          `dengan ${peakCount} postingan.`

        : "Informasi jam pengiriman belum tersedia.";


    // =================================================
    // RENDER RINGKASAN ANALISIS
    // =================================================

    const insights = [
        {
            icon: sentimentIcon,
            label: "Perubahan Sentimen",
            text: sentimentText,
            className: sentimentClass
        },

        {
            icon: "▥",
            label: "Topik Dominan",
            text: topicText,
            className: "blue"
        },

        {
            icon: "#",
            label: "Kata Kunci Menonjol",
            text: keywordText,
            className: "yellow"
        },

        {
            icon: "◷",
            label: "Jam Tersibuk",
            text: rushText,
            className: "blue"
        }
    ];

    container.innerHTML = insights.map(item => `

        <div class="insight-row">

            <div class="insight-icon ${item.className}">
                ${item.icon}
            </div>

            <div class="insight-content">

                <strong>
                    ${escapeHTML(item.label)}
                </strong>

                <p>
                    ${escapeHTML(item.text)}
                </p>

            </div>

        </div>

    `).join("");
}


// =====================================================
// 23. TOTAL POSTINGAN DI TENGAH DONUT
// =====================================================

function updateDonutTotal(data) {
    const totalElement =
        document.getElementById("donutTotal");

    if (totalElement) {
        totalElement.textContent =
            formatNumber(data.length);
    }
}


// =====================================================
// 24. UTILITAS DETAIL POSTINGAN
// =====================================================

function formatPostDate(row) {
    if (Number.isFinite(row.date)) {
        return new Date(row.date)
            .toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "UTC"
            });
    }

    return row.month || "—";
}

function formatPostHour(hour) {
    if (
        !Number.isInteger(hour) ||
        hour < 0 ||
        hour > 23
    ) {
        return "—";
    }

    return `${String(hour).padStart(2, "0")}:00`;
}

function capitalize(value) {
    const text = String(value ?? "");

    return text.charAt(0).toUpperCase() +
        text.slice(1);
}


// Samarkan informasi kontak pada postingan

function anonymizePost(text) {
    return String(text ?? "")

        .replace(
            /[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,
            "[email disamarkan]"
        )

        .replace(
            /@[\w]+/g,
            "[akun disamarkan]"
        )

        .replace(
            /(?:\+62|08)\d[\d\s-]{7,14}\d/g,
            "[nomor disamarkan]"
        )

        .replace(
            /https?:\/\/[^\s]+/gi,
            "[tautan disamarkan]"
        );
}


// =====================================================
// 25. MODAL DETAIL POSTINGAN
// =====================================================

const DETAIL_PAGE_SIZE = 15;

let detailData = [];
let detailVisibleCount = DETAIL_PAGE_SIZE;

function openDetails(title, data) {
    const dialog =
        document.getElementById("detailDialog");

    if (!dialog) return;

    detailData = [...data].sort((a, b) => {
        const dateA = Number.isFinite(a.date)
            ? a.date
            : 0;

        const dateB = Number.isFinite(b.date)
            ? b.date
            : 0;

        return dateB - dateA;
    });

    detailVisibleCount = DETAIL_PAGE_SIZE;

    document.getElementById("detailTitle")
        .textContent = title;

    renderDetails();

    if (typeof dialog.showModal === "function") {
        if (!dialog.open) {
            dialog.showModal();
        }

    } else {
        dialog.setAttribute("open", "");
    }
}

function renderDetails() {
    const container =
        document.getElementById("detailRows");

    const countElement =
        document.getElementById("detailCount");

    const moreButton =
        document.getElementById("moreDetail");

    if (!container) return;

    const visibleData =
        detailData.slice(0, detailVisibleCount);

    if (countElement) {
        countElement.textContent =
            `${formatNumber(detailData.length)} ` +
            `postingan ditemukan`;
    }

    if (!visibleData.length) {
        container.innerHTML = `
            <div class="empty-state">
                Tidak ada postingan terkait.
            </div>
        `;

        if (moreButton) {
            moreButton.hidden = true;
        }

        return;
    }

    container.innerHTML = visibleData.map(row => `

        <div class="detail-row">

            <div class="detail-meta">

                <span class="detail-date">

                    ${escapeHTML(formatPostDate(row))}

                    ·

                    ${escapeHTML(formatPostHour(row.hour))}

                </span>

                <span class="sentiment-pill
                    ${escapeHTML(row.sentiment)}">

                    ${escapeHTML(
                        capitalize(row.sentiment)
                    )}

                </span>

            </div>

            <p class="detail-text">

                ${escapeHTML(
                    anonymizePost(row.text)
                )}

            </p>

            <div class="detail-topic">

                ${escapeHTML(row.topic)}

            </div>

        </div>

    `).join("");

    if (moreButton) {
        moreButton.hidden =
            detailVisibleCount >= detailData.length;

        moreButton.textContent =
            "Tampilkan Lebih Banyak";
    }
}


// =====================================================
// 26. EVENT MODAL DETAIL
// =====================================================

function initializeDetailDialog() {
    const dialog =
        document.getElementById("detailDialog");

    const closeButton =
        document.getElementById("closeDetail");

    const moreButton =
        document.getElementById("moreDetail");

    if (!dialog) return;

    closeButton?.addEventListener("click", () => {
        if (typeof dialog.close === "function") {
            dialog.close();

        } else {
            dialog.removeAttribute("open");
        }
    });

    moreButton?.addEventListener("click", () => {
        detailVisibleCount += DETAIL_PAGE_SIZE;

        renderDetails();
    });

    // Tutup modal ketika klik area luar

    dialog.addEventListener("click", event => {
        if (event.target === dialog) {
            if (typeof dialog.close === "function") {
                dialog.close();

            } else {
                dialog.removeAttribute("open");
            }
        }
    });
}


// =====================================================
// 27. UTILITAS INTERAKTIVITAS GRAFIK
// =====================================================

function bindChartInteraction(chart, callback) {
    if (!chart) return;

    chart.options.onClick = (event, elements) => {
        if (!elements.length) return;

        callback(elements[0], chart);
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


// Interaktivitas elemen HTML melalui mouse
// dan keyboard

function makeClickable(element, callback) {
    if (!element) return;

    element.style.cursor = "pointer";

    element.tabIndex = 0;

    element.setAttribute("role", "button");

    element.onclick = callback;

    element.onkeydown = event => {
        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();

            callback();
        }
    };
}


// =====================================================
// 28. INTERAKTIVITAS TREN SENTIMEN
// =====================================================

function enableTrendInteraction() {
    const chart = charts.trend;

    if (!chart) return;

    bindChartInteraction(
        chart,
        (element, selectedChart) => {

            const month =
                selectedChart.data.labels[
                    element.index
                ];

            const sentiment =
                selectedChart.data.datasets[
                    element.datasetIndex
                ].label.toLowerCase();

            const data =
                getScopedData(true).filter(row =>
                    row.month === month &&
                    row.sentiment === sentiment
                );

            openDetails(
                `Sentimen ${capitalize(sentiment)} ` +
                `— ${month}`,
                data
            );
        }
    );
}


// Pertahankan interaktivitas ketika filter
// grafik tren berubah.

const originalTrendUpdate =
    updateTrendChart;

updateTrendChart = function () {
    originalTrendUpdate();

    enableTrendInteraction();
};


// =====================================================
// 29. INTERAKTIVITAS DASHBOARD
// =====================================================

function enableDashboardInteraction(data) {

    // =================================================
    // DONUT SENTIMEN
    // =================================================

    bindChartInteraction(
        charts.sentiment,
        element => {

            const sentiment =
                SENTIMENTS[element.index];

            const relatedPosts = data.filter(row =>
                row.sentiment === sentiment
            );

            openDetails(
                `Postingan Sentimen ` +
                capitalize(sentiment),
                relatedPosts
            );
        }
    );


    // =================================================
    // LEGEND SENTIMEN
    // =================================================

    document.querySelectorAll(
        "#sentimentLegend .legend-item"
    ).forEach((element, index) => {

        const sentiment = SENTIMENTS[index];

        makeClickable(element, () => {

            const relatedPosts = data.filter(row =>
                row.sentiment === sentiment
            );

            openDetails(
                `Postingan Sentimen ` +
                capitalize(sentiment),
                relatedPosts
            );
        });
    });


    // =================================================
    // DISTRIBUSI KATEGORI
    // =================================================

    bindChartInteraction(
        charts.category,
        element => {

            const topic =
                TOPICS[element.index];

            const relatedPosts = data.filter(row =>
                row.topic === topic
            );

            openDetails(
                topic,
                relatedPosts
            );
        }
    );


    // =================================================
    // JAM SIBUK
    // =================================================

    bindChartInteraction(
        charts.rush,
        element => {

            const hour = element.index;

            const formattedHour =
                String(hour).padStart(2, "0");

            const relatedPosts = data.filter(row =>
                row.hour === hour
            );

            openDetails(
                `Postingan Pukul ` +
                `${formattedHour}:00–${formattedHour}:59`,
                relatedPosts
            );
        }
    );


    // =================================================
    // PRIORITAS EVALUASI
    // =================================================

    document.querySelectorAll(
        "#priorityList .priority-item"
    ).forEach(element => {

        const topic =
            element.dataset.topic ||
            element.querySelector(
                ".priority-name"
            )?.textContent.trim();

        makeClickable(element, () => {

            const relatedPosts = data.filter(row =>
                row.topic === topic &&
                row.sentiment === "negatif"
            );

            openDetails(
                `Prioritas Evaluasi — ${topic}`,
                relatedPosts
            );
        });
    });
}


// =====================================================
// 30. FUNGSI UTAMA UPDATE DASHBOARD
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

    updateInsightSummary(data);

    updateDonutTotal(data);

    enableDashboardInteraction(data);
}


// =====================================================
// 31. PENYESUAIAN BAHASA DASHBOARD
// =====================================================

function applyDashboardLanguage() {
    const dashboardButton =
        document.querySelector(
            '[data-page="dashboard"] span:last-child'
        );

    const uploadButton =
        document.querySelector(
            '[data-page="upload"] span:last-child'
        );

    if (dashboardButton) {
        dashboardButton.textContent = "Dasbor";
    }

    if (uploadButton) {
        uploadButton.textContent = "Unggah Data";
    }

    const heading =
        document.getElementById("pageHeading");

    const subheading =
        document.getElementById("pageSubheading");

    if (heading) {
        heading.textContent =
            "Ringkasan Dasbor";
    }

    if (subheading) {
        subheading.textContent =
            "Pantau sentimen dan aktivitas Menfess PENS.";
    }

    const brand =
        document.querySelector(".brand-text small");

    if (brand) {
        brand.textContent =
            "Analisis Sentimen";
    }
}


// =====================================================
// 32. PENYESUAIAN POSISI KOMPONEN DASHBOARD
// =====================================================

function improveDashboardLayout() {
    const filter =
        document.querySelector(".filter-card");

    const kpi =
        document.querySelector(".kpi-grid");

    // Filter berada di atas KPI.

    if (
        filter &&
        kpi &&
        kpi.parentNode
    ) {
        kpi.parentNode.insertBefore(
            filter,
            kpi
        );
    }

    // Ringkasan Analisis berada di bawah
    // Prioritas Evaluasi.

    const insightCard =
        document.getElementById("insightTitle")
            ?.closest(".widget-card");

    const priorityCard =
        document.getElementById("priorityList")
            ?.closest(".widget-card");

    if (insightCard && priorityCard) {
        const oldParent =
            insightCard.parentElement;

        priorityCard.after(insightCard);

        insightCard.classList.add(
            "compact-summary"
        );

        insightCard.style.marginTop = "0";

        insightCard.style.width = "100%";

        if (
            oldParent?.classList.contains(
                "analysis-grid"
            ) &&
            oldParent.children.length === 0
        ) {
            oldParent.remove();
        }
    }
}


// =====================================================
// 33. INISIALISASI KOMPONEN DASHBOARD
// =====================================================

function initializeDashboard() {
    currentData = createDemoData();

    applyDashboardLanguage();

    improveDashboardLayout();

    initializeDetailDialog();

    updateDashboard();

    console.log(
        "Menfess PENS Dashboard berhasil dimuat."
    );
}


// =====================================================
// 34. KONFIGURASI HALAMAN ANALISIS
// =====================================================

const el = id => document.getElementById(id);

const PAGE_SIZE = 10;

let explorerPage = 0;
let newestFirst = true;

const pageInformation = {
    dashboard: {
        title: "Ringkasan Dasbor",
        description:
            "Pantau sentimen dan aktivitas Menfess PENS."
    },

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
    },

    upload: {
        title: "Unggah Dataset",
        description:
            "Kelola dataset utama dan analisis dataset secara mandiri."
    }
};

function formatDecimal(value) {
    return Number(value).toLocaleString("id-ID", {
        maximumFractionDigits: 1
    });
}

function signedPoints(value) {
    return `${value > 0 ? "+" : ""}${formatDecimal(value)} poin`;
}

function destroyChart(name) {
    if (charts[name]) {
        charts[name].destroy();
        delete charts[name];
    }
}


// =====================================================
// 35. NAVIGASI SIDEBAR
// =====================================================

function createAnalyticsNavigation() {
    const navigation =
        document.querySelector(".navigation");

    if (!navigation) return;

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
        ) return;

        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "nav-item";
        button.dataset.page = menu.page;

        button.innerHTML = `
            <span class="nav-icon">
                ${menu.icon}
            </span>

            <span>
                ${menu.label}
            </span>
        `;

        navigation.insertBefore(
            button,
            uploadButton
        );
    });
}

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

    const info = pageInformation[target];

    if (info) {
        el("pageHeading").textContent =
            info.title;

        el("pageSubheading").textContent =
            info.description;
    }

    populatePageFilters();

    switch (target) {
        case "dashboard":
            updateDashboard();
            break;

        case "issues":
            renderIssuePage();
            break;

        case "explorer":
            explorerPage = 0;
            renderExplorer();

            if (
                typeof window.refreshTopIssues ===
                "function"
            ) {
                window.refreshTopIssues();
            }

            break;

        case "comparison":
            renderComparison();
            break;
    }

    requestAnimationFrame(() => {
        Object.values(charts).forEach(chart => {
            chart?.resize();
        });
    });
}

function registerAnalyticsNavigation() {
    document.querySelectorAll(".nav-item")
        .forEach(button => {

            // Hilangkan listener navigasi versi lama.
            const newButton =
                button.cloneNode(true);

            button.replaceWith(newButton);

            newButton.addEventListener(
                "click",
                () => {
                    openAnalyticsPage(
                        newButton.dataset.page
                    );
                }
            );
        });
}


// =====================================================
// 36. TEMPLATE FILTER HALAMAN
// =====================================================

function createFilters(prefix) {
    return `
        <div class="analytics-filters">

            <div class="form-field">

                <label for="${prefix}Month">
                    Periode
                </label>

                <select id="${prefix}Month">
                </select>

            </div>

            <div class="form-field">

                <label for="${prefix}Topic">
                    Topik
                </label>

                <select id="${prefix}Topic">
                </select>

            </div>

            <div class="form-field">

                <label for="${prefix}Sentiment">
                    Sentimen
                </label>

                <select id="${prefix}Sentiment">
                </select>

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

function addOptions(id, values, allLabel = null) {
    const select = el(id);

    if (!select) return;

    const previousValue = select.value;

    select.replaceChildren();

    if (allLabel) {
        select.add(
            new Option(allLabel, "all")
        );
    }

    values.forEach(value => {
        select.add(
            new Option(capitalize(value), value)
        );
    });

    const available = [...select.options].some(
        option => option.value === previousValue
    );

    if (available) {
        select.value = previousValue;
    }
}

function getMonthOptions() {
    return MONTHS.filter(month =>
        currentData.some(row =>
            row.month === month
        )
    );
}

function populatePageFilters() {
    const months = getMonthOptions();

    ["issue", "explore"].forEach(prefix => {
        addOptions(
            prefix + "Month",
            months,
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

    addOptions("comparePeriodA", months);
    addOptions("comparePeriodB", months);
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

function getPageData(prefix, ignoreMonth = false) {
    const month =
        el(prefix + "Month").value;

    const topic =
        el(prefix + "Topic").value;

    const sentiment =
        el(prefix + "Sentiment").value;

    const keyword =
        el(prefix + "Keyword")
            .value.trim().toLowerCase();

    return currentData.filter(row =>

        (
            ignoreMonth ||
            month === "all" ||
            row.month === month
        ) &&

        (
            topic === "all" ||
            row.topic === topic
        ) &&

        (
            sentiment === "all" ||
            row.sentiment === sentiment
        ) &&

        (
            !keyword ||
            row.text.toLowerCase().includes(keyword)
        )

    );
}


// =====================================================
// 37. UTILITAS MEMBUAT HALAMAN
// =====================================================

function createPage(id, className, content) {
    const main =
        document.querySelector(".main-content");

    if (!main || el(id)) return;

    const page =
        document.createElement("section");

    page.id = id;

    page.className =
        `page analytics-page ${className}`;

    page.innerHTML = content;

    const footer =
        main.querySelector(".footer");

    if (footer?.parentElement === main) {
        main.insertBefore(page, footer);

    } else {
        main.appendChild(page);
    }

    return page;
}

function createAnalyticsHeader(
    icon,
    title,
    description
) {
    return `
        <div class="analytics-header">

            <div class="analytics-header-icon">
                ${icon}
            </div>

            <div>

                <h2>${title}</h2>

                <p>${description}</p>

            </div>

        </div>
    `;
}


// =====================================================
// 38. HALAMAN LONJAKAN ISU
// =====================================================

function createIssuePage() {
    createPage(
        "issues",
        "issue-page",
        `
        <section class="widget-card">

            ${createAnalyticsHeader(
                "↗",
                "Lonjakan Isu",
                "Identifikasi kata kunci dengan peningkatan pembahasan dalam periode mingguan."
            )}

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

                        <canvas id="issueChartV2">
                        </canvas>

                    </div>

                </div>

            </div>

            <div class="issue-method">

                <strong>
                    Metode Deteksi Lonjakan
                </strong>

                <p>
                    Jumlah postingan selama tujuh hari
                    terkini dibandingkan dengan rata-rata
                    empat minggu sebelumnya.
                </p>

                <p>
                    Lonjakan ditampilkan apabila jumlah
                    postingan meningkat minimal 1,5 kali
                    dengan sedikitnya tiga postingan
                    pada minggu terkini.
                </p>

                <p>
                    Pilih kata kunci untuk melihat tren.
                    Klik titik grafik untuk melihat
                    postingan terkait.
                </p>

            </div>

        </section>
        `
    );

    // Hapus card Lonjakan Isu versi dashboard lama.
    // Sekarang fitur ini memiliki halaman sendiri.

    const oldSpike =
        el("spikeList")?.closest(".widget-card");

    if (oldSpike) {
        const parent = oldSpike.parentElement;

        oldSpike.remove();

        if (
            parent?.classList.contains("analysis-grid") &&
            !parent.children.length
        ) {
            parent.remove();
        }
    }
}


// =====================================================
// 39. EKSTRAKSI KATA KUNCI LONJAKAN ISU
// =====================================================

const SPIKE_STOPWORDS = new Set([

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
    const words = tokenizeText(text);

    return [...new Set(
        words.filter(word =>
            word.length >= 3 &&
            !SPIKE_STOPWORDS.has(word) &&
            !/^\d+$/.test(word)
        )
    )];
}


// =====================================================
// 40. ANALISIS LONJAKAN ISU
// =====================================================

function renderIssuePage() {
    const list = el("issueListV2");

    const note = el("issueNoteV2");

    const title = el("issueChartTitleV2");

    if (!list || !note || !title) return;

    list.replaceChildren();

    destroyChart("issueV2");

    title.textContent =
        "Tren Pembahasan Mingguan";

    const month = el("issueMonth").value;

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
        (max, row) => Math.max(max, row.date),
        -Infinity
    );

    const startDate = endDate - 34 * DAY;

    const earliestDate = allDated.reduce(
        (min, row) => Math.min(min, row.date),
        Infinity
    );

    if (earliestDate > startDate) {
        note.textContent =
            "Diperlukan riwayat minimal 35 hari " +
            "untuk menghitung lonjakan mingguan.";

        return;
    }

    const scoped = getPageData("issue", true);

    const windowData = scoped.filter(row =>
        Number.isFinite(row.date) &&
        row.date >= startDate &&
        row.date <= endDate
    );

    const keywordMap = new Map();

    windowData.forEach(row => {
        const weekIndex =
            4 - Math.floor(
                (endDate - row.date) / (7 * DAY)
            );

        if (
            weekIndex < 0 ||
            weekIndex > 4
        ) return;

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
            item.latest >= MIN_SPIKE_POSTS &&

            (
                item.baseline === 0 ||
                item.ratio >= SPIKE_THRESHOLD
            )
        )

        .sort((a, b) =>
            b.increase - a.increase
        )

        .slice(0, 8);

    const periodEnd =
        new Date(endDate).toLocaleDateString(
            "id-ID",
            {
                timeZone: "UTC"
            }
        );

    const undatedCount = scoped.filter(
        row => !Number.isFinite(row.date)
    ).length;

    note.textContent =
        `Periode tujuh hari hingga ${periodEnd}. ` +
        `Dibandingkan rata-rata empat minggu sebelumnya. ` +
        `${undatedCount} postingan tanpa tanggal dikecualikan.`;

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

        button.addEventListener("click", () => {
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
        });

        list.appendChild(button);

        if (index === 0) {
            button.click();
        }
    });
}


// =====================================================
// 41. GRAFIK LONJAKAN ISU
// =====================================================

function renderIssueChart(
    item,
    windowData,
    endDate
) {
    destroyChart("issueV2");

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
                }
            }
        }
    );

    bindChartInteraction(
        charts.issueV2,

        element => {
            const weekEnd =
                endDate -
                (4 - element.index) * 7 * DAY;

            const weekStart =
                weekEnd - 6 * DAY;

            const related = windowData.filter(row =>
                row.date >= weekStart &&

                row.date <= weekEnd &&

                getPostWords(row.text)
                    .includes(item.word)
            );

            openDetails(
                `Pembahasan ${item.word}`,
                related
            );
        }
    );
}


// =====================================================
// 42. HALAMAN EKSPLORASI POSTINGAN
// =====================================================

function createExplorerPage() {
    createPage(
        "explorer",
        "explorer-page",
        `
        <section class="widget-card">

            ${createAnalyticsHeader(
                "▤",
                "Eksplorasi Postingan",
                "Lihat postingan berdasarkan periode, topik, sentimen, dan kata kunci tertentu."
            )}

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
                                    type="button"
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

                    <tbody id="explorerRowsV2">
                    </tbody>

                </table>

            </div>

            <div class="explorer-pagination">

                <button
                    type="button"
                    id="previousPostsV2"
                >

                    ← Sebelumnya

                </button>

                <span id="explorerPageV2">

                    Halaman 1

                </span>

                <button
                    type="button"
                    id="nextPostsV2"
                >

                    Berikutnya →

                </button>

            </div>

            <p class="compare-disclaimer">

                Informasi kontak dan nama akun
                disamarkan secara otomatis.
                Nama pribadi dalam postingan
                tetap memerlukan pemeriksaan manual.
                Confidence hanya ditampilkan jika
                tersedia dalam dataset.

            </p>

        </section>
        `
    );
}


// =====================================================
// 43. RENDER EKSPLORASI POSTINGAN
// =====================================================

function renderExplorer() {
    if (!el("explorerRowsV2")) return;

    const data = getPageData("explore");

    const sorted = [...data].sort((a, b) => {
        const validDateA =
            Number.isFinite(a.date);

        const validDateB =
            Number.isFinite(b.date);

        if (validDateA !== validDateB) {
            return validDateA ? -1 : 1;
        }

        const dateA = validDateA
            ? a.date
            : MONTHS.indexOf(a.month) * 32 * DAY;

        const dateB = validDateB
            ? b.date
            : MONTHS.indexOf(b.month) * 32 * DAY;

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

        Math.min(
            explorerPage,
            totalPages - 1
        )
    );

    const start = explorerPage * PAGE_SIZE;

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

    const body = el("explorerRowsV2");

    body.replaceChildren();

    const sentimentIcons = {
        positif: "☺",
        negatif: "☹",
        netral: "—"
    };

    visibleRows.forEach(row => {
        const tr =
            document.createElement("tr");

        tr.innerHTML = `
            <td>

                ${escapeHTML(formatPostDate(row))}

            </td>

            <td>

                <span class="post-preview">

                    ${escapeHTML(
                        anonymizePost(row.text)
                    )}

                </span>

            </td>

            <td>

                <span class="sentiment-pill
                    ${escapeHTML(row.sentiment)}">

                    ${sentimentIcons[row.sentiment] || ""}

                    ${escapeHTML(
                        capitalize(row.sentiment)
                    )}

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

        makeClickable(tr, () => {
            openDetails(
                "Detail Postingan",
                [row]
            );
        });

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


// =====================================================
// 44. HALAMAN PERBANDINGAN PERIODE
// =====================================================

function createComparisonPage() {
    createPage(
        "comparison",
        "comparison-page",
        `
        <section class="widget-card">

            ${createAnalyticsHeader(
                "▥",
                "Perbandingan Periode",
                "Bandingkan distribusi sentimen dan topik pada dua periode untuk melihat perubahan percakapan Menfess."
            )}

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
        `
    );
}


// =====================================================
// 45. UTILITAS PERBANDINGAN PERIODE
// =====================================================

function getDataShare(data, key, value) {
    return percentage(
        countBy(data, key, value),
        data.length
    );
}

function compareCard(
    label,
    value,
    change,
    color
) {
    return `
        <div class="compare-stat">

            <small>

                ${escapeHTML(label)}

            </small>

            <strong>

                ${escapeHTML(value)}

            </strong>

            <span class="compare-change ${color}">

                ${escapeHTML(change)}

            </span>

        </div>
    `;
}


// =====================================================
// 46. ANALISIS PERBANDINGAN PERIODE
// =====================================================

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

    const stats = el("compareStatsV2");

    const insight = el("compareInsightV2");

    destroyChart("comparisonV2");

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

    const valuesA = SENTIMENTS.map(sentiment =>
        getDataShare(
            dataA,
            "sentiment",
            sentiment
        )
    );

    const valuesB = SENTIMENTS.map(sentiment =>
        getDataShare(
            dataB,
            "sentiment",
            sentiment
        )
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
        const proportionA = getDataShare(
            dataA,
            "topic",
            topic
        );

        const proportionB = getDataShare(
            dataB,
            "topic",
            topic
        );

        return {
            topic,
            proportionA,
            proportionB,
            change: proportionB - proportionA
        };

    }).sort((a, b) =>
        b.change - a.change
    );

    const mostIncreasing =
        topicChanges.find(
            row => row.change > 0
        );

    const mostDecreasing =
        [...topicChanges].reverse().find(
            row => row.change < 0
        );

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
        <strong>

            Ringkasan Perbandingan

        </strong>

        <p style="margin-top:7px">

            Pada periode ${escapeHTML(periodB)},
            proporsi sentimen negatif

            <strong>

                ${direction}

                ${formatDecimal(
                    Math.abs(negativeChange)
                )}

                poin persentase

            </strong>

            dibandingkan periode
            ${escapeHTML(periodA)}.

        </p>

        ${
            mostIncreasing
                ? `
                    <p style="margin-top:7px">

                        Topik dengan kenaikan
                        proporsi terbesar adalah

                        <strong>

                            ${escapeHTML(
                                mostIncreasing.topic
                            )}

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


// =====================================================
// 47. GRAFIK PERBANDINGAN SENTIMEN
// =====================================================

const comparisonPercentageLabels = {
    id: "comparisonPercentageLabels",

    afterDatasetsDraw(chart) {
        const ctx = chart.ctx;

        ctx.save();

        ctx.font = "600 11px Poppins";

        ctx.fillStyle = "#153e63";

        ctx.textAlign = "center";

        ctx.textBaseline = "bottom";

        chart.data.datasets.forEach(
            (dataset, datasetIndex) => {

                if (
                    !chart.isDatasetVisible(datasetIndex)
                ) return;

                const meta =
                    chart.getDatasetMeta(datasetIndex);

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

function renderComparisonChart(
    periodA,
    periodB,
    dataA,
    dataB,
    valuesA,
    valuesB
) {
    destroyChart("comparisonV2");

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
                comparisonPercentageLabels
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

                        suggestedMax: Math.min(
                            100,

                            Math.max(
                                ...valuesA,
                                ...valuesB
                            ) + 10
                        ),

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
                }
            }
        }
    );

    bindChartInteraction(
        charts.comparisonV2,

        element => {
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

            const relatedPosts = data.filter(
                row => row.sentiment === sentiment
            );

            openDetails(
                `${period} — Sentimen ${sentiment}`,
                relatedPosts
            );
        }
    );
}


// =====================================================
// 48. EVENT LISTENER HALAMAN ANALISIS
// =====================================================

function registerAnalyticsFilters() {
    const suffixes = [
        "Month",
        "Topic",
        "Sentiment",
        "Keyword"
    ];

    suffixes.forEach(suffix => {
        const eventName =
            suffix === "Keyword"
                ? "input"
                : "change";

        el("issue" + suffix)
            .addEventListener(
                eventName,
                renderIssuePage
            );

        el("explore" + suffix)
            .addEventListener(
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

    el("sortPostsV2")
        .addEventListener("click", () => {
            newestFirst = !newestFirst;

            explorerPage = 0;

            renderExplorer();
        });

    el("previousPostsV2")
        .addEventListener("click", () => {
            explorerPage--;

            renderExplorer();
        });

    el("nextPostsV2")
        .addEventListener("click", () => {
            explorerPage++;

            renderExplorer();
        });
}


// =====================================================
// 49. SINKRONISASI DATASET AKTIF
// =====================================================

function refreshAnalyticsPages(
    resetComparison = false
) {
    populatePageFilters();

    if (resetComparison) {
        explorerPage = 0;

        setDefaultComparison();
    }

    if (
        el("issues")?.classList.contains("active")
    ) {
        renderIssuePage();
    }

    if (
        el("explorer")?.classList.contains("active")
    ) {
        renderExplorer();
    }

    if (
        el("comparison")?.classList.contains("active")
    ) {
        renderComparison();
    }

    if (
        typeof window.refreshTopIssues ===
        "function"
    ) {
        window.refreshTopIssues();
    }
}

function syncActiveDataset() {
    resetAllFilters();

    ["issue", "explore"].forEach(prefix => {
        ["Month", "Topic", "Sentiment"]
            .forEach(suffix => {
                const filter = el(prefix + suffix);

                if (filter) {
                    filter.value = "all";
                }
            });

        const keyword = el(prefix + "Keyword");

        if (keyword) {
            keyword.value = "";
        }
    });

    updateDashboard();

    refreshAnalyticsPages(true);
}


// =====================================================
// 50. INISIALISASI HALAMAN ANALISIS
// =====================================================

function initializeAnalyticsPages() {
    createAnalyticsNavigation();

    createIssuePage();

    createExplorerPage();

    createComparisonPage();

    populatePageFilters();

    setDefaultComparison();

    registerAnalyticsFilters();

    registerAnalyticsNavigation();

    console.log(
        "Halaman analisis Menfess PENS berhasil dimuat."
    );
}


// =====================================================
// 51. KONFIGURASI MODE DATASET
// =====================================================

const MAIN_DATASET_START = "2026-11-01";

let uploadMode = "main";
let activeDatasetMode = "main";

let mainDataset = [];
let customDataset = null;
let uploadHistory = [];

const uploadModeConfig = {
    main: {
        title: "Perbarui Dataset Utama",

        ruleTitle: "Ketentuan Penambahan Data",

        ruleText:
            "Dataset hanya boleh berisi postingan mulai " +
            "1 November 2026. Data baru akan ditambahkan " +
            "tanpa menghapus dataset utama sebelumnya.",

        buttonText: "Tambahkan Data",

        note:
            "Mode penambahan permanen. Validasi tanggal, " +
            "pemeriksaan duplikat, dan penyimpanan " +
            "akan ditangani oleh backend.",

        templateName: "Template_Dataset_Utama.xlsx"
    },

    custom: {
        title: "Analisis Dataset Mandiri",

        ruleTitle: "Ketentuan Dataset Mandiri",

        ruleText:
            "Dataset dapat menggunakan periode dan tahun " +
            "bebas, dengan minimal dua bulan kalender " +
            "berbeda. Dataset utama tidak akan berubah.",

        buttonText: "Mulai Analisis",

        note:
            "Mode analisis sementara. Seluruh fitur " +
            "dashboard mengikuti dataset aktif dan dapat " +
            "dikembalikan ke dataset utama.",

        templateName: "Template_Dataset_Mandiri.xlsx"
    }
};


// =====================================================
// 52. TEMPLATE TAB UNGGAH
// =====================================================

function createUploadTabs() {
    return `
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
    `;
}


// =====================================================
// 53. TEMPLATE INFORMASI DATASET
// =====================================================

function createDatasetMeta(
    label,
    id,
    defaultValue = "—"
) {
    return `
        <div class="dataset-meta-item">

            <small>${label}</small>

            <strong id="${id}">
                ${defaultValue}
            </strong>

        </div>
    `;
}

function createMainDatasetInfo() {
    return `
        <div id="mainDatasetInfo">

            <div class="dataset-meta-grid">

                ${createDatasetMeta(
                    "Total data saat ini",
                    "mainDatasetTotal"
                )}

                ${createDatasetMeta(
                    "Periode awal",
                    "mainDatasetStart"
                )}

                ${createDatasetMeta(
                    "Periode terakhir",
                    "mainDatasetEnd"
                )}

            </div>

        </div>
    `;
}

function createCustomDatasetInfo() {
    return `
        <div id="customDatasetInfo" hidden>

            <div class="dataset-custom-info">

                <div class="dataset-tab-icon">
                    ▥
                </div>

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
    `;
}


// =====================================================
// 54. TEMPLATE RIWAYAT UNGGAH
// =====================================================

function createUploadHistory() {
    return `
        <section
            class="widget-card dataset-history-card"
            id="mainUploadHistory"
        >

            <div class="dataset-history-heading">

                <h3>
                    Riwayat Unggah Dataset
                </h3>

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
                    </tbody>

                </table>

            </div>

        </section>
    `;
}


// =====================================================
// 55. TEMPLATE STATUS DATASET MANDIRI
// =====================================================

function createCustomDatasetStatus() {
    return `
        <section
            class="widget-card dataset-history-card"
            id="customUploadStatus"
            hidden
        >

            <div class="dataset-history-heading">

                <h3>
                    Informasi Dataset Mandiri
                </h3>

                <p>
                    Status dataset yang sedang dianalisis.
                </p>

            </div>

            <div id="customDatasetContent">
            </div>

            <div
                class="dataset-upload-actions"
                id="customDatasetActions"
            >

                <button
                    type="button"
                    class="outline-button"
                    id="returnMainDataset"
                    disabled
                >

                    ← Kembali ke Dataset Utama

                </button>

                <button
                    type="button"
                    class="primary-button"
                    id="viewCustomDashboard"
                    disabled
                    hidden
                >

                    Lihat Dashboard →

                </button>

            </div>

        </section>
    `;
}


// =====================================================
// 56. PANDUAN FORMAT DATASET
// =====================================================

function createDatasetFormat() {
    const columns = [
        {
            name: "text",

            description:
                "Isi postingan Menfess"
        },

        {
            name: "created_at",

            description:
                "Tanggal dan jam postingan"
        },

        {
            name: "sentiment",

            description:
                "Positif, negatif, atau netral"
        },

        {
            name: "topic",

            description:
                "Kategori pembahasan"
        },

        {
            name: "confidence",

            description:
                "Skor prediksi (opsional)"
        },

        {
            name: "tweet_id",

            description:
                "ID unik postingan (opsional)"
        }
    ];

    return `
        <details class="widget-card dataset-format-card">

            <summary>

                Panduan Format Dataset

            </summary>

            <div class="format-list">

                ${columns.map(column => `

                    <div>

                        <strong>
                            ${column.name}
                        </strong>

                        <span>
                            ${column.description}
                        </span>

                    </div>

                `).join("")}

            </div>

            <p class="dataset-format-note">

                Gunakan tanggal lengkap dengan format
                YYYY-MM-DD HH:mm:ss agar seluruh fitur
                analisis dapat digunakan.

                Dataset harus memiliki label sentimen
                dan topik sampai integrasi model tersedia.

            </p>

        </details>
    `;
}


// =====================================================
// 57. MEMBUAT HALAMAN UNGGAH DATA
// =====================================================

function createDatasetUploadPage() {
    const uploadPage = el("upload");

    if (!uploadPage) return;

    if (el("datasetModeTabs")) return;

    // Simpan komponen upload lama agar event listener
    // pemilihan file dan drag-and-drop tetap berjalan.

    const components = {
        dropzone: el("dropzone"),

        fileInput: el("fileInput"),

        selectedFile: el("selectedFile"),

        processButton: el("processFile"),

        message: el("uploadMessage"),

        templateButton: el("downloadTemplate")
    };

    const complete = Object.values(components)
        .every(component => component !== null);

    if (!complete) {
        console.warn(
            "Komponen halaman unggah belum lengkap."
        );

        return;
    }

    // Pastikan input file tetap tersedia jika
    // sebelumnya berada di luar dropzone.

    const inputInsideDropzone =
        components.dropzone.contains(
            components.fileInput
        );

    uploadPage.innerHTML = `

        <div class="dataset-upload-page">

            <section
                class="widget-card dataset-upload-panel"
            >

                ${createUploadTabs()}

                ${createMainDatasetInfo()}

                ${createCustomDatasetInfo()}


                <!-- KETENTUAN DATASET -->

                <div class="dataset-rule">

                    <span class="dataset-rule-icon">
                        ⓘ
                    </span>

                    <div>

                        <strong id="datasetRuleTitle">
                        </strong>

                        <p id="datasetRuleText">
                        </p>

                    </div>

                </div>


                <!-- AREA UNGGAH -->

                <div id="datasetDropzoneSlot">
                </div>

                <div id="datasetSelectedFileSlot">
                </div>


                <!-- TOMBOL ACTION -->

                <div class="dataset-upload-actions">

                    <div id="datasetTemplateSlot">
                    </div>

                    <div id="datasetProcessSlot">
                    </div>

                </div>


                <div id="datasetMessageSlot">
                </div>


                <p
                    class="dataset-ui-note"
                    id="datasetModeNote"
                ></p>

            </section>


            ${createUploadHistory()}


            ${createCustomDatasetStatus()}


            ${createDatasetFormat()}

        </div>

    `;


    // Pasang kembali komponen lama.

    el("datasetDropzoneSlot")
        .appendChild(components.dropzone);

    if (!inputInsideDropzone) {
        el("datasetDropzoneSlot")
            .appendChild(components.fileInput);
    }

    el("datasetSelectedFileSlot")
        .appendChild(components.selectedFile);

    el("datasetProcessSlot")
        .appendChild(components.processButton);

    el("datasetMessageSlot")
        .appendChild(components.message);

    el("datasetTemplateSlot")
        .appendChild(components.templateButton);


    // Penyesuaian teks dan tampilan.

    components.templateButton.className =
        "dataset-template-button";

    components.templateButton.textContent =
        "↓ Unduh Template Dataset";

    const dropzoneTitle =
        components.dropzone.querySelector("strong");

    if (dropzoneTitle) {
        dropzoneTitle.textContent =
            "Tarik dan letakkan dataset di sini";
    }

    const dropzoneIcon =
        components.dropzone.querySelector(".drop-icon");

    if (dropzoneIcon) {
        dropzoneIcon.textContent = "⇧";
    }

    const description =
        components.dropzone.querySelector(
            "span:not(.drop-icon)"
        );

    if (description) {
        description.textContent =
            "Mendukung format CSV, XLSX, dan XLS";
    }
}


// =====================================================
// 58. UTILITAS INFORMASI PERIODE DATASET
// =====================================================

function formatDatasetPeriod(date) {
    if (!Number.isFinite(date)) return "—";

    return new Date(date).toLocaleDateString(
        "id-ID",
        {
            month: "short",
            year: "numeric",
            timeZone: "UTC"
        }
    );
}

function getDatasetMetadata(data) {
    const dates = data

        .filter(row =>
            Number.isFinite(row.date)
        )

        .map(row => row.date);

    const start = dates.length

        ? dates.reduce(
            (min, date) => Math.min(min, date),
            Infinity
        )

        : null;

    const end = dates.length

        ? dates.reduce(
            (max, date) => Math.max(max, date),
            -Infinity
        )

        : null;

    const distinctMonths = new Set(
        dates.map(date => {
            const value = new Date(date);

            return (
                `${value.getUTCFullYear()}-` +
                `${value.getUTCMonth() + 1}`
            );
        })
    );

    return {
        total: data.length,

        start,

        end,

        startLabel: formatDatasetPeriod(start),

        endLabel: formatDatasetPeriod(end),

        monthCount: distinctMonths.size,

        undatedCount: data.length - dates.length
    };
}


// =====================================================
// 59. INFORMASI DATASET UTAMA
// =====================================================

function updateMainDatasetInfo() {
    if (!el("mainDatasetTotal")) return;

    const data = mainDataset.length

        ? mainDataset

        : currentData;

    const metadata =
        getDatasetMetadata(data);

    el("mainDatasetTotal").textContent =
        formatNumber(metadata.total);

    el("mainDatasetStart").textContent =
        metadata.startLabel;

    el("mainDatasetEnd").textContent =
        metadata.endLabel;
}


// =====================================================
// 60. RENDER RIWAYAT UNGGAH
// =====================================================

function renderUploadHistory() {
    const container =
        el("datasetHistoryRows");

    if (!container) return;

    if (!uploadHistory.length) {
        container.innerHTML = `
            <tr>

                <td colspan="5">

                    <div class="dataset-history-empty">

                        <span>▤</span>

                        Riwayat unggahan belum tersedia.

                    </div>

                </td>

            </tr>
        `;

        return;
    }

    container.innerHTML = [...uploadHistory]

        .reverse()

        .map(item => `

            <tr>

                <td>
                    ${escapeHTML(item.filename)}
                </td>

                <td>
                    ${escapeHTML(item.period)}
                </td>

                <td>
                    ${formatNumber(item.insertedRows)}
                </td>

                <td>
                    ${escapeHTML(item.uploadedAt)}
                </td>

                <td>

                    <span
                        class="sentiment-pill
                        ${item.status === "Berhasil"
                            ? "positif"
                            : "negatif"}"
                    >

                        ${escapeHTML(item.status)}

                    </span>

                </td>

            </tr>

        `).join("");
}


// =====================================================
// 61. RENDER INFORMASI DATASET MANDIRI
// =====================================================

function renderCustomDatasetStatus() {
    const container =
        el("customDatasetContent");

    const returnButton =
        el("returnMainDataset");

    const viewButton =
        el("viewCustomDashboard");

    if (!container) return;

    if (!customDataset) {
        container.innerHTML = `

            <div class="dataset-history-empty">

                <span>▥</span>

                Belum ada dataset mandiri yang aktif.

                <br>

                Unggah dataset untuk memulai analisis.

            </div>

        `;

        returnButton.disabled = true;

        viewButton.disabled = true;

        viewButton.hidden = true;

        return;
    }

    const metadata = getDatasetMetadata(
        customDataset.data
    );

    const validation =
        customDataset.validation || {};

    container.innerHTML = `

        <div class="dataset-custom-info">

            <div class="dataset-tab-icon">
                ▤
            </div>

            <div style="flex:1; min-width:0;">

                <strong style="overflow-wrap:anywhere;">

                    ${escapeHTML(customDataset.filename)}

                </strong>

                <p>

                    Diunggah
                    ${escapeHTML(customDataset.uploadedAt)}

                </p>

            </div>

            <span class="sentiment-pill
                ${activeDatasetMode === "custom"
                    ? "positif"
                    : "netral"}">

                ${activeDatasetMode === "custom"
                    ? "Aktif"
                    : "Tidak Aktif"}

            </span>

        </div>


        <div class="dataset-meta-grid">

            <div class="dataset-meta-item">

                <small>Total postingan</small>

                <strong>

                    ${formatNumber(metadata.total)}

                </strong>

            </div>


            <div class="dataset-meta-item">

                <small>Periode awal</small>

                <strong>

                    ${escapeHTML(metadata.startLabel)}

                </strong>

            </div>


            <div class="dataset-meta-item">

                <small>Periode akhir</small>

                <strong>

                    ${escapeHTML(metadata.endLabel)}

                </strong>

            </div>

        </div>


        <div class="dataset-history-heading">

            <h3>Hasil Validasi Dataset</h3>

        </div>


        <div class="dataset-history-scroll">

            <table class="dataset-history-table">

                <tbody>

                    <tr>

                        <td>Total baris unggahan</td>

                        <td>

                            ${validation.totalRows == null
                                ? "—"
                                : formatNumber(
                                    validation.totalRows
                                )}

                        </td>

                    </tr>

                    <tr>

                        <td>Data valid tersimpan</td>

                        <td style="color:#29966d;">

                            ${formatNumber(metadata.total)}

                        </td>

                    </tr>

                    <tr>

                        <td>Data duplikat</td>

                        <td>

                            ${validation.duplicateRows == null
                                ? "—"
                                : formatNumber(
                                    validation.duplicateRows
                                )}

                        </td>

                    </tr>

                    <tr>

                        <td>Data tidak valid</td>

                        <td>

                            ${validation.invalidRows == null
                                ? "—"
                                : formatNumber(
                                    validation.invalidRows
                                )}

                        </td>

                    </tr>

                    <tr>

                        <td>Jumlah bulan</td>

                        <td>

                            ${metadata.monthCount} bulan

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>


        <p class="dataset-ui-note">

            Dataset utama tetap tersimpan dan tidak
            mengalami perubahan selama analisis
            dataset mandiri berlangsung.

        </p>

    `;

    returnButton.disabled =
        activeDatasetMode !== "custom";

    viewButton.disabled =
        activeDatasetMode !== "custom";

    viewButton.hidden = false;
}


// =====================================================
// 62. PERPINDAHAN MODE UNGGAH
// =====================================================

function setUploadMode(mode) {
    if (!uploadModeConfig[mode]) return;

    uploadMode = mode;

    const isMain = mode === "main";

    const config =
        uploadModeConfig[mode];

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


    // Tampilkan informasi sesuai mode.

    el("mainDatasetInfo").hidden = !isMain;

    el("customDatasetInfo").hidden = isMain;

    el("mainUploadHistory").hidden = !isMain;

    el("customUploadStatus").hidden = isMain;


    // Ketentuan dan tombol action.

    el("datasetRuleTitle").textContent =
        config.ruleTitle;

    el("datasetRuleText").textContent =
        config.ruleText;

    el("datasetModeNote").textContent =
        config.note;

    processButton.textContent =
        config.buttonText;


    // Reset file agar tidak tercampur antarmode.

    resetSelectedFile();

    if (isMain) {
        updateMainDatasetInfo();

        renderUploadHistory();

    } else {
        renderCustomDatasetStatus();
    }
}


// =====================================================
// 63. DOWNLOAD TEMPLATE DATASET
// =====================================================

function downloadDatasetTemplate() {
    if (typeof XLSX === "undefined") {
        showUploadMessage(
            "Library Excel belum berhasil dimuat.",
            "error"
        );

        return;
    }

    const isMain =
        uploadMode === "main";

    const template = [

        {
            text:
                "Dosen menjelaskan materi dengan baik",

            created_at:
                "2026-11-01 10:30:00",

            sentiment:
                "positif",

            topic:
                TOPICS[0],

            confidence: "",

            tweet_id: ""
        },

        {
            text:
                "Wifi kampus sering mengalami gangguan",

            created_at: isMain
                ? "2026-11-02 19:30:00"
                : "2026-12-01 19:30:00",

            sentiment:
                "negatif",

            topic:
                TOPICS[3],

            confidence: "",

            tweet_id: ""
        },

        {
            text:
                "Informasi kegiatan kampus telah dibagikan",

            created_at: isMain
                ? "2026-11-03 12:15:00"
                : "2026-12-02 12:15:00",

            sentiment:
                "netral",

            topic:
                TOPICS[1],

            confidence: "",

            tweet_id: ""
        }
    ];

    const worksheet =
        XLSX.utils.json_to_sheet(template);

    worksheet["!cols"] = [
        { wch: 55 },
        { wch: 24 },
        { wch: 15 },
        { wch: 45 },
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

    XLSX.writeFile(
        workbook,

        uploadModeConfig[uploadMode]
            .templateName
    );
}


// =====================================================
// 64. INDIKATOR DATASET AKTIF
// =====================================================

function updateDatasetStatus() {
    const status = el("dataStatus");

    if (!status) return;

    if (activeDatasetMode === "custom") {
        status.textContent =
            "Dataset Mandiri";

        status.style.background =
            "#e4edf8";

        status.style.color =
            "#14487a";

    } else {
        status.textContent =
            "Dataset Utama · Demo";

        status.style.background =
            "#fff5ce";

        status.style.color =
            "#927500";
    }

    updateActiveDatasetBanner();
}


// =====================================================
// 65. BANNER DATASET MANDIRI
// =====================================================

function updateActiveDatasetBanner() {
    let banner =
        el("activeDatasetBanner");

    if (activeDatasetMode !== "custom") {
        if (banner) {
            banner.hidden = true;
        }

        return;
    }

    if (!customDataset) return;

    if (!banner) {
        banner = document.createElement("div");

        banner.id = "activeDatasetBanner";

        banner.className =
            "explorer-issue-status";

        const dashboard =
            el("dashboard");

        dashboard.prepend(banner);
    }

    const metadata =
        getDatasetMetadata(customDataset.data);

    banner.hidden = false;

    banner.innerHTML = `

        <div>

            <strong>

                Dataset Mandiri

            </strong>

            <div style="margin-top:4px;">

                ${escapeHTML(customDataset.filename)}

                ·

                ${escapeHTML(metadata.startLabel)}

                –

                ${escapeHTML(metadata.endLabel)}

                ·

                ${formatNumber(metadata.total)}
                postingan

            </div>

        </div>

        <button
            type="button"
            id="bannerReturnMain"
        >

            ← Kembali ke Dataset Utama

        </button>

    `;

    el("bannerReturnMain").onclick =
        restoreMainDataset;
}


// =====================================================
// 66. KEMBALI KE DATASET UTAMA
// =====================================================

function restoreMainDataset() {
    if (
        activeDatasetMode !== "custom" ||
        !mainDataset.length
    ) return;

    currentData = [...mainDataset];

    activeDatasetMode = "main";

    customDataset = null;

    updateDatasetStatus();

    syncActiveDataset();

    updateMainDatasetInfo();

    renderCustomDatasetStatus();

    showUploadMessage(
        "Dashboard dikembalikan ke dataset utama.",
        "success"
    );

    openAnalyticsPage("dashboard");
}


// =====================================================
// 67. HANDLER PROSES UNGGAH
// =====================================================

// Tahap UI: file dapat dipilih dan dibaca,
// tetapi belum disimpan ke database.
//
// Jangan menggunakan handler upload lama yang
// menggantikan currentData secara langsung.

async function handleDatasetUpload() {
    if (!selectedFile) {
        showUploadMessage(
            "Pilih file dataset terlebih dahulu.",
            "error"
        );

        return;
    }

    processButton.disabled = true;

    processButton.textContent =
        "Memeriksa File...";

    const modeAtStart = uploadMode;
    const fileAtStart = selectedFile;

    try {
        const rows = await readUploadedFile(
            fileAtStart
        );

        // Abaikan hasil jika pengguna mengganti
        // mode atau memilih file lain saat membaca.

        if (
            uploadMode !== modeAtStart ||
            selectedFile !== fileAtStart
        ) return;

        if (!rows.length) {
            throw new Error(
                "Dataset kosong atau tidak memiliki data."
            );
        }

        showUploadMessage(

            `File berhasil dibaca. ` +
            `Terdapat ${formatNumber(rows.length)} baris. ` +
            `Validasi periode, penambahan data, ` +
            `dan pergantian dataset akan diaktifkan ` +
            `setelah backend terhubung.`,

            ""

        );

    } catch (error) {
        if (
            uploadMode === modeAtStart &&
            selectedFile === fileAtStart
        ) {
            showUploadMessage(
                error.message ||
                "Terjadi kesalahan saat membaca dataset.",

                "error"
            );
        }

    } finally {
        if (
            uploadMode === modeAtStart &&
            selectedFile === fileAtStart
        ) {
            processButton.disabled =
                !selectedFile;

            processButton.textContent =
                uploadModeConfig[uploadMode]
                    .buttonText;
        }
    }
}


// =====================================================
// 68. EVENT LISTENER HALAMAN UNGGAH
// =====================================================

function registerDatasetUploadEvents() {

    // Perpindahan tab.

    document.querySelectorAll(".dataset-tab")
        .forEach(button => {

            button.addEventListener("click", () => {

                const mode =
                    button.dataset.uploadMode;

                if (mode !== uploadMode) {
                    setUploadMode(mode);
                }

            });

        });


    // Template dataset.

    el("downloadTemplate")
        ?.addEventListener(
            "click",
            downloadDatasetTemplate
        );


    // Proses unggah.

    processButton.addEventListener(
        "click",
        handleDatasetUpload
    );


    // Kembali ke dataset utama.

    el("returnMainDataset")
        ?.addEventListener(
            "click",
            restoreMainDataset
        );


    // Lihat dashboard dataset mandiri.

    el("viewCustomDashboard")
        ?.addEventListener("click", () => {

            if (activeDatasetMode === "custom") {
                openAnalyticsPage("dashboard");
            }

        });


    // Sinkronisasi informasi ketika membuka menu
    // Unggah Data dari sidebar.

    document.querySelector(
        '[data-page="upload"]'
    )?.addEventListener("click", () => {

        updateMainDatasetInfo();

        renderUploadHistory();

        renderCustomDatasetStatus();

    });
}


// =====================================================
// 69. INISIALISASI HALAMAN UNGGAH
// =====================================================

function initializeDatasetUpload() {

    // Dataset awal disalin agar tidak tertimpa
    // ketika dataset mandiri digunakan.

    mainDataset = [...currentData];

    createDatasetUploadPage();

    if (!el("datasetModeTabs")) return;

    registerDatasetUploadEvents();

    setUploadMode("main");

    updateDatasetStatus();

    updateMainDatasetInfo();

    renderUploadHistory();

    renderCustomDatasetStatus();

    console.log(
        "Dual Mode Upload UI berhasil dimuat."
    );
}


// =====================================================
// 70. KONFIGURASI TOP ISU
// =====================================================

let activeIssue = null;
let applyingIssue = false;

const ISSUE_STOPWORDS = new Set([
    ...EXTRA_STOPWORDS,

    ...`
        gue gua lo lu kalian kamu
        dia kan kok tuh lah ya
        ngga nggak gak ga enggak
        mau pengen ingin biar supaya
        boleh mungkin harus semua
        hari kemarin besok sekarang
        tadi nanti orang bgt emang
        memang apa siapa gimana
        bagaimana kenapa tolong plis
        please min sender guys gaes
        teman temen http https www
        com rt amp email disamarkan
    `.trim().split(/\s+/)
]);

const ISSUE_ALIASES = {
    "tugasnya": "tugas",
    "praktikumnya": "praktikum",
    "jadwalnya": "jadwal",
    "parkiran": "parkir",
    "kelasnya": "kelas",
    "acaranya": "acara",
    "dosennya": "dosen",
    "fasilitasnya": "fasilitas",
    "beasiswanya": "beasiswa"
};


// =====================================================
// 71. EKSTRAKSI KATA KUNCI ISU
// =====================================================

function extractIssueWords(text) {
    const cleaned = String(text ?? "")

        .toLowerCase()

        // Hapus URL.

        .replace(
            /https?:\/\/\S+/gi,
            " "
        )

        // Hapus email.

        .replace(
            /[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,
            " "
        )

        // Hapus username.

        .replace(
            /@[\w]+/g,
            " "
        )

        // Hapus nomor telepon.

        .replace(
            /(?:\+62|08)\d[\d\s-]{7,14}\d/g,
            " "
        )

        // Samakan penulisan WiFi.

        .replace(
            /\bwi[\s-]+fi\b/gi,
            "wifi"
        );

    const words =
        cleaned.match(/[\p{L}]+/gu) || [];

    const normalized = words.map(word =>

        ISSUE_ALIASES[word] || word

    );

    // Satu kata dihitung maksimal satu kali
    // dalam setiap postingan.

    return [...new Set(

        normalized.filter(word =>

            word.length >= 3 &&

            !ISSUE_STOPWORDS.has(word)

        )

    )];
}


// =====================================================
// 72. TEMPLATE CARD TOP 5 ISU
// =====================================================

function createTopIssueCard(
    sentiment,
    className,
    icon
) {
    const title =
        capitalize(sentiment);

    return `
        <section class="top-issue-card ${className}">

            <div class="top-issue-header">

                <div class="top-issue-icon">

                    ${icon}

                </div>

                <div>

                    <h3>

                        Top 5 Isu ${title}

                    </h3>

                    <p>

                        Berdasarkan frekuensi postingan

                    </p>

                </div>

            </div>

            <div
                id="${className}IssueList"
                class="top-issue-list"
            ></div>

            <p class="top-issue-note">

                Klik isu untuk melihat postingan terkait.

            </p>

        </section>
    `;
}


// =====================================================
// 73. MEMBUAT KOMPONEN TOP 5 ISU
// =====================================================

function createTopIssuesSection() {
    const explorerCount =
        el("explorerCountV2");

    if (
        !explorerCount ||
        el("topIssuesGrid")
    ) return;

    const section =
        document.createElement("div");

    section.id = "topIssuesGrid";

    section.className =
        "top-issues-grid";

    section.innerHTML = `

        ${createTopIssueCard(
            "negatif",
            "negative",
            "↘"
        )}

        ${createTopIssueCard(
            "positif",
            "positive",
            "↗"
        )}

    `;

    explorerCount.before(section);


    // Informasi isu yang sedang dipilih.

    const status =
        document.createElement("div");

    status.id =
        "explorerIssueStatus";

    status.className =
        "explorer-issue-status";

    status.hidden = true;

    status.innerHTML = `

        <span id="explorerIssueText">
        </span>

        <button
            type="button"
            id="resetExplorerIssue"
        >

            Hapus Filter ×

        </button>

    `;

    explorerCount.before(status);
}


// =====================================================
// 74. DATA UNTUK RANKING ISU
// =====================================================

function getIssueRankingData() {
    const month =
        el("exploreMonth").value;

    const topic =
        el("exploreTopic").value;

    const keyword = activeIssue

        ? ""

        : el("exploreKeyword")
            .value.trim().toLowerCase();

    return currentData.filter(row =>

        (
            month === "all" ||
            row.month === month
        ) &&

        (
            topic === "all" ||
            row.topic === topic
        ) &&

        (
            !keyword ||
            row.text.toLowerCase().includes(keyword)
        )

    );
}


// =====================================================
// 75. PERHITUNGAN TOP 5 ISU
// =====================================================

function calculateTopIssues(data, sentiment) {
    const selectedData = data.filter(row =>

        row.sentiment === sentiment

    );

    const frequencies = new Map();

    selectedData.forEach(row => {
        const words =
            extractIssueWords(row.text);

        words.forEach(word => {

            frequencies.set(

                word,

                (frequencies.get(word) || 0) + 1

            );

        });
    });

    return [...frequencies.entries()]

        .map(([word, count]) => ({

            word,

            count

        }))

        .sort((a, b) =>

            b.count - a.count ||

            a.word.localeCompare(b.word)

        )

        .slice(0, 5);
}


// =====================================================
// 76. RENDER RANKING ISU
// =====================================================

function renderIssueRanking(
    containerId,
    issues,
    sentiment
) {
    const container = el(containerId);

    if (!container) return;

    container.replaceChildren();

    if (!issues.length) {
        container.innerHTML = `

            <div class="top-issue-empty">

                Belum ada isu dengan sentimen
                ${sentiment} pada filter ini.

            </div>

        `;

        return;
    }

    const maximum = issues[0].count;

    issues.forEach((issue, index) => {
        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "top-issue-item";

        const selected =

            activeIssue?.word === issue.word &&

            activeIssue?.sentiment === sentiment;

        button.classList.toggle(
            "active",
            selected
        );

        button.setAttribute(
            "aria-pressed",
            String(selected)
        );

        const width =
            percentage(
                issue.count,
                maximum
            );

        button.innerHTML = `

            <div class="top-issue-item-header">

                <span class="top-issue-number">

                    ${index + 1}.

                </span>

                <span class="top-issue-name">

                    ${escapeHTML(issue.word)}

                </span>

                <span class="top-issue-count">

                    ${formatNumber(issue.count)}
                    postingan

                </span>

            </div>

            <div class="top-issue-track">

                <div

                    class="top-issue-fill"

                    style="width:${width}%"

                ></div>

            </div>

        `;

        button.addEventListener("click", () => {

            selectTopIssue(
                issue.word,
                sentiment
            );

        });

        container.appendChild(button);
    });
}


// =====================================================
// 77. MEMPERBARUI KEDUA CARD TOP ISU
// =====================================================

function renderTopIssues() {
    if (!el("topIssuesGrid")) return;

    const data =
        getIssueRankingData();

    const negativeIssues =
        calculateTopIssues(
            data,
            "negatif"
        );

    const positiveIssues =
        calculateTopIssues(
            data,
            "positif"
        );

    renderIssueRanking(

        "negativeIssueList",

        negativeIssues,

        "negatif"

    );

    renderIssueRanking(

        "positiveIssueList",

        positiveIssues,

        "positif"

    );
}


// =====================================================
// 78. FILTER POSTINGAN BERDASARKAN ISU
// =====================================================

// Pertahankan fungsi filter dari Bagian 5.

const originalGetPageData =
    getPageData;

getPageData = function (
    prefix,
    ignoreMonth = false
) {

    // Filter halaman lain tidak berubah.

    if (
        prefix !== "explore" ||
        !activeIssue
    ) {

        return originalGetPageData(
            prefix,
            ignoreMonth
        );

    }

    // Gunakan hasil normalisasi kata yang sama
    // dengan perhitungan ranking isu.

    const month =
        el("exploreMonth").value;

    const topic =
        el("exploreTopic").value;

    return currentData.filter(row =>

        (
            ignoreMonth ||
            month === "all" ||
            row.month === month
        ) &&

        (
            topic === "all" ||
            row.topic === topic
        ) &&

        row.sentiment === activeIssue.sentiment &&

        extractIssueWords(row.text)
            .includes(activeIssue.word)

    );
};


// =====================================================
// 79. INTERAKSI KLIK TOP ISU
// =====================================================

function selectTopIssue(word, sentiment) {
    applyingIssue = true;

    activeIssue = {
        word,
        sentiment
    };

    el("exploreSentiment").value =
        sentiment;

    el("exploreKeyword").value =
        word;

    explorerPage = 0;

    el("explorerIssueText").textContent =

        `Menampilkan isu "${word}" ` +

        `dengan sentimen ${sentiment}.`;

    el("explorerIssueStatus").hidden =
        false;

    renderExplorer();

    renderTopIssues();

    applyingIssue = false;
}


// =====================================================
// 80. RESET FILTER ISU
// =====================================================

function resetTopIssue(
    resetFilters = true,
    refresh = true
) {
    activeIssue = null;

    const status =
        el("explorerIssueStatus");

    if (status) {
        status.hidden = true;
    }

    if (resetFilters) {

        el("exploreSentiment").value =
            "all";

        el("exploreKeyword").value =
            "";

    }

    explorerPage = 0;

    if (refresh) {

        renderExplorer();

        renderTopIssues();

    }
}


// =====================================================
// 81. SINKRONISASI FILTER TOP ISU
// =====================================================

function registerTopIssueEvents() {
    const monthFilter =
        el("exploreMonth");

    const topicFilter =
        el("exploreTopic");

    const sentimentFilter =
        el("exploreSentiment");

    const keywordFilter =
        el("exploreKeyword");

    const resetButton =
        el("resetExplorerIssue");


    // Ranking mengikuti periode dan topik.

    [monthFilter, topicFilter]
        .forEach(filter => {

            filter.addEventListener(
                "change",
                () => {

                    renderTopIssues();

                }
            );

        });


    // Jika sentimen diubah manual,
    // nonaktifkan filter isu sebelumnya.

    sentimentFilter.addEventListener(
        "change",
        () => {

            if (applyingIssue) return;

            activeIssue = null;

            el("explorerIssueStatus").hidden =
                true;

            explorerPage = 0;

            renderExplorer();

            renderTopIssues();

        }
    );


    // Jika keyword diubah manual,
    // kembali ke mekanisme pencarian biasa.

    keywordFilter.addEventListener(
        "input",
        () => {

            if (applyingIssue) return;

            activeIssue = null;

            el("explorerIssueStatus").hidden =
                true;

            explorerPage = 0;

            renderExplorer();

            renderTopIssues();

        }
    );


    // Tombol hapus filter isu.

    resetButton.addEventListener(
        "click",
        () => {

            resetTopIssue();

        }
    );
}


// =====================================================
// 82. SINKRONISASI DENGAN DATASET AKTIF
// =====================================================

let lastActiveDataset = null;

const previousSyncActiveDataset =
    syncActiveDataset;

syncActiveDataset = function () {

    resetTopIssue(
        false,
        false
    );

    previousSyncActiveDataset();

    lastActiveDataset = currentData;

    renderTopIssues();
};


// Sinkronisasi tambahan jika dataset berubah
// melalui fungsi updateDashboard.

const previousDashboardUpdate =
    updateDashboard;

updateDashboard = function () {

    const datasetChanged =
        lastActiveDataset !== currentData;

    if (datasetChanged) {

        lastActiveDataset =
            currentData;

        activeIssue = null;

        if (el("topIssuesGrid")) {

            resetTopIssue(
                true,
                false
            );

        }

    }

    previousDashboardUpdate();

    if (
        datasetChanged &&
        el("explorerMonth")
    ) {

        refreshAnalyticsPages(true);

    }

    if (el("topIssuesGrid")) {

        renderTopIssues();

    }

};


// =====================================================
// 83. INISIALISASI TOP 5 ISU
// =====================================================

function initializeTopIssues() {

    createTopIssuesSection();

    if (!el("topIssuesGrid")) return;

    registerTopIssueEvents();

    renderTopIssues();

    window.refreshTopIssues =
        renderTopIssues;

    lastActiveDataset =
        currentData;

    console.log(
        "Top 5 Isu Positif dan Negatif berhasil dimuat."
    );
}


// =====================================================
// 84. PEMERIKSAAN KOMPONEN UTAMA
// =====================================================

function validateDashboardComponents() {
    const requiredIds = [

        "dashboard",

        "upload",

        "pageHeading",

        "pageSubheading",

        "monthFilter",

        "topicFilter",

        "sentimentFilter",

        "keywordSearch",

        "totalPosts",

        "positiveTotal",

        "negativeTotal",

        "neutralTotal",

        "sentimentChart",

        "trendChart",

        "categoryChart",

        "rushChart",

        "keywordCloud",

        "priorityList",

        "fileInput",

        "dropzone",

        "processFile"

    ];

    const missing = requiredIds.filter(
        id => !el(id)
    );

    if (missing.length) {

        console.error(

            "Komponen HTML belum lengkap:",

            missing

        );

        return false;

    }

    return true;
}


// =====================================================
// 85. INISIALISASI SELURUH SISTEM
// =====================================================

function initializeApplication() {

    if (
        !validateDashboardComponents()
    ) return;


    // 1. Dataset awal dan dashboard.

    initializeDashboard();


    // 2. Halaman Lonjakan Isu,
    //    Eksplorasi Postingan,
    //    dan Perbandingan Periode.

    initializeAnalyticsPages();


    // 3. Dua mode unggah dataset.

    initializeDatasetUpload();


    // 4. Top 5 Isu Positif dan Negatif.

    initializeTopIssues();


    // 5. Sinkronisasi informasi dataset.

    updateDatasetStatus();

    refreshAnalyticsPages(true);


    // 6. Tampilkan dashboard utama.

    openAnalyticsPage("dashboard");


    console.log(
        "======================================"
    );

    console.log(
        "MENFESS PENS DASHBOARD"
    );

    console.log(
        "Status: Berhasil Diinisialisasi"
    );

    console.log(
        `Total Dataset: ${currentData.length} Postingan`
    );

    console.log(
        "Periode Awal: Januari–Oktober 2026"
    );

    console.log(
        "======================================"
    );

}


// =====================================================
// 86. MENJALANKAN APLIKASI
// =====================================================

if (document.readyState === "loading") {

    document.addEventListener(

        "DOMContentLoaded",

        initializeApplication,

        { once: true }

    );

} else {

    initializeApplication();

}
