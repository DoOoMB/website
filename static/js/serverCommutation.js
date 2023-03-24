class ServerCommutation {

	static async get_response(url){
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Ошибка! адрес:${url}, статус:${response.status})`);
		}
		return await response.json();
	}

	static async send_response(url, data){
		const response = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error(`Ошибка! адрес:${url}, статус:${response.status})`);
		}
		return await response.json();
	}
}

// var datad = {
// 	name: 'Nill Kiggers',
// 	sex: 'Never',
// }

// ServerCommutation.send_response("https://jsonplaceholder.typicode.com/posts", datad).then((json) => console.log(json));