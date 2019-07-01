# EPT-PRJ-TX-Line-Design
## A simple, browser-based interface for calculating electromechanical characteristics of 10 different power transmission line geometries.

Built as an end-of-semester Complex Engineering Problem-based project for the EE-352 Electrical Power Transmission course as part of BE-Electrical Engineering at NEDUET.


## Group
| Roll Number | Name          | Roles |
|-------------|---------------|-------|
| EE-16163    | Saad Siddiqui | Web frontend, JS programming, research, report     |
| EE-16164    | Faiq Siddiqui | MATLAB prototyping, research, report     |
| EE-16168    | Rehman Gul    | Research, report      |
| EE-16084    | Aymen Amir    | Research      |

TE-EE 16-17 Section D, Spring 2019
--
## Workflow
### Inputs - Presets
The app first rovides the user the option to select one of 10 practical power transmission (TX) line geometries with the following **preset parameters**
- TX Voltage in kV
- Horizontal, vertical, and inter-bundle spacing of conductors.
- Number of conductors per bundle (if applicable)


### Inputs - User-defined
It then asks the user to specify the following **input parameters**
- TX line length (in m)
- Average temperature along TX line (in degrees Celsius)
- Average pressure along TX line (in mm Hg)
- ACSR Conductor Code
	- This is used to implicitly specify the Resistance, Capacitance, and Inductance per unit length of the conductor.
	- Available ACSR conductors
		- Curlew
		- Drake
		- Dove
		- Martin 
		- Rail

### Outputs
The app then calculates and displays the following **output parameters**
- Line Inductance (in Henries/meter)
- Line Capacitance (in Farads/meter)
- Surge Impedance Loading (in MW)
- Resistive Losses (as a %age of the total power losses)
- Disruptive Critical Voltage (in kV)
- Coronal Losses (in kW/km/phase)

Line inducatance and capacitance are not simply the conductor's per unit length L/C values multiplied by the user-specified transmission line length. These values are derived using the relative positioning of conductors with respect to each other, both inside and outside bundles, and the transmission tower's ground wire.

---
## Interface
- The interface is designed using HTML, CSS, ES5/6, jQuery, and Bootstrap.
- Decided to use a web-based interface as a personal challenge to apply to hone existing web design and development skills. 
- Other alternatives explored included a MATLAB app designer-based app and a Java GUI.
- To keep things as simple as possible, I did not use Express, Node.js, or any server/backend framerwork. 
- **JS is loaded as modules that requires CORS to be enabled**.

-----

## Improvements
## Electrical Stuff
- Add more geometries for the user to choose from. 
- Allow the user to specify a load and calculate the line current. This may also lead to a more accurate estimate of the resistive losses. 
- 

## JS and OOP
- Implement stronger JS OOP principles. OOP is used sparingly in this application (with the exception of the [`Conductor` class](./ept-cep/js/conductor_db.js)). 
- For instance, a class can be defined for `TX_Line` that is extended by subclasses for lines with bundled or unbundled conductors, or single, double, multiple circuits, etc.
- Common functions such as [`getResistiveLosses()`](./ept-cep/js/getResistiveLosses.js), [`getSIL`](./ept-cep/js/getSIL.js) can be added to the `prototype` of the `TX_Line` class for inheritance.

## BuiLding a Backend
- Could use MongoDB to store names, descriptions, conductor spacing, voltages, and other preset parameters.
- Could also use Express with EJS to dynamically generate transmission line geometry forms with a single HTML file (as opposed to a separate form page for each file).