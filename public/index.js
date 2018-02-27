'use strict';

const SLEEPLOG_ENDPOINT = '/api/logs';

function getSleepLogs() {
    $.get(SLEEPLOG_ENDPOINT, renderSleepLog);
}

function postSleepLog(path, sleepQuality, sleepLogText, callback) {
    $.ajax({
        type: 'POST',
        url: path,
        contentType: 'application/json',
        data: JSON.stringify({
            quality: sleepQuality,
            description: sleepLogText
        }),
        dataType: 'json',
        success: callback,
        error: function(err) {
            console.info('There is an error!');
            console.error(err);
        }
    });
}

function renderSleepLog(data) {
    const allLogs = [].concat(data || []);
    const sleepLogsHTML = allLogs.map(generateSleepLog).join('');
    $('.sleep-logs-list').append(sleepLogsHTML);
}

function generateSleepLog(log) {
    // console.log(log.description);
    return `
    <li>${log.quality}</li>
    <li>${log.description}</li>
    `;
}

function bindEventListeners() {
$('form').on('submit', function(event) {
    event.preventDefault();
    const sleepQuality = $('input[name=sleepRating]:checked').val();
    
    const sleepLogInput = $(event.currentTarget).find('.js-sleep-log');
    const sleepLogText = sleepLogInput.val();
    
    postSleepLog(SLEEPLOG_ENDPOINT, sleepQuality, sleepLogText, renderSleepLog);
    sleepLogInput.val('');
});
}

$(function() {
    bindEventListeners();
    getSleepLogs();
});