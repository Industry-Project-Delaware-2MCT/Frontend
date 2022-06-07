/*if('serviceWorker' in navigator) {
    navigator.serviceWorker
    .register('./sw.js')
    .then(function() { 
        console.log('Service Worker Registered'); 
    });
}*/

/*==========================
Service worker code
===========================*/
function invokeServiceWorkerUpdateFlow(registration) {
    // TODO implement your own UI notification element
    /*notification.show("New version of the app is available. Refresh now?");
    notification.addEventListener('click', () => {
        if (registration.waiting) {
            // let waiting Service Worker know it should became active
            registration.waiting.postMessage('SKIP_WAITING')
        }
    })*/
    registration.waiting.postMessage('SKIP_WAITING')
}

if ('serviceWorker' in navigator) {
    // wait for the page to load
    window.addEventListener('load', async () => {
        // register the service worker from the file specified
        const registration = await navigator.serviceWorker.register('./sw.js')

        // ensure the case when the updatefound event was missed is also handled
        // by re-invoking the prompt when there's a waiting Service Worker
        if (registration.waiting) {
            invokeServiceWorkerUpdateFlow(registration)
        }

        // detect Service Worker update available and wait for it to become installed
        registration.addEventListener('updatefound', () => {
            if (registration.installing) {
                // wait until the new Service worker is actually installed (ready to take over)
                registration.installing.addEventListener('statechange', () => {
                    if (registration.waiting) {
                        // if there's an existing controller (previous Service Worker), show the prompt
                        if (navigator.serviceWorker.controller) {
                            invokeServiceWorkerUpdateFlow(registration)
                        } else {
                            // otherwise it's the first install, nothing to do
                            console.log('Service Worker initialized for the first time')
                        }
                    }
                })
            }
        })

        let refreshing = false;

        // detect controller change and refresh the page
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                window.location.reload()
                refreshing = true
            }
        })
    })
}

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
      console.log("updated");
      self.skipWaiting();
  }
});

/*==========================*/

let nurseName = "test";

const init = () => {
    console.log("init");
    
    if(window.location.href.includes("index.html")) {
        checkConnection();
        localStorage.clear();
        warmup();
        console.log('Initially ' + (window.navigator.onLine ? 'on' : 'off') + 'line');

    }
    else if(window.location.href.includes("LoginPage.html")) {
        checkConnection();
        firstName = document.querySelector('.js-firstname');
	    lastName = document.querySelector('.js-lastname'); 
        firstNameErrormessage = document.querySelector('.js-firstNameErrormessage');
        lastNameErrormessage = document.querySelector('.js-lastNameErrormessage');
        loginForm = document.querySelector('.js-login');
        errorText = document.querySelector(".js-errormessage");
        firstName.addEventListener('input', removeImageOnInput);
        lastName.addEventListener('input', removeImageOnInput);
        document.onclick = function(event) {
            let illustration = document.querySelector('.js-illustration');
            illustration.classList.remove('u-hide');
        }
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            Login();
        });
    }else if(window.location.href.includes("PatientPage.html")) {
        checkConnection();
        controlLogin();
        greeting = document.querySelector('.js-greeting');
        showPatientName();
        errorMessage = document.querySelector(".js-errormessage");
        cameraButton = document.querySelector('.js-cameraButton');
        cameraButton.addEventListener('click', function(e) {
            patientPage = document.querySelector('.js-page');
            barcodePopup = document.querySelector('.js-barcodePopup');
            cancelButton = document.querySelector('.js-barcode-cancel');
            
            openBarcodeScanner();
        });
    } else if(window.location.href.includes("NFCpage.html")) {
        checkConnection();
        errorText = document.querySelector(".js-errortext");
        title = document.querySelector(".js-title");
        rfid = document.querySelector(".js-rfid");
        scanButton = document.querySelector(".js-scanButton");
        checkNFCPermissions();
    }else if(window.location.href.includes("MedicationPage.html")) {
        checkConnection();
        controlLogin();
        getPatientInfo();
        
        input = document.getElementById("cameraFileInput");
        input.addEventListener("change", function () {
            convertToBase64(input);
        });
        errorText = document.querySelector(".js-errormessage");
        patientName = document.querySelector(".js-patientName");
        patientMedication = document.querySelector(".js-medication");
        

    }else if(window.location.href.includes("PatientInfoPage.html")) {
        checkConnection();
        controlLogin();
        patientLoginForm = document.querySelector('.js-patientlogin');
        patientPage = document.querySelector('.js-page');
        firstName = document.querySelector('.js-firstname');
	    lastName = document.querySelector('.js-lastname'); 
        firstNameErrormessage = document.querySelector('.js-firstNameErrormessage');
        lastNameErrormessage = document.querySelector('.js-lastNameErrormessage');
        errorText = document.querySelector(".js-errormessage");
        patientLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            patientLogin();
        });


    }else if(window.location.href.includes("noNetwork.html")) {
        checkConnection();
        networkbutton = document.querySelector('.js-checkConnection');
        networkbutton.addEventListener('click', function(e) {
            checkConnection();
        });
    
    }else if(window.location.href.includes("")) {
        window.location.href = window.location.origin + "/Frontend/index.html";
    }
}


