/**
 * Main entry point for experiment client
 * @author Ben Hayes <b.j.hayes@se19.qmul.ac.uk>
 */
requirejs(
    ['./fm_synth', './fm_synth_ui', './experiment', './fetch_experiment_params'],
    function(FMSynth, fm_synth_ui, experiment, fetchExperimentParams)
{
    /**
     * No longer needed -- previously fetched GET vars from URL
     *
     * @returns Object containing KV pairs of GET vars
     */
    function getUrlVars() {
        let vars = {};
        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    }

    // Cross-browser friendly way of starting AudioContext... just in case any
    // sneaky people ignore my advice and use something other than Chrome
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();

    // Little hack that is necessary to ensure AudioContext starts (browsers
    // block pages from taking control without some sort of user interaction)
    document.addEventListener('keydown', () => {
        if (context.state !== 'running') {
            context.resume();
        }
    });

    // Create a new FM synth using the audio context
    const synth = new FMSynth(context);
    // Promise chain to run experiment
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