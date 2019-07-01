import conductorLookup from "./conductor_lookup.js";
import getADF from "./air_density.js";
import getSIL from "./getSIL.js";
import getDisruptiveCriticalVoltage from "./getDisruptiveCriticalVoltage.js";
import getResistiveLosses from "./getResistiveLosses.js";
import getCoronalLoss from "./getCoronalLoss.js";

export default function geom_6_calcs(user_input) {
	// Conductor Spacing and line voltage are constants
	let constants = {
		"conductor_spacing": {
			"horizontal": {
				"d1": 13.86, 		// distance b/w a and b
				"d2": 20.32,		// distance b/w b and c
				"d3": 16.66,		// distance b/w c and a
			}, 
			"vertical": {
				"h1": 10.47,
				"h2": 8.84,
				"h3": 19.31
			}, 
			"bundle": 0.5,
		}, 
		"volts": 400,
		"conductors_per_bundle": 4,
	};

	// Object of all line parameters
	let line_params = {
		consts: constants,
		inputs: user_input,
	};

	// Finding the right conductor
	line_params.inputs.conductor = conductorLookup(line_params.inputs.acsr_code);
	line_params.inputs.conductor_code = line_params.inputs.conductor.name;

	// Defining all conductor spacings as variables for readable code
	// Horizontal spacing
	let d1 = line_params.consts.conductor_spacing.horizontal.d1;
	let d2 = line_params.consts.conductor_spacing.horizontal.d2;
	let d3 = line_params.consts.conductor_spacing.horizontal.d3;

	// Vertical spacing
	let h1 = line_params.consts.conductor_spacing.vertical.h1;
	let h2 = line_params.consts.conductor_spacing.vertical.h2;
	let h3 = line_params.consts.conductor_spacing.vertical.h3;

	// Vertical distance between bundled conductors
	let d = line_params.consts.conductor_spacing.bundle;

	// Supplementary distances used in calculations
	let dab = Math.pow(Math.sqrt(h1 ** 2 + ((d1 - d2) / 2) ** 2) 
		* Math.sqrt(h1 ** 2 + ((d2 - d3) / 2) ** 2) 
		* Math.sqrt(h1 ** 2 + (d1 - (d1 - d2) / 2) ** 2)
		* Math.sqrt(h1 ** 2 + (d2-(d2 - d3) / 2) ** 2), 1/4);

	let dbc = Math.pow(Math.sqrt(h2 ** 2 + ((d1 - d2) / 2) ** 2)
		* Math.sqrt(h2 ** 2 +((d2 - d3) / 2) ** 2) 
		* Math.sqrt(h2 ** 2 + (d1 - (d1 - d2) / 2) ** 2)
		* Math.sqrt(h2 ** 2 + (d2 - (d2 - d3) / 2) ** 2), 1/4);
	
	let dac = Math.pow(((h3) ** 2 + ((d1 - d3) / 2) ** 2) *d1 * d3, 1/4);
	
	let Deq =  Math.pow((dab * dbc * dac), 1/3);
	let daa =  Math.sqrt((d1 + (d3 - d1) / 2) ** 2 + h3 ** 2);
	let dbb = d2;
	let dcc =  Math.sqrt((d3 - (d3 - d1) / 2) ** 2 + h3 ** 2);
	let DY =   Math.pow((line_params.inputs.conductor.L * d * d), 1/3);
	let Dsa =  Math.sqrt(DY * daa);
	let Dsb =  Math.sqrt(DY * dbb);
	let Dsc =  Math.sqrt(DY * dcc);

	// INDUCTANCE
	let Ds = Math.pow((Dsa * Dsb * Dsc), 1/3);
	let inductance = 2 * (10 ** -7) * Math.log(Deq/Ds);

	// CAPACITANCE
	let DY2 = Math.pow((line_params.inputs.conductor.C * d * d), 1/3); 
	let D_sc_a = Math.sqrt(DY2 * daa);
	let D_sc_b = Math.sqrt(DY2 * dbb);
	let D_sc_c = Math.sqrt(DY2 * dcc);
	let D_sc = Math.pow((D_sc_a * D_sc_b * D_sc_c), 1/3);
	let perm_free_space = 8.85 * (10 ** -12);
	let capacitance = (2 * Math.PI * perm_free_space)/(Math.log(Deq/D_sc));


	// SIL
	let SIL = getSIL(inductance, capacitance, line_params.consts.volts);

	// RESISTIVE LOSSES
	let r_loss = getResistiveLosses(line_params.inputs.length, 
		line_params.inputs.conductor.R, inductance);

	// DISRUPTIVE CRITICAL VOLTAGE AND AIR DENSITY FACTOR
	let adf = getADF(line_params.inputs.temp, line_params.inputs.pressure);
	
	// For this geometry, must multiply standard E_0 by root three
	let E_0 = Math.sqrt(3) * getDisruptiveCriticalVoltage(
		line_params.inputs.conductor.radius,
		adf, Deq);

	// CORONAL LOSSES
	let p_corona = getCoronalLoss(adf, line_params.inputs.frequency, 
	line_params.consts.volts, E_0,
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

	return line_params;
}