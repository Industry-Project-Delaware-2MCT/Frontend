if('serviceWorker' in navigator) {
    navigator.serviceWorker
    .register('./sw.js')
    .then(function() { 
        console.log('Service Worker Registered'); 
    });
}

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
            window.location.reload();
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
    await fetch("https://industryprojectapi.azurewebsites.net/")
}

/*==========================
Check network connection
===========================*/

const checkConnection = async () => {
    if(window.navigator.onLine) {
        if(window.location.href.includes("noNetwork.html")){
            window.location.href = window.location.origin + "/Frontend/index.html";
        }else{
            return
        }
        
    }else{
        console.log("no connection");
        window.location.href = window.location.origin + "/Frontend/noNetwork.html";
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
        localStorage.setItem("nurseId", data._id);
        localStorage.setItem("apiToken", data.api_token);
    })
    .catch(error => console.log('error', error));
}

const authenticateByNFC = async (nfcSerialNumber) => {
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
        errorText.style.color = 'red';
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
        errorText.style.color = 'red';
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
        patientMedication.innerHTML += `${item.medication_name} ${item.dosis}<br />`
    });
}

const getPatientInfo = async () => {

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
        
    })
    .catch(error => console.log('error', error));
}

function showLatestAdministered(time_administered) {

    let date = new Date(time_administered * 1000);
    
    var options = { year:'numeric',month:'long',day:'numeric',weekday: "long"};
    let fulldate = date.toLocaleString('nl',options);
    options = { hour:'numeric',minute:'numeric'};
    let time = date.toLocaleString('nl',options);

    patientPage.classList.add('o-blur');
    Swal.fire({
        title: '<p class="o-medication--popup">Laatste toediening </p> <span class="o-medication--popup-date">23 mei 2022 9:00u</span>',
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
        showLatestAdministered(data.time_administered);
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
            errorMessage.style.color = 'red';
        } else {
            errorText.innerHTML = "Login niet gelukt, foute credentials";
            errorText.style.color = 'red';
        }
    }
}


/*==========================
MEDICATION INFO
===========================*/

const convertToBase64 = (image) => {
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
    var data = {
        base64String: base64image
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
        console.log("result" , data.result);
    })
    .catch(error => console.log('error', error));
}

function showMedicationData(response) {
    if(response.status == 200) {
        console.log("patient data succes");
        return response.json();
    } else {
        console.log("patient data failed");
        console.log(response.status);
        errorText.innerHTML = "Er liep iets fout bij het ophalen van de gegevens";
        errorText.style.color = 'red';
    }
}

/*==========================
INPUT VALIDATION
===========================*/

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
        errorText.style.color = 'red';
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
            errorText.style.color = 'red';
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
        errorText.style.color = 'red';
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


document.addEventListener('DOMContentLoaded', async function () {
    init();
});