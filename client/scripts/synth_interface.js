/**
 * Utils for creating a NexusUI synth interface
 * @author Ben Hayes <b.j.hayes@se19.qmul.ac.uk>
 */

// Settings for Nexus UI controls
const dial_settings = {
    size: [60, 60],
    interaction: 'vertical',
    mode: 'relative',
};
const slider_settings = {
    size: [20, 100],
};
const adsr_settings = {
    size: [300, 100],
    noNewPoints: true,
    points: [
        { x: 0.0, y: 0.0 },
        { x: 0.1, y: 0.9 },
        { x: 0.4, y: 0.3 },
        { x: 0.8, y: 0.3 },
        { x: 1.0, y: 0.0 }
    ]
};

// Param control ranges
const coarse_settings = {min: 1, max: 48, step: 1, value: 1};
const fine_settings = {min: 0, max: 999, step: 1, value: 0};
const gain_settings = {min: 0, max: 1.0, step: 0.01, value: 0.7};
const attack_settings = {min: 0.0, max: 1.0, step: 0.01, value: 0.15};
const decay_settings = {min: 0.0, max: 1.0, step: 0.01, value: 0.25};
const sustain_settings = {min: 0.0, max: 1.0, step: 0.01, value: 0.4};
const release_settings = {min: 0.0, max: 1.0, step: 0.01, value: 0.3};

Object.assign(coarse_settings, dial_settings);
Object.assign(fine_settings, dial_settings);
Object.assign(gain_settings, dial_settings);
Object.assign(attack_settings, slider_settings);
Object.assign(decay_settings, slider_settings);
Object.assign(sustain_settings, slider_settings);
Object.assign(release_settings, slider_settings);

// Define UI spec for one operator
const operator_spec = {
    coarse: { type: Nexus.Dial, settings: coarse_settings },
    coarse_num: { type: Nexus.Number, link: 'coarse'},
    fine: { type: Nexus.Dial, settings: fine_settings },
    fine_num: { type: Nexus.Number, link: 'fine'},
    gain: { type: Nexus.Dial, settings: gain_settings },
    gain_num: { type: Nexus.Number, link: 'gain' },
    attack: { type: Nexus.Slider, settings: attack_settings },
    sustain: { type: Nexus.Slider, settings: sustain_settings },
    decay: { type: Nexus.Slider, settings: decay_settings },
    release: { type: Nexus.Slider, settings: release_settings },
    adsr: { type: Nexus.Envelope, settings: adsr_settings },
};

// UI spec for whole synth
const synth_spec = [
    Object.assign({}, operator_spec),
    Object.assign({}, operator_spec),
    Object.assign({}, operator_spec)
];

// Envelope control behaviour -- keeps envelope visual up to date with slider
// positions. Hacky and not ideal but sufficient for this purpose
const env_callbacks = {
    attack: (env, decay, sustain, release, val) => {
        const attack_time = val / 4.0;
        const decay_time = decay.value / 4.0;
        const release_time = release.value / 4.0;
        const sustain_level = sustain.value * 0.9;

        env.movePoint(1, attack_time, 0.9);
        env.movePoint(2, attack_time + decay_time, sustain_level);
        env.movePoint(3, attack_time + decay_time + 0.25, sustain_level);
        env.movePoint(4, attack_time + decay_time + 0.25 + release_time, 0.0);
    },
    decay: (env, attack, sustain, release, val) => {
        const attack_time = attack.value / 4.0;
        const decay_time = val / 4.0;
        const release_time = release.value / 4.0;
        const sustain_level = sustain.value * 0.9;

        env.movePoint(2, attack_time + decay_time, sustain_level);
        env.movePoint(3, attack_time + decay_time + 0.25, sustain_level);
        env.movePoint(4, attack_time + decay_time + 0.25 + release_time, 0.0);
    },
    sustain: (env, val) => {
        const decay_end = env.points[2].x;
        const sustain_end = env.points[3].x;

        env.movePoint(2, decay_end, val * 0.9);
        env.movePoint(3, sustain_end, val * 0.9);
    },
    release: (env, attack, decay, val) => {
        const release_end = val / 4.0;
        const attack_time = attack.value / 4.0;
        const decay_time = decay.value / 4.0;
        
        env.movePoint(4, attack_time + decay_time + 0.25 + release_end, 0.0);
    },
};

