// Temp : import * as request from "request";
import { APIReturn } from "./APIReturn";
import { GenericNotifier } from "./GenericNotifier";
import { GenericConfig } from "./GenericConfig";

interface Config extends GenericConfig {
	message: string;
}

export default class Twitter implements GenericNotifier {
	public sendMessage = (config: Config): APIReturn => {
		/* Request code for now
		const payload = {
			"message": config.message,
			"status": "Test"
		};
		const options = {
			url: 'https://api-mean.herokuapp.com/api/contacts',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			json: json
		};
		request(options, function(err, res, body) {
			if (res && (res.statusCode === 200 || res.statusCode === 201)) {
				console.log(body);
			}
		});
		*/
		return {
			error: 0,
			debugInfo: "ye"
		};
	}

	public TAG = "TWITTER";
}
