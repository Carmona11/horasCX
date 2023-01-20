/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '365078314177-9ra77adje1vsre5sg4bv6209pripvsdq.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCrMlZzT8RTF1QvOiYN5OLvL8jCs1YAniY';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.visibility = 'visible';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        document.getElementById('signout_button').style.visibility = 'visible';
        document.getElementById('authorize_button').innerText = 'Refresh';
        document.getElementById('dateForm').removeAttribute("hidden");
        //await listUpcomingEvents();
    };

    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        document.getElementById('content').innerText = '';
        document.getElementById('authorize_button').innerText = 'Authorize';
        document.getElementById('signout_button').style.visibility = 'hidden';
    }
}

function searchEvents() {
    document.getElementById('cxTable').hidden = true;
    const table = document.getElementById("cxHoras")
    table.innerHTML = " "

    startDate = new Date(document.getElementById("startDate").value);
    endDate = new Date(document.getElementById("endDate").value);


    listUpcomingEvents(startDate, endDate);

}

async function listUpcomingEvents(start, end) {
    let response;
    try {
        const request = {
            'calendarId': 'primary',
            'timeMin': start.toISOString(),
            'timeMax': end.toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'orderBy': 'startTime',
        };
        response = await gapi.client.calendar.events.list(request);
        document.getElementById('cxTable').removeAttribute("hidden")
    } catch (err) {
        document.getElementById('content').innerText = err.message;
        return;
    }

    const results = response.result

    const events = response.result.items;
    if (!events || events.length == 0) {
        document.getElementById('content').innerText = 'No se encontraron eventos.';
        return;
    }

    let userEvents = {};

    const table = document.getElementById("cxHoras")

    userEvents.timezone = results.timeZone;
    userEvents.user = results.summary;
    userEvents.activity = {};

    console.log(events)

    for (let k in results.items) {

        //Extraemos el nombre del evento y validamos que este confirmado.
        userEvents.activity[k] = {
            eventName: results.items[k].summary,
            status: results.items[k].status
        }

        //Extraemos nombre del cliente.
        let client = userEvents.activity[k].eventName
        let isClient = client.substring(0, client.indexOf("-"));

        if (isClient.length <= 1) {
            userEvents.activity[k].client = "No Asignable"
            userEvents.activity[k].activity = "No Asignable"
            userEvents.activity[k].type = "No Asignable"

            let code = client.split(" ");
            for (let i = code.length - 1; i >= 0; i--) {
                if (code[i].length === 3) {
                    break;
                } else {
                    userEvents.activity[k].isAttri = "revisar código"
                }
            }
        } else {
            userEvents.activity[k].client = isClient
            userEvents.activity[k].type = "Asignable"
            userEvents.activity[k].isAttri = " "
            let code = client.split(" ");
            for (let i = code.length - 1; i >= 0; i--) {
                if (code[i].length === 3) {
                    userEvents.activity[k].activity = code[i];
                    break;
                } else {
                    userEvents.activity[k].activity = "revisar código"
                }
            }
        }

        // Extraemos la fecha-hora de inicio cada reunión
        startString = results.items[k].start.dateTime;

        // Obtenemos la fecha y la incluimos al objeto
        eventDate = moment(startString).format("DD-MM-YYYY");
        userEvents.activity[k].date = eventDate

        //Extraemos la fecha-hora final de cada reunión
        endString = results.items[k].end.dateTime

        // Calculamos la diferencia de las horas y las agregamos al objetos
        let date1 = new Date(startString);
        let date2 = new Date(endString);
        let eventDuration = ((date2.getTime() - date1.getTime()) / (1000 * 60)) / 60;
        userEvents.activity[k].duration = eventDuration.toFixed(2);

        // Incluimos hora de inicio y hora final
        let startTime = startString.substring(11, 13) + ":" + startString.substring(14, 16);
        let endTime = endString.substring(11, 13) + ":" + endString.substring(14, 16);
        userEvents.activity[k].startTime = startTime
        userEvents.activity[k].endTime = endTime


        table.innerHTML += `<tr>
        <td>${userEvents.activity[k].eventName} </td>
        <td>${userEvents.activity[k].type} </td>
        <td>${userEvents.activity[k].activity} </td>
        <td>${userEvents.activity[k].client} </td>
        <td>${userEvents.activity[k].isAttri} </td>
        <td>${userEvents.activity[k].duration}</td>
        <td>${userEvents.activity[k].date}</td>
        <td>${userEvents.activity[k].startTime}</td>
        <td>${userEvents.activity[k].endTime}</td>
        </tr>`
    }

    console.log(userEvents)
}

