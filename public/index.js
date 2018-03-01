'use strict';

const SLEEPLOG_ENDPOINT = '/api/logs';

// gets our sample data
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

function putSleepLog(path, newQuality, newDescription, callback) {
    $.ajax({
        type: 'PUT',
        url: path,
        contentType: 'application/json',
        data: JSON.stringify({
            quality: newQuality,
            description: newDescription
        }),
        success: callback,
        error: function(err) {
            console.info('There is an error!');
            console.error(err);
        }    
    });
}

function updateEventListener() {
    $('.sleep-logs-list').on('click', '.update-log', function() {
        console.log('clicked');
        const toUpdateLogInput = $(this).closest('.log-container');
        const newQuality = toUpdateLogInput.find('.quality').val();
        const newDescription = toUpdateLogInput.find('.description').val();
      
        const toUpdateID = toUpdateLogInput.attr('logID');

    putSleepLog(SLEEPLOG_ENDPOINT + '/' + toUpdateID, newQuality, newDescription, function(response) {
        console.log(response);
   
        });        
    });
}

function deleteSleepLog(path, callback) {
    $.ajax({
        type: 'DELETE',
        url: path,
        contentType: 'application/json',
        success: callback,
        error: function(err) {
            console.info('There is an error');
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
    // console.log(log._id);
    return `
    <div class="log-container" logID="${log._id}">
        <h3>${log.created.slice(0,10)}</h3>
        <p class="quality">${log.quality}</p>
        <p class="description">${log.description}</p>
        <button class="update-log" role="button">Update</button>
        <button class="delete-log" type="submit" role="button">Delete</button>
    </div>
    `;
}

function deleteEventListener() {
    $('.sleep-logs-list').on('click', '.delete-log', function(event) {
        console.log('clicked');
        const deleteLogInput = $(event.currentTarget).closest('.log-container');
        const deleteLogText = deleteLogInput.val();

        const logID = deleteLogInput.attr('logID');
        deleteSleepLog(SLEEPLOG_ENDPOINT + '/' + logID, function(response) {
            window.location.href = '/';
        });
    });
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
    updateEventListener();
    deleteEventListener();
    bindEventListeners();
    getSleepLogs();
});