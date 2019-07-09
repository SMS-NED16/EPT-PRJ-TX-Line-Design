export default function getSIL(inductance, capacitance, line_voltage) {
	let surge_impedance = (inductance / capacitance) ** 0.5;
	return (((line_voltage * (10 ** 3)) ** 2) / surge_impedance) / (10 ** 6);
}