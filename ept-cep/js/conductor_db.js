/*
	conduct_db.js - Instantiates different ACSRConductor objects with their parameters
	and creates a simple, non-relational DB that can be exported as a JS object.
*/
import ACSRConductor from "./ACSRConductor.js";


// Defining a new ACSR ACSRConductor with RLC values and exporting it
let acsr_db = {
	'curlew': new ACSRConductor("Curlew", 0.0172, 0.0729, 0.464, 0.01584),
	'drake': new ACSRConductor("Drake", 0.0222, 0.0756, 0.482, 0.014055),
	'dove': new ACSRConductor("Dove", 0.0314, 0.0795, 0.510, 0.011775),
	'martin': new ACSRConductor("Martin", 0.0134, 0.07, 0.442, 0.01805),
	'rail': new ACSRConductor("Rail", 0.0188, 0.0748, 0.474, 0.014805),
};

export default acsr_db;