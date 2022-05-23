const init = () => {
    console.log("init");
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        /*if(!isValid){
            console.log("wooh");
            e.preventDefault();   
        }*/
        Login();
    });
    

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
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}



const checkLogin = (json) => {
    console.log(json);

    if(json.status == 200) {
        console.log("login succes");
        console.log(window.location.href);
        window.location.href = "http://localhost:5500/Frontend/index.html";
    } else {
        console.log("login failed");
        console.log(json.status);
        /*firstName.classList.add('c-empty_input');
        lastName.classList.add('c-empty_input');*/
    }

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
	firstName = document.querySelector('.js-firstname');
	lastName = document.querySelector('.js-lastname'); 
    loginForm = document.querySelector('.js-login');
    if(loginForm) {
        console.log("loginform is not empty");
    }
    init();
});