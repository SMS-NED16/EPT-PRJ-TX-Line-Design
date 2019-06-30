/*
	geom-1.js - Calculates design parameters for 66 kV, single circuit,
	single conductor transmission line.s
*/

// function to find RLC/radius values of ACSR conductors by name
import conductorLookup from "./conductor_lookup.js";
import getADF from "./air_density.js";


// GETTING USER INPUT
// Creates an object to store data entered by the user
let user_input = {};
	$("#submit-btn").click(function() {
		alert("Button clicked");
		// Get the values of the inputs
 		user_input = {
 			geom_description: $("#geometryDescription")[0].value,
 			acsr_code: $("#acsr")[0].value,
 			conductors_per_bundle: $("#conductor-count")[0].value,
 			frequency: ($("#f-50").is(":checked") ? 50 : 60),
 			temp: $("#temp")[0].value, 
 			pressure: $("#pressure")[0].value,
 			length: $("#pressure")[0].value,
		};
	console.log(user_input);
});


// INITIALIZING PARAMETERS
// Stores all parameters that are fixed for this geometry
const line_constants = {
	"conductor_spacing": {
		"d1" : 5.77, 		
		"d2" : 6.89,
		"d3" : 0.57, 
	},
}

// Permeability of Free Space
const perm_free_space = 8.85 * Math.pow(10, -12);

// The line params object stores all data for the transmission line
let line_params = {
	consts: line_constants, 
	inputs: input_data,
}

// FINDING THE RIGHT CONDUCTOR
// Update the conductor with the right obj using the acsr_db
line_params.inputs.conductor = conductorLookup(line_params.inputs.conductor_code);

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
let inductance = 2 * Math.pow(10, -7) * Math.log(geom_mean_dist/input_data.conductor.L)

// Echo for sanity check
console.log("Inductance in Henries is " + inductance);

// CALCULATING CAPACITANCE
let capacitance  = (2 * Math.PI * perm_free_space) / (Math.log(geom_mean_dist/input_data.conductor.C));
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

// CORONA LOSSES
air_density_factor = getADF(input_data.temp, input_data.pressure);

// Disruptive Critical Voltage
e_0 = 21.1 * 0.85 * (input_data.conductor.radius * 100) * air_density_factor * Math.log(geom_mean_dist/input_data.conductor.radius);

// Corona Power Loesses
p_corona = (242.4 / air_density_factor) * (input_data.freq + 25) * 
((input_data.conductor.radius/geom_mean_dist)) * Math.pow(10, -5);

// Results Object
results = {
	
}