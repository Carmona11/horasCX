const asignacion = {
    "GS": { nombre: "Gestión Success (Squad Leads + Weeklies Squads)", categoria: "Success - NC / LC" },
    "TO": { nombre: "Training: Onboarding Cliente", categoria: "Success - NC / LC" },
    "SC": { nombre: "Seguimiento Cliente (En vivo, trabajo interno) (CSM)", categoria: "Success - NC / LC" },
    "TP": { nombre: "Training: Entrenamientos post implementación", categoria: "Success - NC / LC" },
    "AFI": { nombre: "Acompañamiento en Fase Implementación (USM)", categoria: "Services" },
    "AFP": { nombre: "Acompañamiento en Fase Post Implementación (USM)", categoria: "Services" },
    "BC": { nombre: "BaaS (Costrucción casos de uso) (USM)", categoria: "Services" },
    "GP": { nombre: "Gestión de proyecto (PM)", categoria: "Services" },
    "DS": { nombre: "Diseño de solución (SA)", categoria: "Services" },
    "MV": { nombre: "Migraciones (Viabilidad: Configuración / BaaS)", categoria: "Services" },
    "MG": { nombre: "Migraciones (Viabilidad: Gestión Proyecto)", categoria: "Services" },
    "MD": { nombre: "Migraciones (Viabilidad: Diseño de solución SA)", categoria: "Services" },
    "MI": { nombre: "Migraciones (Implementación: Gestión Proyecto)", categoria: "Services" },
    "MCB": { nombre: "Migraciones (Implementación: Configuración / BaaS)", categoria: "Services" },
    "MS": { nombre: "Migraciones (Implementación: Diseño de solución SA)", categoria: "Services" },
    "GI": { nombre: "Gestión Integraciones (Weekly + Dailies)", categoria: "Integrations" },
    "II": { nombre: "Integración: Implementación", categoria: "Integrations" },
    "IS": { nombre: "Integración: Soporte", categoria: "Integrations" },
    "IE": { nombre: "Integración: Evolutivos", categoria: "Integrations" },
    "GS": { nombre: "Gestión Support (Weekly + Dailies)", categoria: "Support - NC / LC" },
    "ST": { nombre: "Soporte Técnico", categoria: "Support - NC / LC" },
    "WO": { nombre: "Weeklies Otros Frentes (Producto, Tech, etc)", categoria: "Weeklies Otros Frentes (Producto, Tech, etc)" },
    "AH": { nombre: "All Hands", categoria: "Reuniones Internas" },
    "CH": { nombre: "Chapters", categoria: "Reuniones Internas" },
    "11": { nombre: "1:1s", categoria: "Reuniones Internas" },
    "SO": { nombre: "Sophos", categoria: "Reuniones Internas" },
    "CP": { nombre: "Capacitación propia (recibida)", categoria: "Onboarding Interno" },
    "CA": { nombre: "Capacitación a otros (dada)", categoria: "Onboarding Interno" },
    "SC": { nombre: "Shadowing con clientes", categoria: "Onboarding Interno" },
    "SU": { nombre: "Simetrik University / Probar funcionalidades / Stageton / QC - QA (Aportes al No Code)", categoria: "Producto" },
    "PH": { nombre: "Prehandoff / Handoff / UX - UI (Aportes al No Code)", categoria: "Producto" },
    "MB": { nombre: "Metabase (Aportes a BI - Producto)", categoria: "Producto" },
    "POC": { nombre: "POC", categoria: "POC" },
    "PA": { nombre: "Proyecto: Asignación de horas", categoria: "Proyectos e iniciativas" },
    "PN": { nombre: "Pruebas New Hire", categoria: "Proyectos e iniciativas" },
    "IS": { nombre: "Implementación y capacitación SalesForces", categoria: "Proyectos e iniciativas" },
    "DO": { nombre: "Diseño Onboarding (Interno, Clientes, Partners)", categoria: "Proyectos e iniciativas" },
    "VF": { nombre: "Vacaciones, Festivos, Incapacidades, Permisos", categoria: "Vacaciones" },
    "NA": { nombre: "No asignable", categoria: "No asignable" }
}


// Asignamos API KEY y CLIENT ID para acceder a los servicios de Google.
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

        await getUserData();

        document.getElementById('mod1').hidden = true;
        document.getElementById('wrap-signout').removeAttribute("hidden");
        document.getElementById('authorize_button').innerText = 'Refresh';
        document.getElementById('mod2').removeAttribute("hidden");

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
        document.getElementById('mod2').hidden = true;
        document.getElementById('cxTable').hidden = true;
        document.getElementById('signout_button').style.visibility = 'hidden';
        document.getElementById('mod1').hidden = false;
        alert("ud se ha salido")
        userName.innerHTML = ""
    }
}

// Solo para imprimir el nombre del usuario :D 
async function getUserData() {
    let response;
    try {
        const request = {
            'calendarId': 'primary',
            'maxResults': 1,
            'showDeleted': false,
            'showDelegated': false
        };
        response = await gapi.client.calendar.events.list(request);

        let userEmail = (response.result.summary);

        function getNameAndLastname(email) {
            let parts = email.split(".");
            let name = parts[0];
            let lastname = parts[1].split("@")[0];
            return { name: name, lastname: lastname };
        }

        let user = (getNameAndLastname(userEmail));

        const userName = document.getElementById("username");
        userName.innerHTML += user.name + ' ' + user.lastname + '!';
        userName.removeAttribute("hidden")

    } catch (err) {
        document.getElementById('content').innerText = err.message;
        return;
    }
}


