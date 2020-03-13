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
    function getUrlParam(parameter, defaultvalue){
        let urlparameter = defaultvalue;
        if(window.location.href.indexOf(parameter) > -1){
            urlparameter = getUrlVars()[parameter];
        }
        return urlparameter;
    }
    let pid = getUrlParam('pid', 'undefined');

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    document.addEventListener('keydown', () => {
        if (context.state !== 'running') {
            context.resume();
        }
    });
    const synth = new FMSynth(context);
    console.log(synth);
    synth.initialize()
        .then(() => {
            return fetchExperimentParams();
        })
        .then(({trials, semantic_descriptors}) => {
            return experiment.createExperiment(
                synth,
                fm_synth_ui,
                trials,
                semantic_descriptors,
                pid);
        }).then(exp => exp.run());
});