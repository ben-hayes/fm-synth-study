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
async function createMainLoop(fm_synth,
    fm_synth_ui,
    trials,
    semantic_descriptors,
    pid)
{
    const sequences = [];
    for (let i = 0; i < trials.length; i++) {
        const param_snapshot = trials[i].synth_preset;
        const semantic_prompt = trials[i].semantic_prompt;
        const note = trials[i].note_pitch;
        const sequence = await createMainSequence(
                fm_synth,
                note,
                fm_synth_ui,
                param_snapshot,
                semantic_prompt,
                semantic_descriptors,
                i,
                pid);
        sequences.push(sequence);
    }

    return sequences;
}

async function createMainSequence(
    fm_synth,
    note,
    fm_synth_ui,
    param_snapshot,
    semantic_prompt,
    semantic_descriptors,
    index,
    pid)
{
    const param_store = {};
    const prompt_text = semantic_descriptors
                            [semantic_prompt.descriptor_index]
                            [semantic_prompt.direction];
    const sequence = new lab.flow.Sequence({
        content: [
            await createSynthScreen(
                fm_synth,
                note,
                fm_synth_ui,
                param_snapshot,
                param_store,
                prompt_text,
                index,
                pid),
            await createPromptRatingScreen(
                fm_synth,
                note,
                param_snapshot,
                param_store,
                prompt_text,
                index,
                pid),
            await createDescriptorRatingScreen(
                fm_synth,
                note,
                param_snapshot,
                param_store,
                semantic_prompt,
                semantic_descriptors,
                9,
                index,
                pid),
        ]
    });
    return sequence;
}

async function createPromptRatingScreen(
    fm_synth,
    note,
    param_snapshot,
    param_store,
    semantic_prompt,
    index,
    pid)
{
    const rating_screen_data = await fetch('rating_interface.html');
    const rating_screen_html = await rating_screen_data.text();
    const text = createPromptText(semantic_prompt);
    const row = createPromptRow(semantic_prompt);
    const rating_screen = new lab.html.Form({
        id: `prompt_${index}`,
        title: `prompt_${index}`,
        content: rating_screen_html
                    .replace('<%ROWS%>', row)
                    .replace('<%TEXT%>', text)
                    .replace('<%MIDDLE_TEXT%>', `Somewhat ${semantic_prompt}`),
        data: {
            pid
        }
    });

    activateRatingScreenSynth(
        fm_synth,
        note,
        param_snapshot,
        param_store,
        rating_screen);

    return rating_screen;
}

function createPromptRow(semantic_prompt) {
    return `
            <tr>
                <td>Not much ${semantic_prompt}</td>
                <td colspan="5"><input type="range" name="${semantic_prompt}" value="0" min="-10" max="10" step="0.1" style="width: 400px"></td>
                <td>Much ${semantic_prompt}</td>
            </tr>
        `;
}

function createPromptText(semantic_prompt) {
    return `
        <span>You were asked to create a sound that is <b>${semantic_prompt}</b> than the reference sound.</span><br /><br />
        <span>Please now rate how much <b>${semantic_prompt}</b> the created sound is compared to the reference sound.</span><br /><br />
    `;
}


async function createDescriptorRatingScreen(
    fm_synth,
    note,
    param_snapshot,
    param_store,
    semantic_prompt,
    semantic_descriptors,
    batch_size,
    index,
    pid) 
{
    const batch = batch_size || 10;
    const rating_screen_data = await fetch('rating_interface.html');
    const rating_screen_html = await rating_screen_data.text();
    const text = createDescriptorText();
    const screens = [];

    for (let i = 0; i < Math.floor(semantic_descriptors.length / batch); i++) {
        const descriptor_batch =
            semantic_descriptors.slice(i * batch, (i + 1) * batch);
        const rows = createDescriptorRows(descriptor_batch, semantic_prompt);
        const rating_screen = new lab.html.Form({
            id: `descriptor_${index}`,
            title: `descriptor_${index}`,
            content: rating_screen_html
                        .replace('<%ROWS%>', rows)
                        .replace('<%TEXT%>', text)
                        .replace('<%MIDDLE_TEXT%>', 'About the same'),
            data: {
                pid
            }
        });

        activateRatingScreenSynth(
            fm_synth,
            note,
            param_snapshot,
            param_store,
            rating_screen);

        screens.push(rating_screen);
    }

    const rating_screens = new lab.flow.Sequence({
        content: screens,
    });

    return rating_screens;
}

function createDescriptorText() {
    return `
        <span>Now, please rate the created sound in comparison to the reference sound on the scales below.</span><br /><br />
        <span>For example, if you think the created sound is much louder than the reference sound, you would select "Much louder".</span><br /><br />
    `;
}

function createDescriptorRows (semantic_descriptors, semantic_prompt) {
    const rows = [];
    semantic_descriptors.forEach(descriptor => {
        if (descriptor 
            !== semantic_descriptors[semantic_prompt.descriptor_index]) {
            const row = `
                <tr>
                    <td>Much ${descriptor.less}</td>
                    <td colspan="5"><input type="range" name="${descriptor.name}" value="0" min="-10" max="10" step="0.1" style="width: 400px"></td>
                    <td>Much ${descriptor.more}</td>
                </tr>
            `;
            rows.push(row);
        }
    });
    return rows.join('\n');
}

function activateRatingScreenSynth(
    fm_synth,
    note,
    param_snapshot,
    param_store,
    rating_screen) 
{
    const {keyDownListener, keyUpListener} = createKeyboardCallbacks(
        fm_synth,
        note,
        param_snapshot,
        () => param_store
    );
    rating_screen.on('run', () => {
        document.addEventListener('keydown', keyDownListener);
        document.addEventListener('keyup', keyUpListener);
    });
    rating_screen.on('end', () => {
        document.removeEventListener('keydown', keyDownListener);
        document.removeEventListener('keyup', keyUpListener);
    })
}

