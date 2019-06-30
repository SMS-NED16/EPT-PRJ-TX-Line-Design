import conductorLookup from "./conductor_lookup.js";
import getADF from "./air_density.js";

export default function geom_3_calcs(user_input) { 
	// DEFINING VOLTAGE AND SPACING FOR THE GEOMETRY
	let consts = {
		"conductor_spacing": {
			"horizontal": {
				"x_ab": 1.3, 
				"x_bc": 12.2,
				"x_ca": 10.9,
			}, 

			"vertical": {
				"y_ab": 7.1, 
				"y_bc": 0, 
				"y_ca": 0, 
			},

			"shield": {
				"h1": 6.5,
				"h2": 13.6,
				"h3": 13.6,
			}
		}, 
		"volts": 115,
	};


	// APPENDING THE CONSTANTS TO THE INPUT DATA FOR FULL SET OF LINE PARAMS
	let line_params = {
		consts: consts, 
		inputs: user_input,
	};

	// FIND THE RIGHT CONDUCTOR
	line_params.inputs.conductor = conductorLookup(line_params.inputs.acsr_code);
	line_params.inputs.conductor_code = line_params.inputs.conductor.name;


	// EXTRACTING DISTANCES FOR READABLE CALCULATION CODE
	// horizontal distances
	let x_ab = line_params.consts.conductor_spacing.horizontal.x_ab;
	let x_bc = line_params.consts.conductor_spacing.horizontal.x_bc;
	let x_ca = line_params.consts.conductor_spacing.horizontal.x_ca;

	// vertical distances
	let y_ab = line_params.consts.conductor_spacing.vertical.y_ab;
	let y_bc = line_params.consts.conductor_spacing.vertical.y_bc;
	let y_ca = line_params.consts.conductor_spacing.vertical.y_ca;

	// shield wire distances
	let h1 = line_params.consts.conductor_spacing.shield.h1;
	let h2 = line_params.consts.conductor_spacing.shield.h2;
	let h3 = line_params.consts.conductor_spacing.shield.h3;


	// INDUCTANCE
	let d_1 = Math.sqrt(x_ab ** 2 + y_ab ** 2);
	let d_2 = Math.sqrt(x_bc ** 2 + y_bc ** 2);
	let d_3 = Math.sqrt(x_ca ** 2 + y_ca ** 2);
	let D_m= Math.pow((d_1 * d_2 * d_3), 1/3);

	let inductance = 2 * (10 ** -7) * Math.log(D_m / line_params.inputs.conductor.L); 



	// CAPACITANCE TO EARTH 
	let perm_free_space = 8.85 * Math.pow(10, -12);
	h1 *= 2; h2 *= 2; h3 *= 2;		// doubing all shield wire distances
	
	let h_12 = Math.sqrt((h1 + y_ab) ** 2 + x_ab ** 2);
	let h_23 = Math.sqrt((h2) ** 2 + x_bc ** 2);
	let h_13 = Math.sqrt((h1 + y_ab) ** 2 + x_ca ** 2);

	let d_eq = Math.pow(h_12 * h_23 * h_13, 1/3);
	let d_s = Math.pow(h1 * h2 * h3, 1/3);

	let capacitance_to_earth = (2 * Math.PI * perm_free_space)/
	((Math.log(D_m/line_params.inputs.conductor.C)-(Math.log(d_eq/d_s))));

	// SURGE IMPEDANCE LOADING
	let SI = (inductance / capacitance_to_earth) ** 0.5;
	let SIL = ((line_params.consts.volts * (10 ** 3)) ** 2 / SI) / (10 ** 6);

	// RESISTIVE LOSSES
	let r_loss = 1 - (Math.exp((-1 * line_params.inputs.length * 
		line_params.inputs.conductor.R)/ (inductance * 3 * (10 ** 8))));

	// DISRUPTIVE CRITICAL VOLTAGE
	let air_density_factor = getADF(line_params.inputs.temp, line_params.inputs.pressure);
	let E_0 = 21.1 * 0.87 * (line_params.inputs.conductor.radius * 100) * 
	air_density_factor * (Math.log(D_m/line_params.inputs.conductor.radius));

	// CORONAL POWER LOSSS
	let p_corona = (242.4/air_density_factor) * (line_params.inputs.frequency + 25) 
	* ((line_params.consts.volts - E_0) ** 2) * ((line_params.inputs.conductor.radius / D_m) ** 0.5 ) 
	* Math.pow(10, -5);

	// Append all calculations to results and return for display
	line_params.results = {
		line_inductance: inductance, 
		line_capacitance: capacitance_to_earth,
		sil: SIL, 
		r_loss: r_loss,
		E_0: E_0, 
		p_corona: p_corona,	
	};

	return line_params;
}	// end function