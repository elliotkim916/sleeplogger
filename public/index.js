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

function toggleLogEditing(index) {
    STORE.map((log, idx) => {
        log.isEditing = (idx === index ? !log.isEditing : false);
    });
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

        let currentObject = STORE.find(function(object) {
            if (object._id === currentLogObj._id) {
                return object;
            }
        });

       const currentIndex = STORE.indexOf(currentObject);
        //    const obj = Object.assign(currentLogObj, {isEditing:true});
        //    const currentInput = toUpdateLogInput.html(generateSleepLog(obj));
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

        // const cancelIndex = STORE.indexOf(targetObj);
        const cancelObject = Object.assign(targetObj, {isEditing:false});
        const cancelledInput = cancelLog.html(generateSleepLog(cancelObject));
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
            if (object._id === newLogObj._id) {
                return object;
            }
        });

        const indexOfUpdatedObj = STORE.indexOf(updatedObj);
        STORE.splice(indexOfUpdatedObj, 1);
        STORE.splice(indexOfUpdatedObj, 0, newLogObj);

        const editedObject = Object.assign(newLogObj, {isEditing:false});
        const editedInput = editedLogInput.html(generateSleepLog(editedObject));

        // we are using the html method to SET the html contents of each element in the set of matched elements
        putSleepLog(SLEEPLOG_ENDPOINT + '/' + sameID, editedHours, editedFeeling, editedDescription, editedInput);
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
    let postHTML = (`
    <div class="log-container" logID="${log._id}">
        <h3 class="date">${moment(log.created).format('LLLL').slice(0, -8)}</h3>
        <p class="hours">${log.hoursOfSleep} Hours</p>
        <p class="feeling">${log.feeling}</p>
        <p class="description">${log.description}</p>
        <button class="update-log" role="button">Update</button>
        <button class="delete-log" type="submit" role="button">Delete</button>
    </div>
    `);

    if (log.isEditing) {
        postHTML = (`
        <form class="updated-log-js" logID="${log._id}">
            <h3 class="update-date">${log.created}</h3>
            <input class="update-hours" placeholder="How many hours did you sleep?" value="${log.hoursOfSleep}" aria-label="hours-slept"><br>
            <input class="update-feeling" placeholder="How did you feel after waking up?" value="${log.feeling}" aria-label="feeling-once-awake"><br>
            <textarea class="update-description" placeholder="Additional details?" aria-label="extra-details-about-sleep">${log.description}</textarea><br>
            <button class="save-log" type="submit" role="button">Save</button>
            <button class="cancel-log" role="button">Cancel</button>
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
        localStorage.clear();
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
        <button class="back-to-login-btn" type="submit" role="button">Okay</button>
    </div>`
}

function backToLogIn() {
    $('html').on('click', '.back-to-login-btn', function(event) {
        $('.password-wrong').hide();
        $('.log-in').show();
    });
}

function generatePasswordTooShort() {
    return `
    <div class="password-short">
        <h3>Password must be at least 8 characters long.</h3>
        <button class="back-to-create-btn" type="submit" role="button">Okay</button>
    </div>`
}

function backToCreateAcct() {
    $('html').on('click', '.back-to-create-btn', function(event) {
       $('.password-short').hide();
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
            $('.incorrect').html(generateIncorrectPasswordMessage);
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
            success: requestJWT(username, password),
            error: function(err) {
                console.info('There is an error');
                console.error(err);
                $('.tooShort').html(generatePasswordTooShort);
                $('.createAccount').hide();
                $('.password-wrong').hide();
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
    getSleepLogs();
});