'use strict';

const SLEEPLOG_ENDPOINT = '/api/logs';

let STORE = [];

function getSleepLogs() {
    $.ajax({
        type: 'GET',
        url: SLEEPLOG_ENDPOINT + '/' + localStorage.getItem('id'),
        contentType: 'application/json',
        dataType: 'json',
        headers: {
            'Authorization': "Bearer " + localStorage.getItem('token')
        },
        success: function(data) {
            STORE = [];
            for (let i=0; i<data.length; i++) {
                const getData = {
                    hoursOfSleep: data[i].hoursOfSleep,
                    feeling: data[i].feeling,
                    description: data[i].description,
                    _id: data[i]._id,
                    isEditing: false
                    } 
                   STORE.push(getData);
                }
                renderSleepLog(STORE);
                enterApp();
        }
    });
}

function postSleepLog(path, hoursSlept, sleepFeel, sleepLogText, callback) {
    $.ajax({
        type: 'POST',
        url: path,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
            hoursOfSleep: hoursSlept,
            feeling: sleepFeel,
            description: sleepLogText,
            creator: localStorage.getItem('id')
        }),
        headers: {
            'Authorization': "Bearer " + localStorage.getItem('token')
        },
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
        headers: {
            'Authorization': "Bearer " + localStorage.getItem('token')
        },
        success: callback,
        error: function(err) {
            console.info('There is an error!');
            console.error(err);
        }    
    });
}

function toggleLogEditing(index) {
    STORE.map((log, idx) => {
        log.isEditing = (idx === index ? !log.isEditing : false);
    });
}

function updateEventListener() {
    // clicking on the update button
    $('.sleep-logs-list').on('click', '.update-log', function(event) {
        event.preventDefault();
        const toUpdateLogInput = $(event.currentTarget).closest('.log-container');
        const currentDate = toUpdateLogInput.find('.date').text();
        const currentHours = toUpdateLogInput.find('.hours').text().replace(' Hours', '').replace(' hours', '').replace('hours', '').replace('Hours', '').replace('HOURS', '').replace('Slept : ', '');
        const currentFeeling = toUpdateLogInput.find('.feeling').text().replace('Felt : ', '');
        const currentDescription = toUpdateLogInput.find('.description').text().replace('Comments : ', '');
        const currentID = toUpdateLogInput.attr('logID');
        
        const currentLogObj = {
            hoursOfSleep: currentHours,
            feeling: currentFeeling,
            description: currentDescription,
            created: currentDate,
            _id: currentID
        }

        let currentObject = STORE.find(function(object) {
            if (object._id === currentLogObj._id) {
                return object;
            }
        });
        
       const currentIndex = STORE.indexOf(currentObject);
        STORE.splice(currentIndex, 1);
        STORE.splice(currentIndex, 0, currentLogObj);
         
        toggleLogEditing(currentIndex);
        renderSleepLog(STORE);
            
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

        const cancelObject = Object.assign(targetObj, {isEditing:false});
        const cancelledInput = cancelLog.html(generateSleepLog(targetObj));
    });
    
    // clicking on the save button if updating 
    $('.updated-log-js').on('click', '.save-log', function(event) {
        event.preventDefault();
        const editedLogInput = $(event.currentTarget).closest('.updated-log-js');
        const editedHours = editedLogInput.find('.update-hours').val().replace(' Hours', '').replace(' hours', '').replace('hours', '').replace('Hours', '').replace('HOURS', '').replace('Slept : ', '').replace('Slept ', '');
        const editedFeeling = editedLogInput.find('.update-feeling').val().replace('Felt : ', '').replace('Felt', '');
        const editedDescription = editedLogInput.find('.update-description').val().replace('Comments : ', '').replace('Comments', '');
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
            if (object._id === newLogObj._id) {
                return object;
            }
        });

        const indexOfUpdatedObj = STORE.indexOf(updatedObj);
        STORE.splice(indexOfUpdatedObj, 1);
        STORE.splice(indexOfUpdatedObj, 0, newLogObj);
        const editedInput = editedLogInput.html(generateSleepLog(newLogObj));
        putSleepLog(SLEEPLOG_ENDPOINT + '/' + sameID, editedHours, editedFeeling, editedDescription, editedInput);
          });   
    });
}

