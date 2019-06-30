export default function getResistiveLosses(length, r_per_length, inductance) {
	return (1 - Math.exp((-1 * length * r_per_length) / 
		(inductance * 3 * (10 ** 8))));
}