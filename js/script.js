let nurseName = "test";

const init = () => {
    console.log("init");
    
    if(window.location.href.includes("index.html")) {
        warmup();
    }
    else if(window.location.href.includes("LoginPage.html")) {
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
        greeting = document.querySelector('.js-greeting');
        showPatientName();
        cameraButton = document.querySelector('.js-cameraButton');
        cameraButton.addEventListener('click', function(e) {
            localStorage.setItem("patientId", "628740081b56900e34fbe029");
            window.location.href = window.location.origin + "/Frontend/MedicationPage.html";
            
        });
    } else if(window.location.href.includes("NFCpage.html")) {
        errorText = document.querySelector(".js-errortext");
        title = document.querySelector(".js-title");
        rfid = document.querySelector(".js-rfid");
        scan();
    }else if(window.location.href.includes("MedicationPage.html")) {
        getPatientInfo();
        
        input = document.getElementById("cameraFileInput");
        input.addEventListener("change", function () {
            convertToBase64(input);
        });
        errorText = document.querySelector(".js-errormessage");
        patientName = document.querySelector(".js-patientName");
        patientMedication = document.querySelector(".js-medication");
        

    }
}


const Login = async () => {
    
    if(checkInputs()) {
        authenticate(firstName.value, lastName.value);
    }
};

const warmup = async () => {
    console.log("fetching");
    //'Hello World' api call to warm up the server (= start up server after being idle for a while)
    await fetch("https://industryprojectapi.azurewebsites.net/")
}

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
        localStorage.setItem("nfcSerial", data.nfc_serialnumber);
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
        localStorage.setItem("nfcSerial", data.nfc_serialnumber);
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
    }

    return response.json();

}



const showPatientName = () => {
    nurseName = localStorage.getItem("firstName");
    greeting.innerHTML = "Hey " + nurseName;
    console.log(nurseName);
}


const removeWrongInput = () => {
    firstName.classList.remove('c-empty_input');
    lastName.classList.remove('c-empty_input');
    firstNameErrormessage.innerHTML = ""
    lastNameErrormessage.innerHTML = ""
}

const checkInputs = () => {    
    let check = true;

    removeWrongInput();
    
    if (firstName.value.length == 0){
        check = false;
        firstNameErrormessage.innerHTML = "Voornaam mag niet leeg zijn"
        firstName.classList.add('c-empty_input');
    }

    if(lastName.value.length == 0) {
        check = false;
        lastNameErrormessage.innerHTML = "Achternaam mag niet leeg zijn"
        lastName.classList.add('c-empty_input');
    }
    
    return check;
}

const convertToBase64 = (image) => {
    var file = image.files[0];
    var reader = new FileReader();
    reader.onloadend = function() {            
        //split reader.result on "," and keep text after ","
        
        //console.log( reader.result);
        let readFile = reader.result;
        let base64 = readFile.split(",")[1];
        //console.log(base64);
        getPatientData(base64);

    }
    reader.readAsDataURL(file);
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
    } catch (error) {
        console.log("Argh! " + error);
        rfid.classList.add('c-rfid-error');
        errorText.innerHTML = "Er is geen NFC reader gevonden, probeer opnieuw of log manueel in";     
        errorText.style.color = 'red';
        title.innerHTML = "NFC niet gevonden";
    }
  };

  const getPatientData = async (base64image) => {
    var data = {
        base64String: base64image
    };

    

    console.log("fetching");

    fetch("https://industryprojectapi.azurewebsites.net/api/analyze/image", {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("apiToken"),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => showPatientData(response))
    .then(data => {
        console.log(data);
        console.log("result" , data.result);
    })
    .catch(error => console.log('error', error));
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
    
function setMedicationData(firstName, lastName, medication) {
    patientName.innerHTML = "Voornaam: " + firstName + "<br />Achternaam: " + lastName;
    medication.forEach(item => {
        patientMedication.innerHTML += `${item.medication_name} ${item.dosis}<br />`
    });
}

function showPatientData(response) {
    if(response.status == 200) {
        console.log("patient data succes");
        //localStorage.setItem("patientData", JSON.stringify(response.json()));
        return response.json();
    } else {
        console.log("patient data failed");
        console.log(response.status);
        errorText.innerHTML = "Er liep iets fout bij het ophalen van de gegevens";
        errorText.style.color = 'red';
    }
}


function showPatientInfo(response) {
    if(response.status == 200) {
        console.log("patient info succes");
        return response.json();
    } else {
        console.log("patient info failed");
        console.log(response.status);
        errorText.innerHTML = "Er liep iets fout bij het ophalen van de gegevens";
        errorText.style.color = 'red';
    }
}
document.addEventListener('DOMContentLoaded', async function () {
    init();
});