# EPT-PRJ-TX-Line-Design
## A simple, browser-based interface for calculating electromechanical characteristics of 10 different power transmission line geometries.

Built as an end-of-semester Complex Engineering Problem-based project for the EE-352 Electrical Power Transmission course as part of BE-Electrical Engineering at NEDUET.


### Group
| Roll Number | Name          | Roles |
|-------------|---------------|-------|
| EE-16163    | Saad Siddiqui | Web frontend, JS programming, research, report     |
| EE-16164    | Faiq Siddiqui | MATLAB prototyping, research, report     |
| EE-16168    | Rehman Gul    | Research, report      |
| EE-16084    | Aymen Amir    | Research      |

TE-EE 16-17 Section D, Spring 2019

### Workflow
The app first rovides the user the option to select one of 10 practical power transmission (TX) line geometries with the following **preset parameters**
- TX Voltage in kV
- Horizontal, vertical, and inter-bundle spacing of conductors.
- Number of conductors per bundle (if applicable)

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

The app then calculates and displays the following **output parameters**
- Line Inductance (in Henries/meter)
- Line Capacitance (in Farads/meter)
- Surge Impedance Loading (in MW)
- Resistive Losses (as a %age of the total power losses)
- Disruptive Critical Voltage (in kV)
- Coronal Losses (in kW/km/phase)

### Interface
Decided