export default function getCoronalLoss(air_density_factor, frequency, line_volts, E_0, radius, D_eq) {
	return (242.4 / air_density_factor) * (frequency + 25) * 
	((line_volts - E_0) ** 2) * ((radius / D_eq) ** 0.5)
	* (10 ** -5);
}