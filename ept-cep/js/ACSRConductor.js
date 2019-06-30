/*
	ACSRConductor.js - A JS file that initialises an ACSR Conductor class with properties
	for its codename, radius along with its resistance, capacitance, and inductance
	per unit length. Defines only a constructor.
*/

class ACSRConductor {
	constructor(name, R, L, C, radius) {
		this.name = name;
		this.R = R;
		this.L = L;
		this.C = C;
		this.radius = radius;
	}	// end constructor
}	// end class Conductor

export default ACSRConductor;