/*==========================
API call to warmup the server
===========================*/

const warmup = async () => {
    console.log("fetching");
    //'Hello World' api call to warm up the server (= start up server after being idle for a while)
    await fetch("https://industryprojectapi.azurewebsites.net/");
}

/*==========================
Check network connection
===========================*/

const checkConnection = async () => {
    console.log("checking connection:"+ window.navigator.onLine);
    if(window.navigator.onLine) {
        console.log("online");
        if(window.location.href.includes("noNetwork.html")){
            window.location.href = window.location.origin + "/Frontend/index.html";
        }
        
    }else{
        console.log("no connection");
        if(!window.location.href.includes("noNetwork.html")){
            window.location.href = window.location.origin + "/Frontend/noNetwork.html";
        }
        
    }
}

/*
==========================
USER AUTHENTICATION
==========================
*/
const controlLogin = async () => {
    if(localStorage.getItem("nurseId") == null) {
        window.location.href = window.location.origin + "/Frontend/index.html";
    }
    console.log("Logged in");
}

const Login = async () => {
    
    if(checkInputs()) {
        authenticate(firstName.value, lastName.value);
    }
};

const authenticate = async (firstname, lastname) => {
    checkConnection();
    
    var data = {
        firstname: firstname,
        lastname: lastname
    };

    console.log("fetching");

    fetch("https://industryprojectapi.azurewebsites.net/api/authenticatie/name", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => checkLogin(response))
    .then(data => {
        console.log(data);
        localStorage.setItem("firstName", data.first_name);
        localStorage.setItem("lastName", data.last_name);
        localStorage.setItem("nurseId", data._id);
        localStorage.setItem("apiToken", data.api_token);
    })
    .catch(error => console.log('error', error));
}

const authenticateByNFC = async (nfcSerialNumber) => {
    checkConnection();
    
    var data = {
        nfc_serialnumber: nfcSerialNumber
    };

    console.log("fetching");

    fetch("https://industryprojectapi.azurewebsites.net/api/authenticatie/nfc", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => checkLogin(response))
    .then(data => {
        console.log(data);
        localStorage.setItem("firstName", data.first_name);
        localStorage.setItem("lastName", data.last_name);
        localStorage.setItem("nurseId", data._id);
        localStorage.setItem("apiToken", data.api_token);
    })
    .catch(error => console.log('error', error));
}

const checkLogin = (response, method) => {
    console.log(response);
    
    if(response.status == 200) {
        console.log("login succes");
        console.log(window.location.href);
        window.location.href = window.location.origin + "/Frontend/PatientPage.html";
        
    } else {
        console.log("login failed");
        console.log(response.status);
        errorText.innerHTML = "Login niet gelukt, foute credentials";
        errorText.style.color = 'crimson';
        if(window.location.href.includes("NFCpage.html")) {
            rfid.classList.remove('c-rfid-animate-green');
        }
        if(window.location.href.includes("LoginPage.html")) {
            firstName.value = "";
            lastName.value = "";
        }
    }

    return response.json();

}
/*==========================
PATIENT LOGIN
===========================*/
const patientLogin = async () => {
    
    if(checkInputs()) {
        getPatient(firstName.value, lastName.value);
    }
};

