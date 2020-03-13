define(function() {
//function fetchExperimentParams(num_samples) {
//    const semantic_descriptors = [
//        {
//            name: 'sharpness',
//            more: 'sharper',
//            less: 'less sharp',
//        },
//        {
//            name: 'dirtiness',
//            more: 'dirtier',
//            less: 'less dirty',
//        },
//        {
//            name: 'aggressiveness',
//            more: 'more aggressive',
//            less: 'less aggressive',
//        },
//        {
//            name: 'richness',
//            more: 'richer',
//            less: 'less rich',
//        },
//        {
//            name: 'metallicness',
//            more: 'more metallic',
//            less: 'less metallic',
//        },
//        {
//            name: 'pureness',
//            more: 'purer',
//            less: 'less pure',
//        },
//        {
//            name: 'rawness',
//            more: 'more raw',
//            less: 'less raw',
//        },
//        {
//            name: 'sterileness',
//            more: 'more sterile',
//            less: 'less sterile',
//        },
//        {
//            name: 'darkness',
//            more: 'darker',
//            less: 'less dark',
//        },
//        {
//            name: 'bigness',
//            more: 'bigger',
//            less: 'less big',
//        },
//        {
//            name: 'harshness',
//            more: 'harsher',
//            less: 'less harsh',
//        },
//        {
//            name: 'softness',
//            more: 'softer',
//            less: 'less soft',
//        },
//        {
//            name: 'woodiness',
//            more: 'more woody',
//            less: 'less woody',
//        },
//        {
//            name: 'hardness',
//            more: 'harder',
//            less: 'less hard',
//        },
//        {
//            name: 'smoothness',
//            more: 'smoother',
//            less: 'less smooth',
//        },
//        {
//            name: 'punchiness',
//            more: 'punchier',
//            less: 'less punchy',
//        },
//        {
//            name: 'mellowness',
//            more: 'mellower',
//            less: 'less mellow',
//        },
//        {
//            name: 'brightness',
//            more: 'brighter',
//            less: 'less bright',
//        },
//        {
//            name: 'thickness',
//            more: 'thicker',
//            less: 'less thick',
//        },
//        {
//            name: 'roughness',
//            more: 'rougher',
//            less: 'less rough',
//        },
//    ];
//    const trials = [
//        {
//            semantic_prompt: {
//                descriptor_index: 0,
//                direction: 'less',
//            },
//            note_pitch: 36,
//            synth_preset: {
//            },
//            synth_id: 'ecsa93u5hq2tnw',
//        },
//        {
//            semantic_prompt: {
//                descriptor_index: 1,
//                direction: 'more',
//            },
//            note_pitch: 36,
//            synth_preset: {
//            },
//            synth_id: 'ecsa93u5hq2tnw',
//        },
//        {
//            semantic_prompt: {
//                descriptor_index: 2,
//                direction: 'less',
//            },
//            note_pitch: 60,
//            synth_preset: {
//            },
//            synth_id: 'ecsa93u5hq2tnw',
//        },
//        {
//            semantic_prompt: {
//                descriptor_index: 1,
//                direction: 'less',
//            },
//            note_pitch: 72,
//            synth_preset: {
//            },
//            synth_id: 'ecsa93u5hq2tnw',
//        },
//    ]
//
//    for (let trial in trials) {
//        trials[trial].synth_preset = {
//            'attack_1': Math.random(),
//            'decay_1': Math.random(),
//            'sustain_1': Math.random(),
//            'release_1': Math.random(),
//            'coarse_2': Math.ceil(Math.random() * 48),
//            'fine_2': Math.floor (Math.random() * 999 - 499),
//            'gain_2': Math.random(),
//            'attack_2': Math.random(),
//            'decay_2': Math.random(),
//            'sustain_2': Math.random(),
//            'release_2': Math.random(),
//            'coarse_3': Math.ceil(Math.random() * 48),
//            'fine_3': Math.floor (Math.random() * 999 - 499),
//            'gain_3': Math.random(),
//            'attack_3': Math.random(),
//            'decay_3': Math.random(),
//            'sustain_3': Math.random(),
//            'release_3': Math.random()
//        };
//    }
//    return {
//        trials,
//        semantic_descriptors,
//    };
//}

async function fetchExperimentParams() {
    const res = await fetch ("https://qm-fm-study.herokuapp.com/api/get-experiment-spec");
    const text = await res.text();
    const data = JSON.parse(text);
    return data;
}

return fetchExperimentParams;
})