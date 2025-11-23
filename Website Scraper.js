(() => {
    let lastScrapedData = [];

    const selectors = {
        bugId: 'td.example-bug-id',
        reportDate: 'td.example-report-date',
        reporter: 'td.example-reported-by .user-name'
    };

    function getTableData() {
        const ids = document.querySelectorAll(selectors.bugId);
        const dates = document.querySelectorAll(selectors.reportDate);
        const reporters = document.querySelectorAll(selectors.reporter);

        if (ids.length !== dates.length || dates.length !== reporters.length) {
            console.warn('Column counts do not match - data may be incomplete');
            return [];
        }

        return Array.from(ids).map((idEl, i) => ({
            bugId: idEl.textContent.trim(),
            reportDate: dates[i].textContent.trim(),
            reporter: reporters[i].textContent.trim()
        }));
    }

    function convertToCSV(data) {
        const header = 'BugID,ReportDate,Reporter\n';
        return data.reduce((csv, row) => {
            return csv + `"${row.bugId}","${row.reportDate}","${row.reporter}"\n`;
        }, header);
    }

    function downloadCSV(csvData, filename = 'data.csv') {
        const blob = new Blob([csvData], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }

    function checkForNewData() {
        const currentData = getTableData();
        if (currentData.length > 0 && JSON.stringify(currentData) !== JSON.stringify(lastScrapedData)) {
            console.log('New data detected. Downloading CSV...');
            lastScrapedData = [...currentData];
            downloadCSV(convertToCSV(currentData), 'updated_data.csv');
        }
    }

    // Initial scrape
    lastScrapedData = getTableData();
    downloadCSV(convertToCSV(lastScrapedData), 'initial_data.csv');

    // Periodic check
    const scrapeIntervalMs = 10000;
    const interval = setInterval(checkForNewData, scrapeIntervalMs);

})();
