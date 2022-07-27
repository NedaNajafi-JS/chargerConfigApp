function login(){
    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
        
        if (this.readyState == 4) {
            if(this.status !== 200)
                alert(this.response);
            else
                window.location.href = '/get';
        }
    };

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    xhttp.open("POST", "/user/login", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({username, password}));
}