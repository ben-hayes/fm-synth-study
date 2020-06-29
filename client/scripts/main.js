requirejs(
    ['./fm_synth', './fm_synth_ui', './experiment', './fetch_experiment_params'],
    function(FMSynth, fm_synth_ui, experiment, fetchExperimentParams)
{
    function getUrlVars() {
        let vars = {};
        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    }
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    document.addEventListener('keydown', () => {
        if (context.state !== 'running') {
            context.resume();
        }
    });
    const synth = new FMSynth(context);
    synth.initialize()
        .then(() => {
            return fetchExperimentParams();
        })
        .then(({trials, semantic_descriptors, participant_id}) => {
            return experiment.createExperiment(
                synth,
                fm_synth_ui,
                trials,
                semantic_descriptors,
                participant_id);
        }).then(exp => exp.run());
});