$(document).ready(function () {
    populateCompanyOptions();

    $("#companySelect").change(function () {
        const selectedSymbol = $(this).val();
        const selectedYear = $("#yearSelect").val();
        getGlobalQuotes(selectedSymbol);
        getMonthlyTimeSeries(selectedSymbol, selectedYear);
    });

    $("#searchInput").on("keyup", function () {
        if ($(this).val().length >= 2) {
            searchCompany();
        } else {
            clearSearchResultsGrid();
        }
    });

    $("#showLocation").click(function () {
        const companyName = $("#symbol").text();
        const locationUrl = `https://maps.google.com/maps?q=${companyName}&output=embed`;
        $("#mapFrame").attr("src", locationUrl);
        $("#myModal").css("display", "block");
    });
    
    $(".close").click(function () {
        $("#myModal").css("display", "none");
    });
});

function populateCompanyOptions() {
    const companies = [
        { symbol: "MSFT", name: "Microsoft" },
        { symbol: "SNE", name: "Sony" },
        { symbol: "BABA", name: "Alibaba" },
        { symbol: "IBM", name: "IBM" },
        { symbol: "XIACF", name: "Xiaomi" }
    ];

    const companySelect = $("#companySelect");

    companies.forEach(company => {
        const option = $("<option>").val(company.symbol).text(company.name);
        companySelect.append(option);
    });

    const yearSelect = $("#yearSelect");
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 10; year--) {
        const option = $("<option>").val(year).text(year);
        yearSelect.append(option);
    }
}

function getMonthlyTimeSeries(symbol, year) {
    const apiKey = "CIT7VLT7I2SKC6HD";
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${apiKey}`;

    $.ajax({
        url: url,
        dataType: "json",
        success: function (data) {
            const timeSeries = data['Monthly Time Series'];
            const labels = [];
            const dataPoints = [];

            for (let month in timeSeries) {
                if (timeSeries.hasOwnProperty(month) && month.startsWith(year)) {
                    labels.push(month);
                    dataPoints.push(parseFloat(timeSeries[month]['4. close']));
                }
            }

            const ctx = document.getElementById('myChart').getContext('2d');
            const myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Closing Price',
                        data: dataPoints,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        },
        error: function (error) {
            console.error("Error: ", error);
        }
    });
}

function getGlobalQuotes(symbol) {
    const apiKey = "CIT7VLT7I2SKC6HD";
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

    $.ajax({
        url: url,
        dataType: "json",
        success: function (data) {
            const globalQuote = data['Global Quote'];

            if (globalQuote && Object.keys(globalQuote).length > 0) {
                $("#symbol").text(globalQuote['01. symbol']);
                $("#lastTrade").text(globalQuote['05. price']);
                $("#change").text(globalQuote['09. change']);
                $("#open").text(globalQuote['02. open']);
                $("#previousClose").text(globalQuote['08. previous close']);
                $("#daysLow").text(globalQuote['04. low']);
                $("#daysHigh").text(globalQuote['03. high']);
                $("#volume").text(globalQuote['06. volume']);
            } else {
                console.error("Error: No data found");
            }
        },
        error: function (error) {
            console.error("Error: ", error);
        }
    });
}

function updateGridWithSearchResults(data) {
    if (data && data.bestMatches && data.bestMatches.length > 0) {
        clearSearchResultsGrid();

        const searchResultsGrid = $("#searchResultsGrid");

        data.bestMatches.forEach(match => {
            const row = $("<div>").addClass("search-result-row");

            const symbolCell = $("<div>").text(match["1. symbol"]).addClass("search-result-cell");
            const nameCell = $("<div>").text(match["2. name"]).addClass("search-result-cell");
            const typeCell = $("<div>").text(match["3. type"]).addClass("search-result-cell");
            const regionCell = $("<div>").text(match["4. region"]).addClass("search-result-cell");
            const marketOpenCell = $("<div>").text(match["5. marketOpen"]).addClass("search-result-cell");
            const marketCloseCell = $("<div>").text(match["6. marketClose"]).addClass("search-result-cell");
            const timezoneCell = $("<div>").text(match["7. timezone"]).addClass("search-result-cell");
            const currencyCell = $("<div>").text(match["8. currency"]).addClass("search-result-cell");

            row.append(symbolCell, nameCell, typeCell, regionCell, marketOpenCell, marketCloseCell, timezoneCell, currencyCell);

            searchResultsGrid.append(row);
        });
    } else {
        console.error("Error: No data found");
    }
}

function clearSearchResultsGrid() {
    $("#searchResultsGrid").empty();
}
