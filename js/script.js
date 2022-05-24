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
    }
}


const Login = async () => {
    
    if(checkInputs()) {
        authenticate(firstName.value, lastName.value);
        if(firstName.value.length != 0) {
            localStorage.setItem("firstname", firstName.value);
        }
        
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
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}



const checkLogin = (json) => {
    console.log(json);

    if(json.status == 200) {
        console.log("login succes");
        console.log(window.location.href);
        window.location.href = window.location.origin + "Frontend/PatientPage.html";
        
    } else {
        console.log("login failed");
        console.log(json.status);
        firstName.classList.add('c-empty_input');
        lastName.classList.add('c-empty_input');
    }

}

const showPatientName = () => {
    nurseName = localStorage.getItem("firstname");
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



document.addEventListener('DOMContentLoaded', async function () {
    init();
});