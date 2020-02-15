requirejs(
    ['./fm_synth', './fm_synth_ui', './experiment'],
    function(FMSynth, fm_synth_ui, experiment)
{
    const context = new AudioContext();
    const synth = new FMSynth(context);
    synth.initialize().then(() => {
        return experiment.createExperiment(synth, fm_synth_ui);
    }).then(exp => exp.run());
});