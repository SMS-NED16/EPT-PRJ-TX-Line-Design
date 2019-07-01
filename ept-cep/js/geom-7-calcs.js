import conductorLookup from "./conductor_lookup.js";
import getADF from "./air_density.js";
import getSIL from "./getSIL.js";
import getDisruptiveCriticalVoltage from "./getDisruptiveCriticalVoltage.js";
import getResistiveLosses from "./getResistiveLosses.js";
import getCoronalLoss from "./getCoronalLoss.js";

export default function geom_7_calcs(user_input) {
	// Conductor Spacing and line voltage are constants
	let constants = {
		"conductor_spacing": {
			"horizontal": {
				"d1": 5.6, 		// distance b/w a and c'
				"d2": 6.6,		// distance b/w b and b'
				"d3": 6.0,		// distance b/w c and a'
			}, 
			"vertical": {
				"h1": 3.47,		// b/w conductors a and b
				"h2": 4.0,		// b/w conductors b and c
				"h3": 7.47,		// b/w conductors c and a
			}, 
		}, 
		"volts": 220,			
		"conductors_per_bundle": 1,
	};


	// Object of all line parameters
	let line_params = {
		consts: constants,
		inputs: user_input,
	};

	// Finding the right conductor
	line_params.inputs.conductor = conductorLookup(line_params.inputs.acsr_code);
	line_params.inputs.conductor_code = line_params.inputs.conductor.name;

	// Defining distances as individual variables for readable code.
	// Horizontal spacing
	let d1 = line_params.consts.conductor_spacing.horizontal.d1;
	let d2 = line_params.consts.conductor_spacing.horizontal.d2;
	let d3 = line_params.consts.conductor_spacing.horizontal.d3;

	// Vertical spacing
	let h1 = line_params.consts.conductor_spacing.vertical.h1;
	let h2 = line_params.consts.conductor_spacing.vertical.h2;
	let h3 = line_params.consts.conductor_spacing.vertical.h3;

	// Defining inter-conductor distances
	let dab, dbc, dac;
	if (d1 == d2 && d2 == d3) {
		dab = Math.pow((h1 ** 2) * (h1 ** 2) + (d2 ** 2), 1/4);
		dbc = dab;
		dac = Math.pow((h3 ** 2) * (d2 ** 2), 1/4);
	} else {
		dab = Math.pow(Math.sqrt(h1 ** 2 + ((d1 - d2) / 2) ** 2)
			* Math.sqrt(h1 ** 2 + ((d2 - d3) / 2) ** 2)
			* Math.sqrt(h1 ** 2 + (d1 - (d1 - d2) / 2) ** 2)
			* Math.sqrt(h1 ** 2 + (d2 - (d2 - d3) / 2) ** 2), 1/4);
		dbc = Math.pow(Math.sqrt(h2 ** 2 + ((d1 - d2) / 2) ** 2)
			* Math.sqrt(h2 ** 2 + ((d2 - d3) / 2) ** 2)
			* Math.sqrt(h2 ** 2 + (d1 - (d1 - d2) / 2) ** 2)
			* Math.sqrt(h2 ** 2 + (d2 - (d2 - d3) / 2) ** 2), 1/4);
		dac = Math.pow(((h3) ** 2 + ((d1 - d3) / 2) ** 2) * d1 * d3, 1/4);
	}

	// DEFINING DISTANCES FOR LC CALCULATION
	let Deq =  Math.pow((dab * dbc * dac),1/3);
	let daa = Math.sqrt((h3 * h3)+(d1 - (d1 - d3)) ** 2);
	let dsa =  Math.sqrt(line_params.inputs.conductor.L * daa);
	let dsb =  Math.sqrt(d2 * line_params.inputs.conductor.L);
	let dcc =  Math.sqrt((h3 * h3) + (d3 - (d3 - d1)) ** 2);
	let dsc =  Math.sqrt(line_params.inputs.conductor.L * dcc);

	// INDUCTANCE
	let Ds = Math.pow((dsa*dsb*dsc), 1/3); 
	let inductance = 2 * (10 ** -7) * Math.log(Deq / Ds);

	// CAPACITANCE
	let dsca = Math.sqrt(line_params.inputs.conductor.C * daa);
	let dscb = Math.sqrt(line_params.inputs.conductor.C * d2);
	let dscc = Math.sqrt(line_params.inputs.conductor.C * dcc);
	let Dsc = Math.pow((dsca * dscb * dscc),1/3);
	let perm_free_space = 8.85 * (10 **-12);
	
	let capacitance = (2 * Math.PI * perm_free_space)/(Math.log(Deq / Dsc));

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