function deleteSleepLog(path, callback) {
    $.ajax({
        type: 'DELETE',
        url: path,
        contentType: 'application/json',
        headers: {
            'Authorization': "Bearer " + localStorage.getItem('token')
        },
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
        const targetObj = STORE.find(function(object) {
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
    let allLogs = [];
    allLogs = [].concat(data || []);
    const sleepLogsHTML = allLogs.map(generateSleepLog).join('');
    $('.sleep-logs-list').html(sleepLogsHTML);
}

function generateSleepLog(log) {
    let postHTML = (`
    <div class="log-container" logID="${log._id}">
        <h3 class="date">${moment(log.created).format('LLLL').slice(0, -8)}</h3>
        <p class="hours"><span class="filler">Slept : </span>${log.hoursOfSleep} Hours</p>
        <p class="feeling"><span class="filler">Felt : </span>${log.feeling}</p>
        <p class="description"><span class="filler">Comments : </span>${log.description}</p>
        <button class="update-log" role="button"><i class="fas fa-plus"></i> EDIT</button>
        <button class="delete-log" type="submit" role="button"><i class="fas fa-trash"></i> DELETE</button>
        <div class="line"></div>
    </div>
    `);

    if (log.isEditing) {
        postHTML = (`
        <form class="updated-log-js" logID="${log._id}">
            <h3 class="update-date">${log.created}</h3>
            <input class="update-hours" placeholder="How many hours did you sleep?" value="${log.hoursOfSleep} Hours" aria-label="hours-slept"><br>
            <input class="update-feeling" placeholder="How did you feel after waking up?" value="${log.feeling}" aria-label="feeling-once-awake"><br>
            <textarea class="update-description" placeholder="Additional details?" aria-label="extra-details-about-sleep">${log.description}</textarea><br>
            <button class="save-log" type="submit" role="button"><i class="fas fa-check"></i> SAVE</button>
            <button class="cancel-log" role="button"><i class="fas fa-ban"></i> CANCEL</button>
            <div class="line"></div>
        </form>
        `);
    }
    return postHTML; 
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
        delete localStorage.id;
        delete localStorage.token;
        $('navigation').hide();
        $('.createAccount').hide();
        $('main').hide();
        $('.sleep-info').hide();
        $('.sign-up').hide();
        $('.sign-up-here-button').hide();
        $('.log-in').show();
    });
}

function logIn() {
    $('.createAccount').hide();
    $('.demo-account').hide();
    $('.logIn').on('submit', function(event) {
        event.preventDefault(); 
        const existingLogin = $(event.currentTarget).find('#existingUsername');
        const existingUsername = existingLogin.val();
        const yourPassword = $(event.currentTarget).find('#existingPassword');
        const existingPassword = yourPassword.val();
        requestJWT(existingUsername, existingPassword);
        existingLogin.val('');
        yourPassword.val('');
    });
}

function logOut() {
    $('.nav-logout').on('click', function(event) {
        delete localStorage.token;
        delete localStorage.id;
        $('.new-sleep-entry').hide();
        $('.all-sleep-entries').hide();
        $('.log-in').show();
        $('.demo-account').hide();
    });
}

function enterApp() {
    $('navigation').hide();
    $('.log-in').hide();
    $('main').hide();
    $('.createAccount').hide();
    $('.new-sleep-entry').show();
    $('.all-sleep-entries').show();
}

function generateIncorrectPasswordMessage() {
    return `
    <div class="password-wrong">
        <h3>Sorry, username & / or password is incorrect.</h3>
        <button class="back-to-login-btn" type="submit" role="button">OKAY</button>
    </div>`
}

function generatePasswordTooShort() {
    return `
    <div class="create-account-error">
        <h3 class="account-error-heading">Password must be at least 8 characters long.</h3>
        <button class="back-to-create-btn" type="submit" role="button">OKAY</button>
    </div>`
}

function generateUsernameTaken() {
    return `
    <div class="create-account-error">
        <h3 class="account-error-heading">Username is taken, please try another.</h3>
        <button class="back-to-create-btn" type="submit" role="button">OKAY</button>
    </div>`
}

function generateNoWhitespace() {
    return `
    <div class="create-account-error">
        <h3 class="account-error-heading">Cannot start or end username & / or password with whitespace.</h3>
        <button class="back-to-create-btn" type="submit" role="button">OKAY</button>
    </div>`
}

function backToLogIn() {
    $('html').on('click', '.back-to-login-btn', function(event) {
        $('.password-wrong').hide();
        $('.log-in').show();
    });
}

function backToCreateAcct() {
    $('html').on('click', '.back-to-create-btn', function(event) {
       $('.create-account-error').hide();
       $('.createAccount').show();
    });
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
            localStorage.setItem('id', resultData.userID);
            console.log(resultData);
            $.ajax({
                type: 'GET',
                url: 'api/protected',
                contentType: 'application/json',
                dataType: 'json',
                headers: {
                    'Authorization': "Bearer " + localStorage.getItem('token')
                },
                success: getSleepLogs()
                })
            },
        error: function(err) {
            console.info('Password is incorrect!');
            console.error(err);
            $('.incorrect-password').html(generateIncorrectPasswordMessage);
            $('.log-in').hide();
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
            success: function() {
                requestJWT(username, password)
            },
            error: function(err) {
                console.info('There is an error');
                console.error(err);
                $('.createAccount').hide();
                $('.password-wrong').hide();
                if (err.responseJSON.message === 'Username already taken') {
                    $('.account-error').html(generateUsernameTaken);
                } else if (err.responseJSON.message === 'Must be at least 8 characters long') {
                    $('.account-error').html(generatePasswordTooShort);
                } else if (err.responseJSON.message === 'Cannot start or end with whitespace') {
                    $('.account-error').html(generateNoWhitespace);
                }
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
        $('main').hide();
        $('.sleep-info').hide();
        $('.sign-up').hide();
        $('.sign-up-here-button').hide();
        $('.createAccount').show();
    });
}

function navSignUp() {
    $('body').on('click', '.nav-sign-up', function(event) {
        $('navigation').hide();
        $('main').hide();
        $('.sleep-info').hide();
        $('.sign-up').hide();
        $('.sign-up-here-button').hide();
        $('.log-in').hide();
        $('.createAccount').show();
    });
}

function demo() {
    $('body').on('click', '.nav-demo', function(event) {
        $('navigation').hide();
        $('main').hide();
        $('.sleep-info').hide();
        $('.sign-up-here-button').hide();
        $('.log-in').show();
        $('.demo-account').show();
    });
}

$(function() {
    demo();
    backToCreateAcct(); 
    backToLogIn();
    navLogIn();
    navSignUp();
    signUp();
    logOut();
    logIn();
    createAccount();
    updateEventListener();
    deleteEventListener();
    submitSleepLog();
});