requirejs(
    ['./fm_synth', './fm_synth_ui', './experiment', './fetch_experiment_params'],
    function(FMSynth, fm_synth_ui, experiment, fetchExperimentParams)
{
    const context = new AudioContext();
    const synth = new FMSynth(context);
    const { synth_params, semantic_prompts, semantic_descriptors} 
        = fetchExperimentParams(3);
    synth.initialize().then(() => {
        return experiment.createExperiment(
            synth,
            fm_synth_ui,
            synth_params,
            semantic_prompts,
            semantic_descriptors);
    }).then(exp => exp.run());
});