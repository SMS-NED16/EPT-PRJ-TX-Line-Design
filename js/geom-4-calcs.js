import conductorLookup from "./conductor_lookup.js";
import getADF from "./air_density.js";
import getSIL from "./getSIL.js";
import getDisruptiveCriticalVoltage from "./getDisruptiveCriticalVoltage.js";
import getResistiveLosses from "./getResistiveLosses.js";
import getCoronalLoss from "./getCoronalLoss.js";

export default function geom_4_calcs(user_input) {
	// Spacing constants
	let constants = {
		"conductor_spacing" : {
			"horizontal": {
				"d1" : 8, 		// b/w conductors a and a'
				"d2" : 9,		// b/w conductors b and b'
				"d3" : 8,		// b/w conductors c and c'
			}, 
			"vertical": {
				"h1": 5,		// b/w a and b
				"h2": 5,		// b/w b and c
				"h3": 10,		// b/w c and a
			}
		}, 
		"volts": 132,
		"conductors_per_bundle": 2, 
	};

	// Adding all constants to line_params objct
	let line_params = {
		consts: constants, 
		inputs: user_input,
	};

	// FIND THE RIGHT CONDUCTOR
	line_params.inputs.conductor = conductorLookup(line_params.inputs.acsr_code);
	line_params.inputs.conductor_code = line_params.inputs.conductor.name;

	// Initializing distance variables for readable code
	let d1 = line_params.consts.conductor_spacing.horizontal.d1;
	let d2 = line_params.consts.conductor_spacing.horizontal.d2;
	let d3 = line_params.consts.conductor_spacing.horizontal.d3;

	let h1 = line_params.consts.conductor_spacing.vertical.h1;
	let h2 = line_params.consts.conductor_spacing.vertical.h2;
	let h3 = line_params.consts.conductor_spacing.vertical.h3;

	// INDUCTANCE
	let d_ab = Math.pow((h1 ** 2 + ((d1 - d2) / 2) ** 2) * 
		(h1 ** 2 + (d1 - (d1 - d2) / 2) ** 2), 1/4);
	let d_bc = Math.pow((h2 ** 2+((d3-d2)/2) ** 2)*(h2 ** 2+(d3-(d3-d2)/2) ** 2),1/4);
	let d_ca = Math.pow((h3 ** 2+d3 ** 2)*h3 ** 2,1/4);
	let D_eq = Math.pow((d_ab * d_bc * d_ca), 1/3);
	let d_sa = Math.sqrt(line_params.inputs.conductor.L * d1);	
	let d_sb = Math.sqrt(line_params.inputs.conductor.L * d2);	
	let d_sc = Math.sqrt(line_params.inputs.conductor.L * d3);	
	
	let D_s = Math.pow((d_sa * d_sb * d_sc), 1/3);

	let inductance = 2 * (10 ** -7) * Math.log(D_eq/D_s);

	// CAPACITANCE
	let d_sc_a = Math.sqrt(line_params.inputs.conductor.C * d1);
	let d_sc_b = Math.sqrt(line_params.inputs.conductor.C * d2);
	let d_sc_c = Math.sqrt(line_params.inputs.conductor.C * d3);
	let D_sc = Math.pow((d_sc_a * d_sc_b * d_sc_c), 1/3);
	let perm_free_space = 8.85 * (10 ** -12);
	let capacitance = (2 * Math.PI * perm_free_space)/(Math.log(D_eq/D_sc));

	// RESISTIVE LOSSES
	let r_loss = getResistiveLosses(line_params.inputs.length, line_params.inputs.conductor.R, 
		inductance);

	// SURGE IMPEDANCE LOADING
	let SIL = getSIL(inductance, capacitance, line_params.consts.volts);

	// DISRUPTIVE CRITICAL VOLTAGE
	let E_0 = getDisruptiveCriticalVoltage(line_params.inputs.conductor.radius, 
		getADF(line_params.inputs.temp, line_params.inputs.pressure), 
		D_eq);

	let adf = getADF(line_params.inputs.temp, line_params.inputs.pressure);

	// CORONAL POWER LOSS
	let p_corona = getCoronalLoss(adf, line_params.inputs.frequency, 
	line_params.consts.volts, E_0, line_params.inputs.conductor.radius, D_eq);

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