export default function updateModal(modalData) {
	console.log("Hello from the modal");
	console.log(modalData);
	$("#geomName").html("<h2>" + 
		modalData.inputs.geom_description + "</h2>");

	let inputs = modalData.inputs;
	let consts = modalData.consts;
	let results = modalData.results;

	// First add div with params already known or specified
	var modal_html = "<div><h2>Specified Parameters</h2>"
		+ "<b>Line Description</b>:" + "\t" + inputs.geom_description

		// Electrical Parameters
		+ "<h3>Electrical Parameters</h3>"
		+ "<ul>"
		+	"<li><b>Line Voltage (kV)</b>:\t\t" + consts.volts + "</li>"
		+	"<li><b>Frequency (Hz)</b>\t\t:" + inputs.frequency + "</li>"
		+ "</ul>"
		+ "<h3>Physical Parameters</h3>"
		+ "<ul>"
		+	"<li><b>Length (km)</b>:\t\t" + inputs.length + "</li>"
		+	"<li><b>Temperature (kV)</b>:\t\t" + inputs.temperature + "</li>"
		+	"<li><b>Pressure (kV)</b>:\t\t" + inputs.pressure + "</li>"
		+ "</ul>"


		// Conductor Parameters
		+ "<h3>Conductor Parameters</h3>"
		+ "<ul>"
		+	"<li>Name:\t\t" + inputs.conductor.name + "</li>"
		+	"<li>Resistance (&#916)\t\t: " + inputs.conductor.R + "</li>"
		+	"<li>Inductance (H):\t\t" + inputs.conductor.L + "</li>"
		+	"<li>Capacitance (F):\t\t " + inputs.conductor.C + "</li>"
		+	"<li>Radius (m):\t\t" + inputs.conductor.radius + "</li>"
		+	"<li>Count per bundle (if applicable):\t\t" + 1 + "</li>"
		+ "</ul>"
		

		// Calculation Results in a separate section
		+ "<h2>Calculated Parameters</h2>"
		+ "<ul>"
		+	"<li><b>Inductance per Meter</b>:\t\t" + results.line_inductance + "</li>"
		+	"<li><b>Capacitance per Meter</b>:\t\t" + results.line_capacitance + "</li>"
		+	"<li><b>Total Resistive Losses (kW)</b>:\t\t" + results.r_loss + "</li>"
		// +	"<li><b>Estimated Corona Losses (kW)</b>:" + results."</li>"
		// +	"<li><b>Disruptive Critical Voltage (kV)</b>:" + "</li>"
		+	"<li><b>Surge Impedance Loading (kV)</b>:\t\t" + results.sil + "</li>"
		+ "</ul>"
	"</div>";

	$("#geomParams").html(modal_html);
}