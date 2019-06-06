%%  patient_data_generator.m - Small script to generate random data for MATLAB
%   BP app.
%   Saad Siddiqui - 6/6/19
%% CONSTS
N_SAMPLES = 30;

%%  Generating Weight data 
%   Male
lower_weight_male = 50.0;
upper_weight_male = 130.0;
weight_range_male = upper_weight_male - lower_weight_male;

%   Female
lower_weight_female = 45.0;
upper_weight_female = 110.0;
weight_range_female = upper_weight_female - lower_weight_female;

%   Column of weight values
weight_m = lower_weight_male + (weight_range_male) * rand(N_SAMPLES, 1);
weight_f = lower_weight_female + (weight_range_female) * rand(N_SAMPLES, 1);
%% Generating Systolic Pressure Data
upper_sys_male = 180; lower_sys_male = 80; sys_range_m = upper_sys_male - lower_sys_male;
upper_sys_female = 170; lower_sys_female = 80; sys_range_f = upper_sys_female - lower_sys_female;

sys_m = lower_sys_male + (sys_range_m) * rand(N_SAMPLES, 1);
sys_f = lower_sys_female + (sys_range_f) * rand(N_SAMPLES, 1);
%% Generating Diastolic Pressure Data
upper_dias_male = 110; lower_dias_male = 50; dias_range_m = upper_dias_male - lower_dias_male;
upper_dias_female = 105; lower_dias_female = 40; dias_range_f = upper_dias_female - lower_dias_female;

dias_m = lower_dias_male + (dias_range_m) * rand(N_SAMPLES, 1);
dias_f = lower_dias_female + (dias_range_f) * rand(N_SAMPLES, 1);

%% Saving all values as struct
bp_struct.('weight_m') = weight_m;
bp_struct.('weight_f') = weight_f;
bp_struct.('sys_m') = sys_m;
bp_struct.('sys_f') = sys_f;
bp_struct.('dias_m') = dias_m;
bp_struct.('dias_f') = dias_f;
save('BP_Data.mat', '-struct', 'bp_struct')