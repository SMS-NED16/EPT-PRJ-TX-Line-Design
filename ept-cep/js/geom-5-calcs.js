import conductorLookup from "./conductor_lookup.js";
import getADF from "./air_density.js";
import getSIL from "./getSIL.js";
import getDisruptiveCriticalVoltage from "./getDisruptiveCriticalVoltage.js";
import getResistiveLosses from "./getResistiveLosses.js";
import getCoronalLoss from "./getCoronalLoss.js";

export default function geom_5_calcs(user_input) {
	// Initializing spacing constants
	let constants = {
		"conductor_spacing": {
			"horizontal": {
				"d1": 5.5, 		// distance b/w a and b
				"d2": 5.5,		// distance b/w b and c
				"d3": 11,		// distance b/w c and a
			}, 
			"ground": {
				"h_n": 21,
			}
		}, 
		"volts": 400,
		"conductors_per_bundle": 4,
	};

	// Adding all constants to line_params objct
	let line_params = {
		consts: constants, 
		inputs: user_input,
	}; 

	// FIND THE RIGHT CONDUCTOR
	line_params.inputs.conductor = conductorLookup(line_params.inputs.acsr_code);
	line_params.inputs.conductor_code = line_params.inputs.conductor.name;

	// INDUCTANCE
	let D_m = Math.pow( line_params.consts.conductor_spacing.horizontal.d1 
		* line_params.consts.conductor_spacing.horizontal.d2 
		* line_params.consts.conductor_spacing.horizontal.d3,
	 1/3);
	let inductance = 2 * (10 ** -7) * Math.log(D_m / line_params.inputs.conductor.L);

	// CAPACITANCE
	// Initializing heights of conductors as local variables for tracatability
	let H1 = 2 * line_params.consts.conductor_spacing.ground.h_n;
	let H2 = 2 * line_params.consts.conductor_spacing.ground.h_n;
	let H3 = 2 * line_params.consts.conductor_spacing.ground.h_n;

	let H_12= Math.sqrt((H1 * H1)+(constants.conductor_spacing.horizontal.d1
		* constants.conductor_spacing.horizontal.d1));
	let H_23= Math.sqrt((H2 * H2)+(constants.conductor_spacing.horizontal.d2
		* constants.conductor_spacing.horizontal.d2));
	let H_31= Math.sqrt((H3 * H3)+(constants.conductor_spacing.horizontal.d3
		* constants.conductor_spacing.horizontal.d3));

	let perm_free_space = 8.85 * (10 ** -12);
	let height_geom_mean_a = Math.pow((H_12 * H_23 * H_31), 1/3);
	let height_geom_mean_b = Math.pow((H1 * H2 * H3) ,1/3);

	let capacitance = (2 * Math.PI * perm_free_space) / 
	((Math.log(D_m / line_params.inputs.conductor.C)) - 
		Math.log(height_geom_mean_a / height_geom_mean_b));

	// RESISTIVE LOSSES
	let r_loss = getResistiveLosses(line_params.inputs.length, line_params.inputs.conductor.R, 
		inductance);

	// SIL
	let SIL = getSIL(inductance, capacitance, line_params.consts.volts);

	// AIR DENSITY FACTOR
	let adf = getADF(line_params.inputs.temp, line_params.inputs.pressure);

	// DISRUPTIVE CRITICAL VOLTAGE - multiplying regular result by root 3
	let E_0 = Math.sqrt(3) * 
				getDisruptiveCriticalVoltage(line_params.inputs.conductor.radius, 
					adf, D_m);

	// CORONAL POWER LOSSES
	let p_corona = getCoronalLoss(adf, line_params.inputs.frequency, 
	line_params.consts.volts / Math.sqrt(3), E_0,
	line_params.inputs.conductor.radius, D_m);

	// Make a results object
	line_params.results = {
		line_inductance: inductance, 
		line_capacitance: capacitance,
		sil: SIL, 
		r_loss: r_loss,
		E_0: E_0, 
		p_corona: p_corona,
	}

	return line_params;
}