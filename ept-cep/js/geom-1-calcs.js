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
	let SI = Math.pow( (inductance / capacitance), 0.5 );
	let SIL = (Math.pow(110 * Math.pow(10, 3), 2) / SI) / Math.pow(10, 6);
	console.log("Surge Impedance is ", SI);
	console.log("Surge Impedance Loading is ", SIL);

	// RESISTIVE LOSSES
	let line_length = user_input.length;
	let r_per_meter = user_input.conductor.R;
	let r_loss_const = 3 * Math.pow(10, 8);
	let r_loss = 1 - (Math.exp((-1 * line_length * r_per_meter) /(inductance * r_loss_const))); 
	console.log("Resistive Losses are", r_loss);

	// CORONA LOSSES
	let air_density_factor = getADF(user_input.temp, user_input.pressure);
	console.log("Air density factor is ", air_density_factor);

	// DISRUPTIVE CRITICAL VOLTAGE
	let radius = user_input.conductor.radius;
	let E_0 = 21.1 * 0.85 * radius * 100 * air_density_factor * Math.log(geom_mean_dist/radius);
	console.log("Disruptive Critical Voltage", E_0);

	// CORONA POWER LOSSES
	let p_corona = (242.4 / air_density_factor) * (user_input.frequency + 25) * 
	Math.pow(110 - E_0, 2) * Math.pow(radius/geom_mean_dist, 0.5) * Math.pow(10, -5);
	console.log("Coronal Power Losses are", p_corona);

	// Results Object
	line_params.results = {
		line_inductance: inductance, 
		line_capacitance: capacitance,
		sil: SIL, 
		r_loss: r_loss,
		E_0: E_0, 
		p_corona: p_corona,
	};

	return line_params;
}