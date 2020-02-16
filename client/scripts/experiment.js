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
    synth_presets,
    semantic_prompts,
    semantic_descriptors)
{
    const sequences = [];
    for (let i = 0; i < synth_presets.length; i++) {
        const param_snapshot = synth_presets[i];
        const semantic_prompt = semantic_prompts[i];
        const sequence = await createMainSequence(
                fm_synth,
                fm_synth_ui,
                param_snapshot,
                semantic_prompt,
                semantic_descriptors);
        sequences.push(sequence);
    }
    for (let param_snapshot of synth_presets) {
    }
    return sequences;
}

async function createMainSequence(
    fm_synth,
    fm_synth_ui,
    param_snapshot,
    semantic_prompt,
    semantic_descriptors)
{
    const param_store = {};
    const prompt_text = semantic_descriptors
                            [semantic_prompt.descriptor_index]
                            [semantic_prompt.direction];
    const sequence = new lab.flow.Sequence({
        content: [
            await createSynthScreen(
                fm_synth,
                fm_synth_ui,
                param_snapshot,
                param_store,
                prompt_text),
            await createPromptRatingScreen(
                fm_synth,
                param_snapshot,
                param_store,
                prompt_text),
            await createDescriptorRatingScreen(
                fm_synth,
                param_snapshot,
                param_store,
                semantic_prompt,
                semantic_descriptors),
        ]
    });
    return sequence;
}

async function createPromptRatingScreen(
    fm_synth,
    param_snapshot,
    param_store,
    semantic_prompt)
{
    const rating_screen_data = await fetch('rating_interface.html');
    const rating_screen_html = await rating_screen_data.text();
    const text = createPromptText(semantic_prompt);
    const row = createPromptRow(semantic_prompt);
    const rating_screen = new lab.html.Form({
        content: rating_screen_html
                    .replace('<%ROWS%>', row)
                    .replace('<%TEXT%>', text)
                    .replace('<%MIDDLE_TEXT%>', `Somewhat ${semantic_prompt}`)
    });

    activateRatingScreenSynth(
        fm_synth,
        param_snapshot,
        param_store,
        rating_screen);

    return rating_screen;
}

function createPromptRow(semantic_prompt) {
    return `
            <tr>
                <td>Not much ${semantic_prompt}</td>
                <td class="input_cell"><input type="radio" name="${semantic_prompt}"></td>
                <td class="input_cell"><input type="radio" name="${semantic_prompt}"></td>
                <td class="input_cell"><input type="radio" name="${semantic_prompt}"></td>
                <td class="input_cell"><input type="radio" name="${semantic_prompt}"></td>
                <td class="input_cell"><input type="radio" name="${semantic_prompt}"></td>
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
    param_snapshot,
    param_store,
    semantic_prompt,
    semantic_descriptors) 
{
    const rating_screen_data = await fetch('rating_interface.html');
    const rating_screen_html = await rating_screen_data.text();
    const text = createDescriptorText();
    const rows = createDescriptorRows(semantic_descriptors, semantic_prompt);
    const rating_screen = new lab.html.Form({
        content: rating_screen_html
                    .replace('<%ROWS%>', rows)
                    .replace('<%TEXT%>', text)
                    .replace('<%MIDDLE_TEXT%>', 'About the same')
    });

    activateRatingScreenSynth(
        fm_synth,
        param_snapshot,
        param_store,
        rating_screen);

    return rating_screen;
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
                    <td class="input_cell"><input type="radio" name="${descriptor.name}"></td>
                    <td class="input_cell"><input type="radio" name="${descriptor.name}"></td>
                    <td class="input_cell"><input type="radio" name="${descriptor.name}"></td>
                    <td class="input_cell"><input type="radio" name="${descriptor.name}"></td>
                    <td class="input_cell"><input type="radio" name="${descriptor.name}"></td>
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
    param_snapshot,
    param_store,
    rating_screen) 
{
    rating_screen.on('run', () => {
        document.getElementById('play-new').onclick = () => {
            fm_synth.setAllParams(param_store);
            fm_synth.playNoteWithEnvLengths(53, 0.0625, 2);
        };
        document.getElementById('play-ref').onclick = () => {
            fm_synth.setAllParams(param_snapshot);
            fm_synth.playNoteWithEnvLengths(53, 0.0625, 2);
        };
        document.getElementById('submit').onclick = () => {
            fm_synth.endNote();
        };
    });
}

async function createSynthScreen(
    fm_synth,
    fm_synth_ui,
    param_snapshot,
    param_store,
    semantic_prompt) 
{
    const synth_html = await fm_synth_ui.getSynthHTML();
    const synth_screen = new lab.html.Form({
        content: synth_html.replace('<%PROMPT%>', `Please edit the synth parameters to make this sound <em>${semantic_prompt}</em>`)
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
        fm_synth.setAllParams(param_snapshot);
        fm_synth_ui.setAllParams(param_snapshot, ui);
    });
    synth_screen.on('end', () => {
        Object.assign(param_store, fm_synth.getAllParams());
        fm_synth_ui.cleanupSynthUI(ui);
    });


    return synth_screen;
}

async function createSynthDemo(fm_synth, fm_synth_ui) {
    const synth_html = await fm_synth_ui.getSynthHTML();
    const synth_screen = new lab.html.Form({
        content: synth_html.replace('<%PROMPT%>', `Please familiarise yourself with the synthesiser below.`)
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

async function createIntroductionScreens() {
    const intro_data = await fetch('experiment_text.json');
    const intro_prompts = JSON.parse(await intro_data.text());
    const screens = [];
    for (let screen of intro_prompts.pre_demo_screens) {
        screens.push(new lab.html.Screen({
            content: screen.join(''),
            responses:{ keypress: 'confirm' }
        }));
    }
    return screens;
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
    synth_presets,
    semantic_prompts,
    semantic_descriptors) 
{
    const datastore = new lab.data.Store();
    const experiment_text = await getExperimentText();
    const introduction =
        createExperimentScreens(experiment_text.pre_demo_screens);
    const demo = await createSynthDemo(fm_synth, fm_synth_ui);
    const post_demo =
        createExperimentScreens(experiment_text.post_demo_screens);

    const main_loop = await createMainLoop(
        fm_synth,
        fm_synth_ui,
        synth_presets,
        semantic_prompts,
        semantic_descriptors);

    const experiment = new lab.flow.Sequence({
        content: [].concat(introduction)
                   .concat(demo)
                   .concat(post_demo)
                   .concat(main_loop),
        plugins: [
            new lab.plugins.Transmit({
                url: 'https://qm-fm-study.herokuapp.com/api/save-experiment',
            })
        ]
        datastore
    });
    return experiment;
}

return {
    createExperiment
};
});