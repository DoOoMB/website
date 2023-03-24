
class RegisterForm {	

	static #hide_flag = true;

	static registerForm() {
		var mainBlock = document.getElementById("mainContent");
		mainBlock.innerHTML += `<div class="ValidatableForm">
									<form id="regForm" class="Form" method="post" style="" onsubmit="">
										<legend class="FormLabel">Регистрация</legend>
										<label name="nameLabel">Имя:</label><br/>
										<input class="textField" type="text" name="nameField" placeholder="имя"></input><br/><br/>
										<label name="emailLabel">E-mail:</label><br/>
										<input class="textField" type="email" name="regEmailField" placeholder="example@mail.ru"></input><br/><br/>
										<label name="passLabel">Пароль:</label><br/>
										<input class="passField textField" type="password" name="regPassField" placeholder="пароль"></input><button type="button" class="show-hideButton" onclick="RegisterForm.hideButtonEvent(this); return false;"></button><br/>
										<div id="regError" class="FormError" style="color:red; font-size: 10px"></div><br/>
										<input class="Submit" id="regSubmit" type="submit" name="regSubmit" value="зарегистрироваться"></input>
									</form>
								</div>`;
		var blackout = document.getElementById("blackout");
		blackout.style.cssText = "background-color:rgba(0,0,0,.4); height:100%; position:fixed; width:100%; top:0; left:0; z-index: 10;";
		var regForm = document.getElementById("regForm");
		regForm.addEventListener("submit", RegisterForm.regDataValidation);
	}

	static async regDataValidation(event) {
		event.preventDefault();
		var form = document.getElementById("regForm");
		var error = document.getElementById("regError");
		var name = form.nameField.value;
		var email = form.regEmailField.value;
		var pass = form.regPassField.value;
		const EMAIL_FORMAT = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
		if (name != "" && email != "" && pass != "") {
			if (name.length <= 1) {
				error.innerHTML = "Ваше имя должно состоять<br/>более чем из одной буквы.";	
				return false;
			}
			if (pass.length <= 3) {
				error.innerHTML = "Ваш пароль должен состоять<br/> более чем из 3-х символов";
				return false;
			}
			if (!EMAIL_FORMAT.test(email)) {
				error.innerHTML = "Неверный формат почтового адреса.";
				return false;
			}

		} else {
			error.innerHTML = "Заполните все поля.";
			return false;
		}
		const data = {
			action: "REGISTRATION",
			user_name: name,
			user_email: email,
			user_pass: pass,
		};
		// код для отправки данных формы серваку
		var req = await ServerCommutation.send_response("http://127.0.0.1:5000/registration", data).then((json) => {return json;});
		if (req["status"] == "ERROR") {
			error.innerHTML = req["errors"];
			return false;
		}
		LogInForm.logIn(name, email)
	}

	static hideRegisterForm() {
		document.getElementById("blackout").style.cssText = "";
		var forms = document.getElementsByClassName("ValidatableForm");
		var child = 0;
		for (child; child < forms.length; child++) {
			forms[child].parentNode.removeChild(forms[child]);
		}
	}

	static hideButtonEvent(button) {
		if (RegisterForm.#hide_flag) {
			button.style.backgroundImage = "url('../static/css/resources/sprites/show.png')";
			var forms = document.getElementsByClassName("passField");
			var child = 0;
			for (child; child < forms.length; child++) {
				forms[child].setAttribute("type", "text");
			}
			RegisterForm.#hide_flag = false;
		} else {
			button.style.backgroundImage = "url('../static/css/resources/sprites/hide.png')";
			var forms = document.getElementsByClassName("passField");
			var child = 0;
			for (child; child < forms.length; child++) {
				forms[child].setAttribute("type", "password");
			}
			RegisterForm.#hide_flag = true;
		}
	}
}

document.getElementById("reg").addEventListener("click", RegisterForm.registerForm);
