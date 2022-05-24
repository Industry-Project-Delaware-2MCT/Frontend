let nurseName = "test";

const init = () => {
    console.log("init");
    

    if(window.location.href.includes("LoginPage.html")) {
        firstName = document.querySelector('.js-firstname');
	    lastName = document.querySelector('.js-lastname'); 
        loginForm = document.querySelector('.js-login');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            Login();
        });
    }else if(window.location.href.includes("PatientPage.html")) {
        greeting = document.querySelector('.js-greeting');
        showPatientName();
    } else if(window.location.href.includes("NFCpage.html")) {
        errorMessage = document.querySelector(".js-error");
        scan();
    }
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
        firstName.classList.add('c-empty_input');
        lastName.classList.add('c-empty_input');
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
}

const checkInputs = () => {    
    let check = true;

    removeWrongInput();
    
    if (firstName.value.length == 0){
        check = false;
        firstName.classList.add('c-empty_input');
    }

    if(lastName.value.length == 0) {
        check = false;
        lastName.classList.add('c-empty_input');
    }
    
    return check;
}

const scan = async () => {
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      console.log("Scanning");
  
      ndef.addEventListener("readingerror", () => {
        console.log("Argh! Cannot read data from the NFC tag. Try another one?");
        errorMessage.innerHTML = "Scan niet gelukt, probeer opnieuw of log manueel in";
      });
  
      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        authenticateByNFC(serialNumber);
        console.log(`Serial Number: ${serialNumber}`);
        console.log(`Records: (${message.records.length})`);
        console.log(`Records: (${message.records})`);
      });
    } catch (error) {
      console.log("Argh! " + error);
      errorMessage.innerHTML = "Er is iets fout gegaan, probeer opnieuw of log manueel in";
    }
  };

document.addEventListener('DOMContentLoaded', async function () {
    init();
});