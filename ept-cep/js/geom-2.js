import geom_2_calcs from "./geom-2-calcs.js";
import updateModal from "./update_modal.js";

// GETTING USER INPUT
// Creates an object to store data entered by the user
let user_input = {};
	$("#submit-btn").click(function() {
		// Get the values of the inputs
 		user_input = {
 			geom_description: $("#geometryDescription")[0].value,
 			acsr_code: $("#acsr")[0].value,
 			conductors_per_bundle: $("#conductor-count")[0].value,
 			frequency: parseFloat(($("#f-50").is(":checked") ? 50 : 60)),
 			temp: parseFloat($("#temp")[0].value), 
 			pressure: parseFloat($("#pressure")[0].value),
 			length: parseFloat($("#length")[0].value),
		};

		// Calculate parameters to obtain full set of results
		let results = geom_2_calcs(user_input);

		console.log(results);
		
		// Use this data to update the modal
		updateModal(results);
});