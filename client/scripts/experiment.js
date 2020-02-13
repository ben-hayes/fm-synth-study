import {prepareSynthUI, makeSynth} from './synth_interface.js';

//
// Define some global parameters (these could be pulled from server?)
//
const num_sounds = 3;
const params = [
    {index: 0},
    {index: 1}
];

//
// Experiment code
//
export async function createExperiment(param_map) {
    const experiment = new lab.flow.Sequence();
    const done = new lab.html.Screen({content: "Finito"});

    const {synth_html, synth_callback} = await prepareSynthUI(param_map);
    const loop = new lab.flow.Loop({
        template: makeSynth.bind(undefined, synth_html, synth_callback),
        templateParameters: params,
    })

    experiment.options.content = [loop, done];

    return experiment;
}