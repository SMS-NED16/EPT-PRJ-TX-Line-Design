export default function getDisruptiveCriticalVoltage(radius, air_density_factor, D_eq) {
	return 21.1 * 0.85 * radius * 100 * air_density_factor * Math.log(D_eq / radius);
}