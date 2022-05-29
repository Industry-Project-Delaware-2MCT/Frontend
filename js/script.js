var barcodeDetector;

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
        document.getElementById("cameraButton").addEventListener("click", barcodescanner());

    } else if(window.location.href.includes("NFCpage.html")) {
        errorText = document.querySelector(".js-errortext");
        title = document.querySelector(".js-title");
        rfid = document.querySelector(".js-rfid");
        scan();
    }
}

const barcodescanner = () => {
    Quagga.init({
        numOfWorkers: 4,
        frequency: 10,
        locate: true,
        inputStream : {
            name : "Live",
            type : "LiveStream",
            target: document.querySelector('#camera'),
            constraints: {
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
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
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
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
        console.log(result.codeResult.code);
    });

    function getQueryString() {
        if (location.search==='') return null;
        var params = {}
        location.search.substr(1).split('&').map(function(param) {
            var pairs = param.split('=');
            params[pairs[0]] = decodeURIComponent(pairs[1]);
        });
        return params;
    }
}

//convert image to base64
const convertToBase64 = (image) => {
    var file = image.files[0];
    var reader = new FileReader();
    reader.onloadend = function() {
      console.log('RESULT', reader.result)
    }
    let base64 = reader.readAsDataURL(file);
    console.log(base64);
}

const getBarcode =  (image) => {
    // check compatibility
    if (!('BarcodeDetector' in window)) {
        console.log('Barcode Detector is not supported by this browser.');
    } else {
        console.log('Barcode Detector supported!');
  
        // create new detector
        barcodeDetector = new BarcodeDetector({formats: ['aztec', 'code_128', 'code_39', 'code_93', 'data_matrix', 'ean_13', 'ean_8', 'itf', 'pdf417', 'qr_code', 'upc_e']});
        console.log("barcode"+ barcodeDetector);
        //getcode(image);
        console.log();

        result = getbarcodefromimage(image)

        //console.log(JSON.stringify(result));
    }


    


}
async function checkIfFormatIsSupported(format) {
 
    return await BarcodeDetector.getSupportedFormats()
           .then(supportedFormats => {
               console.log(supportedFormats);
               return supportedFormats.indexOf(format) !== -1;
           });
 }


const getbarcodefromimage = (image) => {
    return new Promise((resolve, reject) => {
        barcodeDetector.detect(image)
            .then(barcodes => {
                resolve(barcodes)
                console.log(JSON.stringify(barcodes));
            })
            .catch(err => {
                reject(err);
            });
    });
}

const getcode = async (image) => {
    try {
        const barcodes = await barcodeDetector.detect(image);
        barcodes.forEach(barcode => console.log(barcode + "jghlskghmflsghj"));
      } catch (e) {
       // if the imageElement is invalid, the DOMException will be thrown
        console.error('Barcode detection failed:', e);
      }
}
const Login = async () => {
    
    if(checkInputs()) {
        authenticate(firstName.value, lastName.value);
    }
};
const warmup = async () => {


    

    console.log("fetching");

    fetch("https://industryprojectapi.azurewebsites.net/", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        body: "",
    })
    .then(response => checkLogin(response))
    .then(data => {
        console.log(data);
        
    })
    .catch(error => console.log('error', error));
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
        if(data.first_name != null) {
            localStorage.setItem("firstName", data.first_name);
            localStorage.setItem("nfcSerial", data.nfc_serialnumber);
            localStorage.setItem("apiToken", data.api_token);
        }
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
        if(data.first_name != null) {
            localStorage.setItem("firstName", data.first_name);
            localStorage.setItem("nfcSerial", data.nfc_serialnumber);
            localStorage.setItem("apiToken", data.api_token);
        }
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
    let nurseName = localStorage.getItem("firstName");
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

document.addEventListener('DOMContentLoaded', async function () {
    init();
});