const getPatient = async (firstname, lastname) => {
    checkConnection();

    console.log("fetching");

    fetch("https://industryprojectapi.azurewebsites.net/api/patient/name/"+ firstname +"/"+ lastname, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("apiToken"),
            'Content-Type': 'application/json',
        },
    })
    .then(response => showPatientInfo(response))
    .then(data => {
        console.log(data);
        localStorage.setItem("patientId", data._id);
        localStorage.setItem("patientName", data.first_name);
        getLatestPatientAdministered();

    })
    .catch(error => console.log('error', error));
}

const checkPatientLogin = (response, method) => {

    if(response.status == 200) {
        console.log("login succes");
        return response.json();
    } else {
        console.log("login failed");
        console.log(response.status);
        errorText.innerHTML = "Login niet gelukt, foute credentials";
        errorText.style.color = 'crimson';
    }

}
/*==========================
PATIENT INFORMATION
===========================*/

const showPatientName = () => {
    nurseName = localStorage.getItem("firstName");
    greeting.innerHTML = "Hey " + nurseName;
    console.log(nurseName);
}

function setMedicationData(firstName, lastName, medication) {
    patientName.innerHTML = "Voornaam: " + firstName + "<br />Achternaam: " + lastName;
    medication.forEach(item => {
        patientMedication.innerHTML += `<div class="js-scan-medication o-layout o-layout--align-center"><span>${item.medication_name} ${item.dosis}</span></div>`
    });
}

const getPatientInfo = async () => {
    checkConnection();

    console.log("fetching");

    fetch("https://industryprojectapi.azurewebsites.net/api/patient/" + localStorage.getItem("patientId"), {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("apiToken"),
            'Content-Type': 'application/json',
        },
    })
    .then(response => showPatientInfo(response))
    .then(data => {
        console.log(data);
        setMedicationData(data.first_name, data.last_name, data.medication);
        localStorage.setItem("medication", JSON.stringify(data.medication));
        
    })
    .catch(error => console.log('error', error));
}

function showLatestAdministered(data) {

    let date = new Date(data.time_administered * 1000);
    
    var options = { year:'numeric',month:'long',day:'numeric',weekday: "long"};
    let fulldate = date.toLocaleString('nl',options);
    options = { hour:'numeric',minute:'numeric'};
    let time = date.toLocaleString('nl',options);
    let datetime = fulldate + " " + time;

    patientPage.classList.add('o-blur');
    Swal.fire({
        title: '<p class="o-medication--popup">Laatste toediening </p> <p class="o-medication--popup o-medication--popup-subtitle">Toegediend door '+data.nurse_name+'</p><span class="o-medication--popup-date">' + datetime +'</span>',
        html: '<p class="o-medication--popup o-medication--popup-subtitle">Wilt u doorgaan?</p>',
        showCancelButton: true,
        cancelButtonText: 'Neen',
        confirmButtonColor: '#FFFFFF',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ja',
        background: '#4157FF',
        buttonsStyling: false,
          customClass: {
              confirmButton: 'swal-confirm', //insert class here
            cancelButton: 'swal-cancel'
          }
      }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = window.location.origin + "/Frontend/MedicationPage.html";
        }else{
            window.location.href = window.location.origin + "/Frontend/PatientPage.html";
        }
      })

    /*let confirmAction = confirm("Deze patient zijn laatste toediening was op\n" + fulldate + " om " + time + "\nWilt u doorgaan?");
    if (confirmAction) {
        window.location.href = window.location.origin + "/Frontend/MedicationPage.html";
    }else{
        window.location.href = window.location.origin + "/Frontend/PatientPage.html";
    }*/
}  

const getLatestPatientAdministered = async () => {
    checkConnection();

    console.log("fetching");

    fetch("https://industryprojectapi.azurewebsites.net/api/administered/patient/last/" + localStorage.getItem("patientId"), {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("apiToken"),
            'Content-Type': 'application/json',
        },
    })
    .then(response => showPatientInfo(response))
    .then(data => {
        console.log(data);
        if(data == null) {
            window.location.href = window.location.origin + "/Frontend/MedicationPage.html";
            return
        }
        showLatestAdministered(data);
    })
    .catch(error => console.log('error', error));
}

