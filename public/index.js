'use strict';

const SLEEPLOG_ENDPOINT = '/api/logs';

// gets current state of database & renders onto the DOM
function getSleepLogs() {
    $.get(SLEEPLOG_ENDPOINT, renderSleepLog);
}

function postSleepLog(path, hoursSlept, sleepFeel, sleepLogText, callback) {
    $.ajax({
        type: 'POST',
        url: path,
        contentType: 'application/json',
        data: JSON.stringify({
            hoursOfSleep: hoursSlept,
            feeling: sleepFeel,
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

function putSleepLog(path, newHours, newFeeling, newDescription, callback) {
    $.ajax({
        type: 'PUT',
        url: path,
        contentType: 'application/json',
        data: JSON.stringify({
            hoursOfSleep: newHours,
            feeling: newFeeling,
            description: newDescription
        }),
        success: callback,
        error: function(err) {
            console.info('There is an error!');
            console.error(err);
        }    
    });
}
// <label class="sleep-label">How many hours of sleep did you get?</label><br>
// <label class="sleep-label">How do you feel after waking up?</label><br>
// <label class="sleep-label">Details you'd like to remember</label><br>

function updateGenerateSleepLog(log) {
    return `
    <form class="updated-log-js" logID="${log._id}">
        <h3 class="update-date">${log.created}</h3>
        
        <input class="update-hours" placeholder="How many hours did you sleep?" value="${log.hoursOfSleep}"><br>
        
        <input class="update-feeling" placeholder="How did you feel after waking up?" value="${log.feeling}"><br>
        
        <input class="update-description" placeholder="Additional details?" value="${log.description}"><br>
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
        const currentFeeling = toUpdateLogInput.find('.feeling').text();
        const currentDescription = toUpdateLogInput.find('.description').text();
        const currentID = toUpdateLogInput.attr('logID');

        const currentLogObj = {
            hoursOfSleep: currentHours,
            feeling: currentFeeling,
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
        const editedFeeling = editedLogInput.find('.update-feeling').val();
        const editedDescription = editedLogInput.find('.update-description').val();
        const sameDate = editedLogInput.find('.update-date').text();
        const sameID = editedLogInput.attr('logID');
        
        const newLogObj = {
            hoursOfSleep: editedHours,
            feeling: editedFeeling,
            description: editedDescription,
            created: sameDate,
            _id: sameID
        }

        // we are using the html method to SET the html contents of each element in the set of matched elements
        const newInput = editedLogInput.html(generateSleepLog(newLogObj));
        putSleepLog(SLEEPLOG_ENDPOINT + '/' + sameID, editedHours, editedFeeling, editedDescription, getSleepLogs);
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
    return `
    <div class="log-container" logID="${log._id}">
        <h3 class="date">${moment(log.created).format('LLLL').slice(0, -7)}</h3>
        <p class="hours">${log.hoursOfSleep} Hours</p>
        <p class="feeling">${log.feeling}</p>
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
        const sleepFeeling = $('input[name=feeling]:checked').val();
        const sleepLogDescription = $(event.currentTarget).find('.js-sleep-log');
        const sleepLogText = sleepLogDescription.val();

        postSleepLog(SLEEPLOG_ENDPOINT, hoursOfSleep, sleepFeeling, sleepLogText, getSleepLogs);
        sleepLogDescription.val('');
    });
}

function navLogIn() {
    $('body').on('click', '.nav-log-in', function(event) {
        $('.create-account').hide();
        $('.h3').hide();
        $('header').hide();
        $('.sleep-info').hide();
        $('.sign-up').hide();
        $('.sign-up-here-button').hide();
        $('.log-in').show();
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
        $('navigation').hide();
        $('.log-in').hide();
        $('.h3').hide();
        $('.create-account').hide();
        $('header').show();
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

function signUp() {
    $('.create-account').hide();
    $('body').on('click', '.sign-up-here-button', function(event) {
        $('header').hide();
        $('.sleep-info').hide();
        $('.sign-up').hide();
        $('.create-account').show();
        $('.sign-up-here-button').hide();
    });
}

function navSignUp() {
    $('.create-account').hide();
    $('body').on('click', '.nav-sign-up', function(event) {
        $('header').hide();
        $('.sleep-info').hide();
        $('.sign-up').hide();
        $('.sign-up-here-button').hide();
        $('.log-in').hide();
        $('.create-account').show();
    });
}

$(function() {
    navLogIn();
    navSignUp();
    signUp();
    logIn();
    createAccount();
    updateEventListener();
    deleteEventListener();
    bindEventListeners();
    getSleepLogs();
});