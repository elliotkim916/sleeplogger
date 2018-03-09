'use strict';

const SLEEPLOG_ENDPOINT = '/api/logs';

// gets current state of database & renders onto the DOM
function getSleepLogs() {
    $.get(SLEEPLOG_ENDPOINT, renderSleepLog);
}

function postSleepLog(path, hoursSlept, sleepLogText, callback) {
    $.ajax({
        type: 'POST',
        url: path,
        contentType: 'application/json',
        data: JSON.stringify({
            hoursOfSleep: hoursSlept,
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

function putSleepLog(path, newHours, newDescription, callback) {
    $.ajax({
        type: 'PUT',
        url: path,
        contentType: 'application/json',
        data: JSON.stringify({
            hoursOfSleep: newHours,
            description: newDescription
        }),
        success: callback,
        error: function(err) {
            console.info('There is an error!');
            console.error(err);
        }    
    });
}

function updateGenerateSleepLog(log) {
    return `
    <form class="updated-log-js" logID="${log._id}">
        <h3 class="update-date">${log.created}</h3>
        <label class="sleep-label">Describe your sleep</label><br>
        <input class="update-hours" value="${log.hoursOfSleep}"><br>
        <label class="sleep-label">Describe your sleep</label><br>
        <input class="update-description" value="${log.description}"><br>
        <button class="cancel-log" role="button">Cancel</button>
        <button class="save-log" type="submit" role="button">Save</button>
    </form>
    `;
}

function updateEventListener() {
    // clicking on the update button
    $('.sleep-logs-list').on('click', '.update-log', function(event) {
        const toUpdateLogInput = $(event.currentTarget).closest('.log-container');
        const currentDate = toUpdateLogInput.find('.date').text();
        const currentHours = toUpdateLogInput.find('.hours').text();
        const currentDescription = toUpdateLogInput.find('.description').text();
        const currentID = toUpdateLogInput.attr('logID');

        const currentLogObj = {
            hoursOfSleep: currentHours,
            description: currentDescription,
            created: currentDate,
            _id: currentID
        }
        
        const currentInput = toUpdateLogInput.html(updateGenerateSleepLog(currentLogObj));
        $('.log-container').append(currentInput);
    
    // clicking on the cancel button if updating
    $('.sleep-logs-list').on('click', '.cancel-log', function(event) {
       event.preventDefault();
       getSleepLogs();
    });
    
    // clicking on the save button if updating 
    $('.updated-log-js').on('click', '.save-log', function(event) {
        event.preventDefault();
        const editedLogInput = $(event.currentTarget).closest('.updated-log-js');
        const editedHours = editedLogInput.find('.update-hours').val();
        const editedDescription = editedLogInput.find('.update-description').val();
        const sameDate = editedLogInput.find('.update-date').text();
        const sameID = editedLogInput.attr('logID');
        
        const newLogObj = {
            hoursOfSleep: editedHours,
            description: editedDescription,
            created: sameDate,
            _id: sameID
        }

        // we are using the html method to SET the html contents of each element in the set of matched elements
        const newInput = editedLogInput.html(generateSleepLog(newLogObj));
        putSleepLog(SLEEPLOG_ENDPOINT + '/' + sameID, editedHours, editedDescription, getSleepLogs);
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

function deleteEventListener() {
    $('.sleep-logs-list').on('click', '.delete-log', function(event) {
        const deleteLogInput = $(event.currentTarget).closest('.log-container');
        const deleteLogText = deleteLogInput.val();

        const logID = deleteLogInput.attr('logID');
        deleteSleepLog(SLEEPLOG_ENDPOINT + '/' + logID, getSleepLogs);
    });
}

function renderSleepLog(data) {
    // allows us to turn data into an array if its not an array
    // so that we can call map() regardless of whether we have a single item or an array
    const allLogs = [].concat(data || []);
    // takes the data and passes through the generateSleepLog function
    const sleepLogsHTML = allLogs.map(generateSleepLog).join('');
    $('.sleep-logs-list').html(sleepLogsHTML);
}

function generateSleepLog(log) {
    console.log(log);
    return `
    <div class="log-container" logID="${log._id}">
        <h3 class="date">${log.created.slice(0,10)}</h3>
        <p class="hours">${log.hoursOfSleep} Hours</p>
        <p class="description">${log.description}</p>
        <button class="update-log" role="button">Update</button>
        <button class="delete-log" type="submit" role="button">Delete</button>
    </div>
    `;
}

function bindEventListeners() {
    $('form').on('submit', function(event) {
        event.preventDefault();
        const sleepHours = $(event.currentTarget).find('#hoursOfSleep');
        const hoursOfSleep = sleepHours.val();
        console.log(hoursOfSleep);
        const sleepLogDescription = $(event.currentTarget).find('.js-sleep-log');
        const sleepLogText = sleepLogDescription.val();

        postSleepLog(SLEEPLOG_ENDPOINT, hoursOfSleep, sleepLogText, getSleepLogs);
        sleepLogDescription.val('');
    });
}

function logIn() {
    $('.logIn').on('submit', function(event) {
        event.preventDefault(); 
        const existingLogin = $(event.currentTarget).find('#existingUsername');
        const existingUsername = existingLogin.val();
        const yourPassword = $(event.currentTarget).find('#existingPassword');
        const existingPassword = yourPassword.val();
        requestJWT(existingUsername, existingPassword);
    });
}

function enterApp() {
        $('.log-in').hide();
        $('.create-account').hide();
        $('.new-sleep-entry').show();
        $('.all-sleep-entries').show();
        $('.logout-button').show();
}

function requestJWT(username, password) {
    $.ajax({
        type: 'POST',
        url: 'api/auth/login',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
            username: username,
            password: password
        }),
        success: function(resultData) {
            localStorage.setItem('token', resultData.authToken);
            $.ajax({
                type: 'GET',
                url: 'api/protected',
                contentType: 'application/json',
                dataType: 'json',
                headers: {
                    'Authorization': "Bearer " + localStorage.getItem('token')
                },
                success: enterApp()
                })
            },
        error: function(err) {
            console.info('Login failed!');
            console.error(err);
        }
    });
    $('.logout-button').on('click', function(event) {
        localStorage.clear();
        $('.new-sleep-entry').hide();
        $('.all-sleep-entries').hide();
        $('.logout-button').hide();
        $('.log-in').show();
    });
}

function createAccount() {
    $('.new-sleep-entry').hide();
    $('.all-sleep-entries').hide();
    $('.log-in').hide();
    $('.logout-button').hide();
    $('.createAccount').on('submit', function(event) {
        event.preventDefault();
        const login = $(event.currentTarget).find('#username');
        const username = login.val();
        const createPassword = $(event.currentTarget).find('#password');
        const password = createPassword.val();
        $.ajax({
            type: 'POST',
            url: 'api/users',
            contentType: 'application/json',
            data: JSON.stringify({
                username: username,
                password: password
            }),
            dataType: 'json',
            success: requestJWT(username, password),
            error: function(err) {
                console.info('There is an error');
                console.error(err);
            }
        });
        login.val('');
        createPassword.val(''); 
    });
    $('.createAccount').on('click', '.click-here', function(event) {
        $('.create-account').hide();
        $('.log-in').show();
    });
}

$(function() {
    // logOut();
    logIn();
    createAccount();
    updateEventListener();
    deleteEventListener();
    bindEventListeners();
    getSleepLogs();
});