/*
	conductor_lookup.js - A simple JS function that uses an ACSR conductor's codename
	to find and return its data in the form of an ACSR conductor object from a simple DB.
*/
import acsr_db from "./conductor_db.js";

export default function conductorLookup(conductor_code) {
	if (conductor_code in acsr_db) {
		console.log('Conductor Found');
		return acsr_db[conductor_code];
	} else {
		console.log('Default Conductor');
		return acsr_db['drake'];
	}
};