function showPatientInfo(response) {
    if(response.status == 200) {
        console.log("patient info succes");
        return response.json();
    } else {
        console.log("patient info failed");
        console.log(response.status);
        if(window.location.href.includes("PatientPage.html")) {
            errorMessage.innerHTML = "De barcode klopt niet. Probeer alstublieft opnieuw";
            errorMessage.style.color = 'crimson';
        } else {
            errorText.innerHTML = "Login niet gelukt, foute credentials";
            errorText.style.color = 'crimson';
        }
    }
}


/*==========================
MEDICATION INFO
===========================*/

const convertToBase64 = (image) => {
    errorText.innerHTML = "";
    var file = image.files[0];
    var reader = new FileReader();
    reader.onloadend = function() {            
        //split reader.result on "," and keep text after ","
        
        //console.log( reader.result);
        let readFile = reader.result;
        let base64 = readFile.split(",")[1];
        //console.log(base64);
        getMedicationData(base64);

    }
    reader.readAsDataURL(file);
}

const getMedicationData = async (base64image) => {
    checkConnection();
    
    var medication = JSON.parse(localStorage.getItem("medication"));
    var checkmark = '<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>';
    medicationNames = [];
    medication.forEach(item => {
        medicationNames.push(item.medication_name);
    });
    console.log("medications: ",medicationNames);
    console.log("medication: ",medication);
    
    var data = {
        base64String: base64image,
        active_substance:  medicationNames,
    };
    
    camera = document.querySelector(".js-camera");
    loadingIcon = document.querySelector(".js-loading-icon");
    cameraIcon = document.querySelector(".js-camera-icon");
    camera.innerHTML = 'Verwerken...';
    loadingIcon.classList.remove('u-display-none');
    cameraIcon.classList.add('u-display-none');
    input.disabled = true;

    console.log("fetching");

    fetch("https://industryprojectapi.azurewebsites.net/api/analyze/image", {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("apiToken"),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => showMedicationData(response))
    .then(data => {
        console.log(data);
        camera.innerHTML = 'Open camera';
        loadingIcon.classList.add('u-display-none');
        cameraIcon.classList.remove('u-display-none');
        input.disabled = false;
        data.forEach(item => {
            if (!item.succes) {
                console.log("Wrong medication scanned");
                Swal.fire({
                    icon:'error',
                    title:'Oeps...',
                    text: "U heeft de verkeerde medicatie gescand. Gelieve deze niet toe te dienen.",
                    confirmButtonColor: "#658af0",
                    confirmButtonText: 'OK',
                    iconColor: "#f45252",
                });
                errorText.innerHTML = "Foute medicatie gescand: " + item.result.medicine_name + ". Probeer alstublieft opnieuw";
                errorText.style.color = 'crimson';
            } else {
                console.log("succes");
                localStorage.setItem("succes", item.succes);
                console.log("testing " , item)
                medication = document.querySelectorAll(".js-scan-medication");
                medicationNames.forEach(item => {
                    if(medication.textContent.includes(item)) {
                        medication.innerHTML = checkmark + medication.innerHTML;
                    }
                });
                
                errorText.innerHTML = "Scan gelukt!";
                errorText.style.color = 'green';
                document.querySelector(".js-complete").classList.remove("u-display-none");
                cameraIcon.parentElement.classList.add("u-display-none");
            }

        });
        // if (!data.succes) {
        //     console.log("Wrong medication scanned");
        //     Swal.fire({
        //         icon:'error',
        //         title:'Oeps...',
        //         text: "U heeft de verkeerde medicatie gescand. Gelieve deze niet toe te dienen.",
        //         confirmButtonColor: "#658af0",
        //         confirmButtonText: 'OK',
        //         iconColor: "#f45252",
        //     });
        //     errorText.innerHTML = "Foute medicatie gescand: " + data.result.medicine_name + ". Probeer alstublieft opnieuw";
        //     errorText.style.color = 'crimson';
        // } else {
        //     console.log("succes");
        //     localStorage.setItem("succes", data.succes);
        //     medication = document.querySelector(".js-firstmedication");
        //     medication.innerHTML = checkmark + medication.innerHTML;
        //     errorText.innerHTML = "Scan gelukt!";
        //     errorText.style.color = 'green';
        //     document.querySelector(".js-complete").classList.remove("u-display-none");
        //     cameraIcon.parentElement.classList.add("u-display-none");
        // }
    })
    .catch(error => console.log('error', error));
}

function showMedicationData(response) {
    if(response.status == 200) {
        console.log("ocr succes");
        return response.json();
    } else if (response.status == 404) {
        console.log("No medication found");
        errorText.innerHTML = "Geen medicatie herkent of gevonden";
        errorText.style.color = 'crimson';
    } else if(response.status == 409)  {
        console.log("Wrong medication in image");
        errorText.innerHTML = "Er is medicatie teveel gescand! pas op!";
        errorText.style.color = 'crimson';
        return response.json();

    }else {
        console.log("medication data failed");
        errorText.innerHTML = "Er is iets fout gegaan, probeer het later opnieuw";
        errorText.style.color = 'crimson';
    }
}

function complete() {
    console.log("afronden");
    checkConnection();

    if(localStorage.getItem("succes")) {
        Swal.fire({
            title: '<p class="o-medication--popup">Scan afronden?</p>',
            html: '<p class="o-medication--popup o-medication--popup-subtitle">Door op ja te klikken bevestigt u dat u deze medicatie toegediend hebt aan de patient</p>',
            showCancelButton: true,
            cancelButtonText: 'Neen',
            confirmButtonColor: '#FFFFFF',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ja',
            background: '#4157FF',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'swal-confirm', //insert class here
                cancelButton: 'swal-cancel'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                var data = {
                    patient_id: localStorage.getItem("patientId"),
                    patient_name: localStorage.getItem("patientName"),
                    nurse_id: localStorage.getItem("nurseId"),
                    nurse_name: localStorage.getItem("firstName") + " " + localStorage.getItem("lastName")
                };
        
                fetch("https://industryprojectapi.azurewebsites.net/api/administered", {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem("apiToken"),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                })
                .then(response => {
                    if(response.status == 201) {
                        console.log("Administered succes");
                        window.location.href = window.location.origin + "/Frontend/index.html";
                    } else {
                        console.log("Administered failed");
                        errorText.innerHTML = "Er is iets fout gegaan, probeer het later opnieuw";
                        errorText.style.color = 'crimson';
                    }
                })
                .catch(error => {
                    console.log('error', error);
                    errorText.innerHTML = "Er is iets fout gegaan, probeer het later opnieuw";
                    errorText.style.color = 'crimson';
                });       
            }
        })
    } else {
        errorText.innerHTML = "Scan was niet successvol, u kunt niet afronden";
        errorText.style.color = 'crimson';
    }  
}

