'use strict';

const SLEEPLOG_ENDPOINT = '/api/logs';

const STORE = [];
console.log(STORE);
// gets current state of database & renders onto the DOM

// when make get request, put that data in the STORE as well
// in callback, add those elements in my STORE
function getSleepLogs() {
    $.get(SLEEPLOG_ENDPOINT, function(data) {
        for (let i=0; i<=data.length; i++) {
        const getData = {
            hoursOfSleep: data[i].hoursOfSleep,
            feeling: data[i].feeling,
            description: data[i].description,
            _id: data[i]._id,
            isEditing: false
            }  
           STORE.push(getData);
           renderSleepLog(STORE);
        }
    });
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
        <button class="save-log" type="submit" role="button">Save</button>
        <button class="cancel-log" role="button">Cancel</button>
    </form>
    `;
}


function updateEventListener() {
    // clicking on the update button
    $('.sleep-logs-list').on('click', '.update-log', function(event) {
        const toUpdateLogInput = $(event.currentTarget).closest('.log-container');
        const currentDate = toUpdateLogInput.find('.date').text();
        const currentHours = toUpdateLogInput.find('.hours').text().replace(' Hours', '').replace(' hours', '');
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
        // $('.log-container').append(currentInput);
        
        // STORE.isEditing = !STORE.isEditing;
        // console.log(STORE);
        
    // clicking on the cancel button if updating
    $('.sleep-logs-list').on('click', '.cancel-log', function(event) {
        event.preventDefault();
        const cancelLog = $(event.currentTarget).closest('.updated-log-js');
        const containerID = cancelLog.attr('logID');
        const targetObj = STORE.find(function(object) {
            if (object._id === containerID) {
                return object;
            }
        });
        const cancelledInput = cancelLog.html(generateSleepLog(targetObj));
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

        const updatedObj = STORE.find(function(object) {
            if (object._id === newLogObj._id && object.hoursOfSleep !== editedHours || object.feeling !== editedFeeling || object.description !== editedDescription) {
                renderSleepLog(newLogObj);
            }
        });
        
        // we are using the html method to SET the html contents of each element in the set of matched elements
        // const newInput = editedLogInput.html(editedLog);
        putSleepLog(SLEEPLOG_ENDPOINT + '/' + sameID, editedHours, editedFeeling, editedDescription, updatedObj);
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
        console.log(logID);
        const targetObj = STORE.find(function(object) {
            console.log(object._id);
            if (object._id === logID) {
                return object;
            }
        });
        const indexOfTargetObj = STORE.indexOf(targetObj);
        const newSTORE = STORE.splice(indexOfTargetObj, 1);
        deleteSleepLog(SLEEPLOG_ENDPOINT + '/' + logID, renderSleepLog(STORE));
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
        <h3 class="date">${moment(log.created).format('LLLL').slice(0, -8)}</h3>
        <p class="hours">${log.hoursOfSleep} Hours</p>
        <p class="feeling">${log.feeling}</p>
        <p class="description">${log.description}</p>
        <button class="update-log" role="button">Update</button>
        <button class="delete-log" type="submit" role="button">Delete</button>
    </div>
    `;
}

function submitSleepLog() {
    $('.new-entry').on('submit', function(event) {
        event.preventDefault();
        const sleepHours = $(event.currentTarget).find('#hoursOfSleep');
        const totalHoursSlept = sleepHours.val();
        const sleepFeeling = $('input[name=feeling]:checked').val();
        const sleepLogDescription = $(event.currentTarget).find('.js-sleep-log');
        const sleepLogText = sleepLogDescription.val();

        const submitLog = {
            hoursOfSleep: totalHoursSlept,
            feeling: sleepFeeling,
            description: sleepLogText,
            isEditing: false
        }

        postSleepLog(SLEEPLOG_ENDPOINT, totalHoursSlept, sleepFeeling, sleepLogText, function(data) {
            STORE.push(data);
            renderSleepLog(STORE);
        });
        
        sleepLogDescription.val('');
        sleepHours.val('');
        $('#refreshed').prop('checked', false);
        $('#tired').prop('checked', false);
        $('#average').prop('checked', false);
        $('#littleMore').prop('checked', false);
    });
}

function navLogIn() {
    $('.createAccount').hide();
    $('body').on('click', '.nav-log-in', function(event) {
        $('navigation').hide();
        $('.createAccount').hide();
        $('header').hide();
        $('.sleep-info').hide();
        $('.sign-up').hide();
        $('.sign-up-here-button').hide();
        $('.log-in').show();
    });
}

function logIn() {
    $('.createAccount').hide();
    $('.logIn').on('submit', function(event) {
        event.preventDefault(); 
        const existingLogin = $(event.currentTarget).find('#existingUsername');
        const existingUsername = existingLogin.val();
        const yourPassword = $(event.currentTarget).find('#existingPassword');
        const existingPassword = yourPassword.val();
        requestJWT(existingUsername, existingPassword);
    });
}

function logOut() {
    $('.nav-logout').on('click', function(event) {
        localStorage.clear();
        $('.new-sleep-entry').hide();
        $('.all-sleep-entries').hide();
        $('.log-in').show();
    });
}

function enterApp() {
    $('navigation').hide();
    $('.log-in').hide();
    $('header').hide();
    $('.createAccount').hide();
    $('.new-sleep-entry').show();
    $('.all-sleep-entries').show();
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
            alert('Login failed..');
        }
    });
}

function createAccount() {
    $('.new-sleep-entry').hide();
    $('.all-sleep-entries').hide();
    $('.log-in').hide();
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
                alert('Password must be at least 8 characters long..');
            }
        });
        login.val('');
        createPassword.val(''); 
    });
    $('.createAccount').on('click', '.login-here', function(event) {
        $('.createAccount').hide();
        $('.log-in').show();
    });
    $('.log-in').on('click', '.signup-here', function(event) {
        $('.log-in').hide();
        $('.createAccount').show();
    })
}

function signUp() {
    $('body').on('click', '.sign-up-here-button', function(event) {
        $('navigation').hide();
        $('header').hide();
        $('.sleep-info').hide();
        $('.sign-up').hide();
        $('.sign-up-here-button').hide();
        $('.createAccount').show();
    });
}

function navSignUp() {
    $('body').on('click', '.nav-sign-up', function(event) {
        $('navigation').hide();
        $('header').hide();
        $('.sleep-info').hide();
        $('.sign-up').hide();
        $('.sign-up-here-button').hide();
        $('.log-in').hide();
        $('.createAccount').show();
    });
}

$(function() {
    navLogIn();
    navSignUp();
    signUp();
    logOut();
    logIn();
    createAccount();
    updateEventListener();
    deleteEventListener();
    submitSleepLog();
    getSleepLogs();
});