/**
 * Attach callbacks to the sliders associated with a given envelope control
 *
 * @param {*} env
 * @param {*} attack
 * @param {*} decay
 * @param {*} sustain
 * @param {*} release
 */
function setupEnvelopeCallbacks (env, attack, decay, sustain, release) {
    env.click = () => {};
    env.click = () => {};
    env.click = () => {};
    
    attack.on('change', env_callbacks.attack.bind(
        undefined,
        env,
        decay,
        sustain,
        release));
    decay.on('change', env_callbacks.decay.bind(
        undefined,
        env,
        attack,
        sustain,
        release));
    sustain.on('change', env_callbacks.sustain.bind(undefined, env));
    release.on('change', env_callbacks.release.bind(
        undefined,
        env,
        attack,
        decay));
        
    attack.value = attack.value;
    decay.value = decay.value;
    sustain.value = sustain.value;
    release.value = release.value;
}

/**
 * Generates a synth UI from specs
 *
 * @param {*} index
 * @param {*} param_map
 * @returns A list of UI components
 */
function generateSynthUI (index, param_map) {
    const ui = [];

    let operator_index = 0;
    for (let operator of synth_spec) {
        ui.push({});
        for (let component in operator) {
            const element_id = `#${component}_${operator_index + 1}`;
            const param_name = `${component}_${operator_index + 1}`;

            const ui_component = new operator[component].type(
                element_id,
                operator[component].settings);

            if (operator[component].link !== undefined) {
                ui_component.link(ui[operator_index][operator[component].link]);
            }

            if (component !== 'adsr' && !component.includes('num')) {
                const form_element_id =
                    `${component}_${operator_index + 1}_form`;

                document.getElementById(form_element_id).value = ui_component.value;
                ui_component.on('release', (ctl => {
                    document.getElementById(form_element_id).value = ctl.value;
                }).bind(undefined, ui_component));

                if (param_map !== undefined) {
                    ui_component.on('change', val => {
                        if (param_map.has(param_name)) {
                            param_map.get(param_name).value = val;
                        }
                    });
                }
            }

            ui[operator_index][component] = ui_component;
        }

        if (ui[operator_index].attack 
            && ui[operator_index].decay 
            && ui[operator_index].sustain 
            && ui[operator_index].release 
            && ui[operator_index].adsr) {
                
            setupEnvelopeCallbacks(
                ui[operator_index].adsr,
                ui[operator_index].attack,
                ui[operator_index].decay,
                ui[operator_index].sustain,
                ui[operator_index].release);
        }

        operator_index += 1;
    }

    ui.keyboard = new Nexus.Piano("#keyboard", {
        lowNote: 36,
        highNote: 72
    });

    return ui;
}

/**
 * Populates the UI HTML template with NexusUI behaviours
 *
 * @export
 * @param {*} param_map
 * @returns An object containing the full synth HTML and associated callback
 */
export async function prepareSynthUI (param_map) {
    const interface_data = await fetch ("synth_interface.html");
    const synth_html = await interface_data.text();

    const synth_callback = i => generateSynthUI(i, param_map);

    return {synth_html, synth_callback};
}

/**
 * Attaches generated synth HTML to a lab.js screen
 *
 * @export
 * @param {*} synth_html
 * @param {*} synth_callback
 * @param {*} template
 * @returns
 */
export function makeSynth (synth_html, synth_callback, template) {
    const synth_screen = new lab.html.Form({
        content: synth_html
    });

    synth_screen.on('run', synth_callback.bind(undefined, template.index));

    return synth_screen;
}