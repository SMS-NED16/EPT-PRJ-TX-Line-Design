import conductorLookup from "./conductor_lookup.js";
import getADF from "./air_density.js";
import getSIL from "./getSIL.js";
import getDisruptiveCriticalVoltage from "./getDisruptiveCriticalVoltage.js";
import getResistiveLosses from "./getResistiveLosses.js";
import getCoronalLoss from "./getCoronalLoss.js";

export default function geom_8_calcs(user_input) {
	// Conductor Spacing and line voltage are constants
	let constants = {
		"conductor_spacing": {
			"horizontal": {
				"d1": 4.35, 	// distance b/w a and c'
				"d2": 4.35,		// distance b/w b and b'
				"d3": 8.70,		// distance b/w c and a'
			}, 
			"bundle": {
				"d": 0.3,		// distance between bundled conductors
			}, 
		}, 
		"volts": 380,			
		"conductors_per_bundle": 2,
	};

	// Object of all line parameters
	let line_params = {
		consts: constants,
		inputs: user_input,
	};

	// Finding the right conductor
	line_params.inputs.conductor = conductorLookup(line_params.inputs.acsr_code);
	line_params.inputs.conductor_code = line_params.inputs.conductor.name;

	// INDUCTANCE
	let Deq = Math.pow((line_params.consts.conductor_spacing.horizontal.d1 
		* line_params.consts.conductor_spacing.horizontal.d2  
		* line_params.consts.conductor_spacing.horizontal.d3) ,1/3);
	let Ds = Math.sqrt(line_params.inputs.conductor.L * 
		line_params.consts.conductor_spacing.bundle.d);
	let inductance = 2 * (10 ** -7) * Math.log(Deq / Ds);

	// CAPACITANCE
	let perm_free_space = 8.85 * (10 ** -12);
	let Ds_c = Math.sqrt(line_params.inputs.conductor.C * 
		line_params.consts.conductor_spacing.bundle.d);
	let capacitance = (2 * Math.PI * perm_free_space) /
	Math.log(Deq / Ds_c);

	// SIL
	let SIL = getSIL(inductance, capacitance, line_params.consts.volts);

	// RESISTIVE LOSSES
	let r_loss = getResistiveLosses(line_params.inputs.length, 
		line_params.inputs.conductor.R, inductance);

	// DISRUPTIVE CRITICAL VOLTAGE AND AIR DENSITY FACTOR
	let adf = getADF(line_params.inputs.temp, line_params.inputs.pressure);
	
	// For this geometry, must multiply standard E_0 by root three
	let E_0 = getDisruptiveCriticalVoltage(
		line_params.inputs.conductor.radius,
		adf, Deq);

	// CORONAL LOSSES
	let p_corona = getCoronalLoss(adf, line_params.inputs.frequency, 
	line_params.consts.volts / Math.sqrt(3), E_0,
	line_params.inputs.conductor.radius, Deq);

	// APPEND ALL RESULTS TO THE LINE PARAMS
	line_params.results = {
		line_inductance: inductance, 
		line_capacitance: capacitance,
		sil: SIL, 
		r_loss: r_loss,
		E_0: E_0, 
		p_corona: p_corona,
	}

	// Return all line params
	return line_params;
}