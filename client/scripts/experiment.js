requirejs.config({
    shim: {
        lab: {
            exports: 'lab'
        }
    },
    paths: {
        lab: '../lib/lab'
    }
});

define(['lab'], function(lab) {
async function createSynthScreen(fm_synth, fm_synth_ui) {
    const synth_html = await fm_synth_ui.getSynthHTML();
    const synth_screen = new lab.html.Form({
        content: synth_html
    });

    let ui;
    synth_screen.on('run', () => {
        ui = fm_synth_ui.startSynthUI(
            fm_synth.setParam.bind(fm_synth),
            keyboard_event => {
                if (keyboard_event.state) {
                    fm_synth.startNote(keyboard_event.note);
                } else {
                    fm_synth.endNote();
                }
            });
    });
    synth_screen.on('end', () => {
        fm_synth_ui.cleanupSynthUI(ui);
    });

    return synth_screen;
}

async function createExperiment(
    fm_synth,
    fm_synth_ui,
    synth_presets,
    semantic_prompts) 
{
    const experiment = new lab.flow.Sequence({
        content: [
            await createSynthScreen(fm_synth, fm_synth_ui)
        ]
    });
    return experiment;
}

return {
    createExperiment
};
});