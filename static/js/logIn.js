class LogInForm {	

	static #hide_flag = true;

	static logInForm() {
		var mainBlock = document.getElementById("mainContent");
		mainBlock.innerHTML += `<div class="ValidatableForm">
									<form id="logInForm" class="Form" method="post" style="" onsubmit="">
										<legend class="FormLabel">Вход</legend>
										<label name="emailLabel">E-mail:</label><br/>
										<input class="textField" type="email" name="logInEmailField" placeholder="example@mail.ru"></input><br/><br/>
										<label name="passLabel">Пароль:</label><br/>
										<input class="passField textField" type="password" name="logInPassField" placeholder="пароль"></input><button class="show-hideButton" type="button" onclick="LogInForm.hideButtonEvent(this); return false;"></button><br/>
										<div id="logInError" class="FormError" style="color:red; font-size: 10px"></div><br/>
										<input class="Submit" type="submit" name="logInSubmit" value="войти"></input>
									</form>
								</div>`;
		var blackout = document.getElementById("blackout");
		blackout.style.cssText = "background-color:rgba(0,0,0,.4); height:100%; position:fixed; width:100%; top:0; left:0; z-index: 10;"
		var logInForm = document.getElementById("logInForm");
		logInForm.addEventListener("submit", LogInForm.logInDataValidation);
	}

	static async logInDataValidation(event) {
		event.preventDefault();
		var form = document.getElementById("logInForm");
		var error = document.getElementById("logInError");
		var email = form.logInEmailField.value;
		var pass = form.logInPassField.value;
		const EMAIL_FORMAT = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
		if (email != "" && pass != "") {
			if (!EMAIL_FORMAT.test(email)) {
				error.innerHTML = "Неверный формат почтового адреса.";
				return false;
			}
			if (pass.length <= 3) {
				error.innerHTML = "Ваш пароль должен состоять<br/> более чем из 3-х символов";
				return false;
			}
		} else {
			error.innerHTML = "Заполните все поля.";
			return false;
		}
		const data = {
			action: "AUTHORIZATION",
			user_email: email,
			user_pass: pass,
		};
		// код для отправки данных формы серваку
		var req = await ServerCommutation.send_response("http://127.0.0.1:5000/authorization", data).then((json) => {return json;});
		if (req["status"] == "ERROR") {
			error.innerHTML = req["errors"];
			return false;
		}
		var user_data = req["body"];
		LogInForm.logIn(user_data["user_name"], user_data["user_email"]);
	}

	static logIn(name, email) {
		var query = new URLSearchParams();
		query.append("user_name", name);
		query.append("user_email", email);
		location.href = "http://127.0.0.1:5000/user?" + query.toString();
	}

	static hideButtonEvent(button) {
		if (LogInForm.#hide_flag) {
			button.style.backgroundImage = "url('../static/css/resources/sprites/show.png')";
			var forms = document.getElementsByClassName("passField");
			var child = 0;
			for (child; child < forms.length; child++) {
				forms[child].setAttribute("type", "text");
			}
			LogInForm.#hide_flag = false;
		} else {
			button.style.backgroundImage = "url('../static/css/resources/sprites/hide.png')";
			var forms = document.getElementsByClassName("passField");
			var child = 0;
			for (child; child < forms.length; child++) {
				forms[child].setAttribute("type", "password");
			}
			LogInForm.#hide_flag = true;
		}
	}
}

document.getElementById("logIn").addEventListener("click", LogInForm.logInForm);