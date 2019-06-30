import conductorLookup from "./conductor_lookup.js";
import getADF from "./air_density.js";


export default function geom_1_calcs(user_input) {
	// INITIALIZING PARAMETERS
	// Stores all parameters that are fixed for this geometry
	const line_constants = {
		"conductor_spacing": {
			"d1" : 5.77, 		
			"d2" : 6.89,
			"d3" : 0.57, 
			"volts": 110,
		},
	}

	// Permeability of Free Space
	const perm_free_space = 8.85 * Math.pow(10, -12);

	// The line params object stores all data for the transmission line
	let line_params = {
		consts: line_constants, 
		inputs: user_input,
	}

	// FINDING THE RIGHT CONDUCTOR
	// Update the conductor with the right obj using the acsr_db
	line_params.inputs.conductor = conductorLookup(line_params.inputs.acsr_code);

	// Also update the name of the conductor code if defaulted to drake
	line_params.inputs.conductor_code = line_params.inputs.conductor.name;

	// Echo to console for sanity check
	console.log("Line parameters are");
	console.log(line_params);

	// CALCULATING INDUCTANCE
	const distances = line_params.consts.conductor_spacing;

	// Geometric mean of the distances between the three conductors
	let geom_mean_dist = Math.pow(distances.d1 * distances.d2 * distances.d3, 1/3.0);
	console.log("Geometric Mean Distance", geom_mean_dist);

	// Inductance calculation
	let inductance = 2 * Math.pow(10, -7) * Math.log(geom_mean_dist/line_params.inputs.conductor.L)

	// Echo for sanity check
	console.log("Inductance in Henries is " + inductance);

	// CALCULATING CAPACITANCE
	let capacitance  = (2 * Math.PI * perm_free_space) / (Math.log(geom_mean_dist/line_params.inputs.conductor.C));
	console.log("Capacitance in Farads is " + capacitance);

	// SURGE IMPEDANCE LOADING
	let surge_impedance = Math.pow(inductance / capacitance, 0.5);
	let surge_impedance_loading = (Math.pow(110 * Math.pow(10, 3), 2) / surge_impedance) / Math.pow(10, 6);
	console.log("Surge Impedance is ", surge_impedance);
	console.log("Surge Impedance Loading is ", surge_impedance_loading);

	//	RESISTIVE LOSSES
	let r_loss = 1 - (Math.exp((-0.07191 * line_params.inputs.length)) / 
		(1.121 * Math.pow(10, -6) * 3 * Math.pow(10, 8)));
	console.log("Resistive Losses are ", r_loss)

	// // CORONA LOSSES
	// air_density_factor = getADF(line_params.inputs.temp, line_params.inputs.pressure);

	// // Disruptive Critical Voltage
	// e_0 = 21.1 * 0.85 * (input_data.conductor.radius * 100) * air_density_factor * Math.log(geom_mean_dist/input_data.conductor.radius);

	// // Corona Power Loesses
	// p_corona = (242.4 / air_density_factor) * (input_data.freq + 25) * 
	// ((input_data.conductor.radius/geom_mean_dist)) * Math.pow(10, -5);

	// Results Object
	line_params.results = {
		line_inductance: inductance, 
		line_capacitance: capacitance,
		sil: surge_impedance_loading, 
		r_loss: r_loss,
	};

	return line_params;
}