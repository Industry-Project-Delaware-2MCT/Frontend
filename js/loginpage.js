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
    .then(response => response.json())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
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
});