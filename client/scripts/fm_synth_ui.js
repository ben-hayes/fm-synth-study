define(function() {
//
// Settings for Nexus UI controls
//

const default_param_map = {
    attack_1: 0.15,
    decay_1: 0.25,
    sustain_1: 0.4,
    release_1: 0.3,
    coarse_1: 1.0,
    fine_1: 0.0,
    gain_1: 0.7,
    attack_2: 0.15,
    decay_2: 0.25,
    sustain_2: 0.4,
    release_2: 0.3,
    coarse_2: 1.0,
    fine_2: 0.0,
    gain_2: 0.7,
    attack_3: 0.15,
    decay_3: 0.25,
    sustain_3: 0.4,
    release_3: 0.3,
    coarse_3: 1.0,
    fine_3: 0.0,
    gain_3: 0.7,
};

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

const coarse_settings = {min: 1, max: 48, step: 1, value: 1};
const fine_settings = {min: -499, max: 499, step: 1, value: 0};
const gain_settings = {min: 0, max: 1.0, step: 0.001, value: 0.7};
const attack_settings = {min: 0.0, max: 1.0, step: 0.001, value: 0.15};
const decay_settings = {min: 0.0, max: 1.0, step: 0.001, value: 0.25};
const sustain_settings = {min: 0.0, max: 1.0, step: 0.001, value: 0.4};
const release_settings = {min: 0.0, max: 1.0, step: 0.001, value: 0.3};

Object.assign(coarse_settings, dial_settings);
Object.assign(fine_settings, dial_settings);
Object.assign(gain_settings, dial_settings);
Object.assign(attack_settings, slider_settings);
Object.assign(decay_settings, slider_settings);
Object.assign(sustain_settings, slider_settings);
Object.assign(release_settings, slider_settings);

//
// Define UI spec for one operator
// 
const operator_one_spec = {
    attack: { type: Nexus.Slider, settings: attack_settings },
    sustain: { type: Nexus.Slider, settings: sustain_settings },
    decay: { type: Nexus.Slider, settings: decay_settings },
    release: { type: Nexus.Slider, settings: release_settings },
    adsr: { type: Nexus.Envelope, settings: adsr_settings },
};
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

//
// UI spec for whole synth
//
const synth_spec = [
    Object.assign({}, operator_one_spec),
    Object.assign({}, operator_spec),
    Object.assign({}, operator_spec)
];

//
// Envelope control behaviour
//
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

const keyboard_map = {
    a: 0,
    w: 1,
    s: 2,
    e: 3,
    d: 4,
    f: 5,
    t: 6,
    g: 7,
    y: 8,
    h: 9,
    u: 10,
    j: 11,
    k: 12,
    o: 13,
    l: 14,
    p: 15,
};

function startSynthUI(parameterChangeCallback) {
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

                if (parameterChangeCallback !== undefined) {
                    ui_component.on('change', val => {
                        parameterChangeCallback(param_name, val);
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

    return ui;
}

function cleanupSynthUI(ui) {
    for (let element in ui) {
        if (!('type' in ui[element])) {
            cleanupSynthUI(ui[element]);
            continue;
        } else {
            ui[element].destroy();
        }
    }
}

function setAllParams(param_map, ui) {
    for (let param in param_map) {
        const [param_name, op_index_plus_one] = param.split('_');
        ui[op_index_plus_one - 1][param_name].value = param_map[param];
    }
}

function getAllParams(ui) {
    const param_map = {};
    for (let i = 0; i < ui.length; i++) {
        const operator = ui[i];
        for (let param in operator) {
            if (param.includes('num') || param.includes('adsr')) continue;
            const name = param + '_' + (i + 1);
            param_map[name] = operator[param].value;
        }
    }
    return param_map;
}

async function getSynthHTML() {
    const synthData = await fetch('./synth_interface.html');
    const synthHtml = await synthData.text();

    return synthHtml;
}

return {
    getSynthHTML,
    startSynthUI,
    cleanupSynthUI,
    setAllParams,
    getAllParams,
    default_param_map
};
})