/*==========================
INPUT VALIDATION
===========================*/

const removeImageOnInput = () => {
    let illustration = document.querySelector(".js-illustration");
    illustration.classList.add("u-hide");
}

const removeWrongInput = () => {
    errorText.innerHTML = "";
    firstName.parentElement.classList.remove('c-empty_input');
    lastName.parentElement.classList.remove('c-empty_input');
    firstNameErrormessage.innerHTML = ""
    lastNameErrormessage.innerHTML = ""
}

const checkInputs = () => {    
    let check = true;

    removeWrongInput();
    
    if (firstName.value.length == 0){
        check = false;
        firstNameErrormessage.innerHTML = "Voornaam mag niet leeg zijn"
        firstName.parentElement.classList.add('c-empty_input');
    }

    if(lastName.value.length == 0) {
        check = false;
        lastNameErrormessage.innerHTML = "Achternaam mag niet leeg zijn"
        lastName.parentElement.classList.add('c-empty_input');
    }
    
    return check;
}



/*==========================
NFC FUNCTIONALITY
===========================*/
const checkNFCPermissions = async () => {
    try{
        const ndef = new NDEFReader();
        const nfcPermissionStatus = await navigator.permissions.query({ name: "nfc" });
        if (nfcPermissionStatus.state === "granted") {
          // NFC access was previously granted, so we can start NFC scanning now.
          scan();
        } else {
            scanButton.classList.remove('u-hide');
            title.classList.add("u-hide");
            errorText.classList.add("u-hide");
            scanButton.onclick = async () => { 
                scanButton.classList.add('u-hide');
                title.classList.remove("u-hide");
                errorText.classList.remove("u-hide");
                scan();
            };
        }
    } 
    catch (error) {
        console.log("Argh! " + error);
        rfid.classList.add('c-rfid-error');
        errorText.innerHTML = "Er is geen NFC reader gevonden, probeer opnieuw of log manueel in";     
        errorText.style.color = 'crimson';
        title.innerHTML = "NFC niet gevonden";
    }
}

