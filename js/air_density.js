export default function getADF(temperature, pressure) {
	return (0.392 * pressure / (temperature + 273));
}