// Tomamos los inputs de fechas y ejecutamos la función para obtener los eventos
function searchEvents() {
    document.getElementById('cxTable').hidden = true;
    const table = document.getElementById("cxHoras")
    table.innerHTML = " "

    startDate = new Date(document.getElementById("startDate").value);
    endDate = new Date(document.getElementById("endDate").value);
    console.log(startDate);
    console.log(endDate);

    listUpcomingEvents(startDate, endDate);
}

// Aca es donde llamamos todos los eventos
async function listUpcomingEvents(start, end) {
    let response;
    try {
        const request = {
            'calendarId': 'primary',
            'timeMin': start.toISOString(),
            'timeMax': end.toISOString(),
            'showDeleted': false,
            'showDelegated': false,
            'singleEvents': true,
            'orderBy': 'startTime',
            'showDeclined': false
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

    let horasCx = {};

    const table = document.getElementById("cxHoras")

    horasCx.user = results.summary;
    horasCx.timeZone = results.timeZone;
    horasCx.activity = {};

    console.log(response)
    console.log(results)

    for (let k in results.items) {

        // We don't take into account those OOO events
        let checker = results.items[k].summary;
    
        if (
            checker.toLowerCase().includes("no disponible") ||
            checker.toLowerCase().includes("ooo") ||
            checker.toLowerCase().includes("almuerzo") ||
            checker.toLowerCase().includes("lunch time") ||
            checker.toLowerCase().includes("lunch") ||
            checker.toLowerCase().includes("out of office")
        ) {
            continue;
        }
        else {
    
            // Filter out those canceled events 
            for (let j in results.items[k].attendees) {
                if (
                    results.items[k].attendees[j].email === horasCx.user &&
                    results.items[k].attendees[j].responseStatus === 'accepted'
                )
                // Once confirmed that it is not an OOO nor declined
                {
                    // 1. Extract the name of the event.
                    horasCx.activity[k] = {
                        eventName: results.items[k].summary
                    }
    
                    // 2. Extract the beginning and end date.
                    startString = results.items[k].start.dateTime;
                    eventDate = moment(startString).format("MM-DD-YYYY");
    
                    endString = results.items[k].end.dateTime;
    
                    // 2.1 Calculate the duration of the event.
                    let date1 = new Date(startString);
                    let date2 = new Date(endString);
                    let eventDuration = ((date2.getTime() - date1.getTime()) / (1000 * 60)) / 60;
    
                    // 2.2 Load to the object
                    horasCx.activity[k].eventDate = eventDate;
                    horasCx.activity[k].eventDuration = parseFloat(eventDuration.toFixed(1));;
                    
                    // 3. Extract client's name and info from the event
                    // 3.1 Resolve if it is assignable
                    let summary = horasCx.activity[k].eventName
                    let isClient = summary.substring(0, summary.indexOf("-"));
    
                    // 3.2 Extract code from the activity
                    let code = summary.split(" ");
                    let codeLookup = code[code.length - 1];
    
                    // 3.3 Load to the object.
                    // If it is not assignable
                    if (isClient.length <= 2 || isClient === null) {
                        horasCx.activity[k].activity = "No Asignable"
                        horasCx.activity[k].type = "No Asignable"
                        horasCx.activity[k].client = ""
    
                        // Add the code from the event
                        if (codeLookup in asignacion) {
                            horasCx.activity[k].isAttri = asignacion[codeLookup].nombre
                        } else {
                            horasCx.activity[k].isAttri = "Código no existe"
                        }
                    }
                    else {
                        horasCx.activity[k].client = isClient
                        horasCx.activity[k].type = "Asignable"
                        horasCx.activity[k].isAttri = ""
    
                        if (codeLookup in asignacion) {
                            horasCx.activity[k].activity = asignacion[codeLookup].nombre
                        } else {
                            horasCx.activity[k].activity = "Código no existe"
                        }
                    }
                }
                else {
                    continue
                }
            }
        }
    }
    
    for (k in horasCx.activity) {
        table.innerHTML += `<tr>
    <td id ="r ${k + 1}">${horasCx.activity[k].eventDate} </td>
    <td id ="r ${k + 1}">${horasCx.activity[k].eventName} </td>
    <td id ="r ${k + 1}">${horasCx.activity[k].type} </td>
    <td id ="r ${k + 1}">${horasCx.activity[k].activity} </td>
    <td id ="r ${k + 1}">${horasCx.activity[k].client} </td>
    <td id ="r ${k + 1}">${horasCx.activity[k].isAttri} </td>
    <td id ="r ${k + 1}">${horasCx.activity[k].eventDuration}</td>
    <td id ="r ${k + 1}" hidden><button onclick = "editRow(${k + 1})" class="btn btn-outline-warning")>Edit</button></td>
    </tr>`
    }

    console.log(horasCx)
}