function createKeyboardCallbacks(
        fm_synth,
        note,
        param_snapshot,
        get_params_callback) {
    
    const held_keys = {};
    const keyDownListener = (event) => {
        const key = event.key;

        if (held_keys[key]) return;
        held_keys[key] = true;

        if (key == 'c') {
            fm_synth.change_param_allowed = true;
            fm_synth.setAllParams(get_params_callback());
            fm_synth.startNote(note);
        } else if (key == 'r')
        {
            fm_synth.setAllParams(param_snapshot);
            fm_synth.change_param_allowed = false;
            fm_synth.startNote(note);
        }
    };
    const keyUpListener = (event) => {
        const key = event.key;
        held_keys[key] = false;

        if (key == 'c' || key == 'r') {
            fm_synth.change_param_allowed = true;
            fm_synth.endNote();
        }
    }

    return {keyDownListener, keyUpListener};

}

async function createSynthScreen(
    fm_synth,
    note,
    fm_synth_ui,
    param_snapshot,
    param_store,
    semantic_prompt,
    index,
    pid) 
{
    const synth_html = await fm_synth_ui.getSynthHTML();
    const synth_screen = new lab.html.Form({
        content: synth_html.replace('<%PROMPT%>', `Please edit the synth parameters to make this sound <em>${semantic_prompt}</em>`),
        id: `synth_${index}`,
        title: `synth_${index}`,
        data: {
            pid
        }
    });

    let ui;

    const {keyDownListener, keyUpListener} = createKeyboardCallbacks(
        fm_synth,
        note,
        param_snapshot,
        () => {
            return fm_synth_ui.getAllParams(ui)
        });

    synth_screen.on('run', () => {
        ui = fm_synth_ui.startSynthUI(fm_synth.setParam.bind(fm_synth));
        fm_synth.setAllParams(param_snapshot);
        fm_synth_ui.setAllParams(param_snapshot, ui);

        document.addEventListener('keydown', keyDownListener);
        document.addEventListener('keyup', keyUpListener);
    });
    synth_screen.on('end', () => {
        Object.assign(param_store, fm_synth.getAllParams());
        fm_synth_ui.cleanupSynthUI(ui);

        document.removeEventListener('keydown', keyDownListener);
        document.removeEventListener('keyup', keyUpListener);
    });


    return synth_screen;
}

async function createSynthDemo(fm_synth, fm_synth_ui) {
    const synth_html = await fm_synth_ui.getSynthHTML();
    const synth_screen = new lab.html.Form({
        content: synth_html.replace('<%PROMPT%>', `Please familiarise yourself with the synthesiser below.`),
        id: "synth_demo"
    });
    let ui;

    const {keyDownListener, keyUpListener} = createKeyboardCallbacks(
        fm_synth,
        48,
        fm_synth_ui.default_param_map,
        () => {
            return fm_synth_ui.getAllParams(ui)
        });

    synth_screen.on('run', () => {
        ui = fm_synth_ui.startSynthUI(fm_synth.setParam.bind(fm_synth));

        document.addEventListener('keydown', keyDownListener);
        document.addEventListener('keyup', keyUpListener);
    });
    synth_screen.on('end', () => {
        fm_synth_ui.cleanupSynthUI(ui);

        document.removeEventListener('keydown', keyDownListener);
        document.removeEventListener('keyup', keyUpListener);
    });


    return synth_screen;
}

async function createMSIScreen() {
    const msi_data = await fetch('questionnaire_interface.html');
    const msi_html = await msi_data.text();

    return new lab.html.Form({content: msi_html});
}

function createExperimentScreens(text_list) {
    const screens = [];
    for (let screen of text_list) {
        screens.push(new lab.html.Screen({
            content: screen.join(''),
            responses:{ keypress: 'confirm' }
        }));
    }
    return screens;
}

async function getExperimentText() {
    const intro_data = await fetch('experiment_text.json');
    const intro_prompts = JSON.parse(await intro_data.text());
    return intro_prompts;
}

async function createExperiment(
    fm_synth,
    fm_synth_ui,
    trials,
    semantic_descriptors,
    pid) 
{
    const datastore = new lab.data.Store();
    const experiment_text = await getExperimentText();
    const introduction =
        createExperimentScreens(experiment_text.pre_demo_screens);
    const demo = await createSynthDemo(fm_synth, fm_synth_ui);
    const post_demo =
        createExperimentScreens(experiment_text.post_demo_screens);
    const post_experiment =
        createExperimentScreens(experiment_text.post_experiment_screens);
    const msi_screen = await createMSIScreen();
    const post_questionnaire =
        createExperimentScreens(experiment_text.post_questionnaire_screens);

    const main_loop = await createMainLoop(
        fm_synth,
        fm_synth_ui,
        trials,
        semantic_descriptors,
        pid);

    const experiment = new lab.flow.Sequence({
        content: [].concat(introduction)
                   .concat(demo)
                   .concat(post_demo)
                   .concat(main_loop)
                   .concat(post_experiment)
                   .concat(msi_screen)
                   .concat(post_questionnaire),
        plugins: [
            new lab.plugins.Transmit({
                url: 'https://qm-fm-study.herokuapp.com/api/save-experiment',
                updates: {
                    full: true
                }
            })
        ],
        datastore
    });
    return experiment;
}

return {
    createExperiment
};
});