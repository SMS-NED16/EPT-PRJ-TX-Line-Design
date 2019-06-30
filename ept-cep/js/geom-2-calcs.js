import conductorLookup from "./conductor_lookup.js";
import getADF from "./air_density.js";

export default function geom_2_calcs(user_input) {

	// DEFINING HORIZONTAL AND VERTICAL DISTANCES FOR CONDUCTORS
	let consts = {
		"conductor_spacing": {
			"horizontal": {
			"d1": 8.84, 
			"d2": 8.84,
			"d3": 8.84,
			},

		"vertical": {
			"h1": 3.7,
			"h2": 3.7,
			"h3": 3.7
			}
		}, 
		"volts": 132,
	};

	// DEFINING ELECTRICAL CONSTANTS FOR THIS GEOMETRY
	let line_params = {
		consts: consts, 
		inputs: user_input,
	};

	// FIND THE RIGHT CONDUCTOR
	line_params.inputs.conductor = conductorLookup(line_params.inputs.acsr_code);
	line_params.inputs.conductor_code = line_params.inputs.conductor.name;

	// CALCULATING DISTANCES FOR INDUCTANCE/CAPACITANCE CALCULATIONS
	let d_ab, d_bc, d_ac;
	var d1 = consts.conductor_spacing.horizontal.d1;
	var d2 = consts.conductor_spacing.horizontal.d2;
	var d3 = consts.conductor_spacing.horizontal.d3;

	var h1 = consts.conductor_spacing.vertical.h1;
	var h2 = consts.conductor_spacing.vertical.h2;
	var h3 = consts.conductor_spacing.vertical.h3;
	
	if (d1 == d2 && d2 == d3) {
		d_ab = Math.pow((h1 ** 2) *(h1 ** 2 + d2 ** 2), 1/4);
		d_bc = d_ab;
		d_ac = Math.pow((h3 ** 2) * (d2 ** 2), 1/4);
	} else {
	    d_ab = Math.pow(Math.sqrt(h1 ** 2+ ((d1- d2) / 2) ** 2) 
	    	* Math.sqrt(h1 ** 2 + ((d2 - d3) / 2) ** 2) 
	    	* Math.sqrt(h1 ** 2 +(d1-(d1- d2)/ 2) ** 2)
	    	* Math.sqrt(h1 ** 2 +(d2-(d2-d3)/2) ** 2), 1/4);

        d_bc = Math.pow(Math.sqrt(h2 ** 2 + ((d1-d2) / 2) ** 2)
        	*Math.sqrt(h2 ** 2 + ((d2 - d3)/2) ** 2) 
        	*Math.sqrt(h2 ** 2 + (d1-(d1-d2)/2) ** 2)
        	*Math.sqrt(h2 ** 2 +(d2-(d2- d3)/2) ** 2), 1/4);

        d_ac = Math.pow(((h3)**2 + ((d1 - d3) / 2) ** 2) * d1 * d3, 1/4);
	}

	// APPEND THE NEW CONDUCTOR DISTANCES TO THE LINE PARAMS
	line_params.consts.conductor_spacing.phase = {
		"ab": d_ab, 
		"bc": d_bc, 
		"ac": d_ac,
	};

	// CALCULATING INDUCTANCE
	let D_eq = Math.pow((d_ab * d_bc * d_ac), 1/3); 	// geometric mean
	let d_aa = Math.sqrt((h3*h3)+(d1-(d1-d3)) ** 2);
	let d_sa = Math.sqrt(line_params.inputs.conductor.L * d_aa);
	let d_sb = Math.sqrt(d2 * line_params.inputs.conductor.L);
	let d_cc = Math.sqrt((h3*h3)+(d3-(d3-d1)) ** 2);
	let d_sc = Math.sqrt(line_params.inputs.conductor.L * d_cc);
	let D_s = Math.pow((d_sa*d_sb*d_sc), 1/3); 
	
	// final inductance
	let inductance = 2 * (10 ** -7) * Math.log(D_eq/D_s);				

	// CALCULATING CAPACITANCE
	let d_sc_a = Math.sqrt(line_params.inputs.conductor.C * d_aa);
	let d_sc_b = Math.sqrt(line_params.inputs.conductor.C * d2);
	let d_sc_c = Math.sqrt(line_params.inputs.conductor.C * d_cc);
	let D_sc= Math.pow((d_sc_a * d_sc_b * d_sc_c), 1/3);
	let perm_free_space = 8.85 * Math.pow(10, -12);
	let capacitance = (2*Math.PI* perm_free_space)/(Math.log(D_eq/D_sc));

	// CALCULATING SURGE IMPEDANCE LOADING
	let SI = (inductance / capacitance) ** 0.5;
	let SIL = (((line_params.consts.volts * 10 ** 3) ** 2) / SI) / (10 ** 6);

	// CALCULATING RESISTIVE LOSSES
	let r_loss = 1-(Math.exp((-1 * line_params.inputs.length * 
		line_params.inputs.conductor.R)/(inductance * 3 * (10 ** 8))));

	// AIR DENISTY
	let air_density_factor = getADF(line_params.inputs.temp, line_params.inputs.pressure);

	// DISRUPTIVE CRITICAL VOLTAGE
	let E_0 = 21.1 * 0.85 * line_params.inputs.conductor.radius * 100 * air_density_factor * 
	Math.log(D_eq/ line_params.inputs.conductor.radius);

	// CORONA LOSSES
	let p_corona = (242.4 / air_density_factor) * (line_params.inputs.frequency + 25) * 
	((line_params.consts.volts - E_0) ** 2) * ((line_params.inputs.conductor.radius / D_eq) ** 0.5)
	* (10 ** -5);

	// Results object
	line_params.results = {
		line_inductance: inductance, 
		line_capacitance: capacitance,
		sil: SIL, 
		r_loss: r_loss,
		E_0: E_0, 
		p_corona: p_corona,
	}

	return line_params;
}	// end