const scan = async () => {
    try {
        const ndef = new NDEFReader();
        await ndef.scan();
        console.log("Scanning");
        rfid.classList.remove('c-rfid-error');
        rfid.classList.add('c-rfid-animate');
        
        ndef.addEventListener("readingerror", () => {
            console.log("Argh! Cannot read data from the NFC tag. Try another one?");
            errorText.innerHTML = "Scan niet gelukt, probeer opnieuw of log manueel in";
            errorText.style.color = 'crimson';
        });
        
        ndef.addEventListener("reading", ({ message, serialNumber }) => {
            rfid.classList.add('c-rfid-animate-green');
            authenticateByNFC(serialNumber);
            console.log(`Serial Number: ${serialNumber}`);
        });
    }
    catch (error) {
        console.log("Argh! " + error);
        rfid.classList.add('c-rfid-error');
        errorText.innerHTML = "NFC staat niet aan, probeer opnieuw of log manueel in";     
        errorText.style.color = 'crimson';
        title.innerHTML = "NFC staat niet aan";
    }
  };


/*==========================
BARCODE FUNCTIONALITY
===========================*/

function openBarcodeScanner() {
    console.log("opening scanner");
    patientPage.classList.add("o-blur");
    patientPage.style.zIndex = "-1";
    barcodePopup.classList.remove("u-hide");

    cancelButton.addEventListener('click', function(e) {
        barcodePopup.classList.add("u-hide");
        patientPage.classList.remove("o-blur");
        patientPage.style.zIndex = "1";
        Quagga.stop();
    });
    Quagga.init({
        numOfWorkers: 4,
        frequency: 10,
        locate: true,
        inputStream : {
            name : "Live",
            type : "LiveStream",
            target: document.querySelector('#camera'),
            constraints: {
                facingMode: "environment", // or user
                frameRate: 10,
            }
        },
        decoder : {
            readers : ["code_128_reader"]
        },
        locator: {
            patchSize: "medium", // x-small, small, medium, large, x-large
        }
    }, function(err) {
        if (err) {
            console.log(err);
            return
        }
        console.log("Initialization finished. Ready to start");
        Quagga.start();
    });

    Quagga.onProcessed(function(result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                
                drawingCtx.clearRect(0, 0, parseInt(screen.width), parseInt(screen.width));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    //Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                });
            }
            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
            }
        }
    });

    Quagga.onDetected(function(result) {

        patientPage.classList.remove("u-hide");
        canvas = document.querySelector('#camera');
        canvas.classList.add('u-hide');
        barcodePopup.classList.add("u-hide");
        patientPage.style.zIndex = "1";
        
        console.log(result.codeResult.code);
        getDataFromBarcode(result.codeResult.code);

       

        Quagga.stop();

    });
}

const getDataFromBarcode = async (barcode) => {
    checkConnection();

    console.log("fetching");

    fetch("https://industryprojectapi.azurewebsites.net/api/patient/barcode/" + barcode, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("apiToken"),
            'Content-Type': 'application/json',
        },
    })
    .then(response => showPatientInfo(response))
    .then(data => {
        console.log(data);
        localStorage.setItem("patientId", data._id);  
        getLatestPatientAdministered();
    })
    .catch(error => console.log('error', error));
}


addEventListener('beforeunload',checkConnection());
addEventListener('popstate',checkConnection());

document.addEventListener('DOMContentLoaded', async function () {
    init();
});