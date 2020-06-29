const md5 = require('md5');
const shuffle = require('shuffle-array');

const semantic_descriptors = [
    {
        name: 'bright',
        more: 'brighter',
        less: 'less bright',
    },
    {
        name: 'thick',
        more: 'thicker',
        less: 'less thick',
    },
    {
        name: 'rough',
        more: 'rougher',
        less: 'less rough'
    },
    {
        name: 'percussive',
        more: 'more percussive',
        less: 'less percussive',
    },
    {
        name: 'clean',
        more: 'cleaner',
        less: 'less clean',
    },
    {
        name: 'complex',
        more: 'more complex',
        less: 'less complex',
    },
    {
        name: 'sweet',
        more: 'sweeter',
        less: 'less sweet',
    },
    {
        name: 'smooth',
        more: 'smoother',
        less: 'less smooth',
    },
    {
        name: 'warm',
        more: 'warmer',
        less: 'less warm',
    },
    {
        name: 'raw',
        more: 'more raw',
        less: 'less raw',
    },
    {
        name: 'big',
        more: 'bigger',
        less: 'less big',
    },
    {
        name: 'harsh',
        more: 'harsher',
        less: 'less harsh',
    },
    {
        name: 'metallic',
        more: 'more metallic',
        less: 'less metallic',
    },
    {
        name: 'aggressive',
        more: 'more aggressive',
        less: 'less aggressive',
    },
    {
        name: 'rich',
        more: 'richer',
        less: 'less rich',
    },
    {
        name: 'hard',
        more: 'harder',
        less: 'less hard',
    },
    {
        name: 'deep',
        more: 'deeper',
        less: 'less deep',
    },
    {
        name: 'thin',
        more: 'thinner',
        less: 'less thin',
    },
    {
        name: 'noisy',
        more: 'more noisy',
        less: 'less noisy',
    },
    {
        name: 'plucky',
        more: 'more plucky',
        less: 'less plucky',
    },
    {
        name: 'woody',
        more: 'more woody',
        less: 'less woody',
    },
    {
        name: 'clear',
        more: 'clearer',
        less: 'less clear',
    },
    {
        name: 'gritty',
        more: 'grittier',
        less: 'less gritty',
    },
    {
        name: 'dull',
        more: 'more dull',
        less: 'less dull',
    },
    {
        name: 'mellow',
        more: 'mellower',
        less: 'less mellow',
    },
    {
        name: 'dark',
        more: 'darker',
        less: 'less dark',
    },
    {
        name: 'sharp',
        more: 'sharper',
        less: 'less sharp',
    },
    {
        name: 'heavy',
        more: 'heavier',
        less: 'less heavy',
    },
    {
        name: 'muddy',
        more: 'muddier',
        less: 'less muddy',
    },
    {
        name: 'ringing',
        more: 'more ringing',
        less: 'less ringing',
    },
];

const default_synth = {
    id: 'default',
    preset: {
        attack_1: 0.15,
        decay_1: 0.25,
        sustain_1: 0.4,
        release_1: 0.3,
        coarse_2: 1,
        fine_2: 0,
        gain_2: 0.7,
        attack_2: 0.15,
        decay_2: 0.25,
        sustain_2: 0.4,
        release_2: 0.3,
        coarse_3: 1,
        fine_3: 0,
        gain_3: 0.7,
        attack_3: 0.15,
        decay_3: 0.25,
        sustain_3: 0.4,
        release_3: 0.3,
    }
};

const prompts = [0, 1, 2];
const pitches = [40, 57, 74];
const directions = ['more', 'less'];

function findLeastReferencedSynthPatches(synth_patches) {
    const synth_counts = {};
    const synths = {};
    for (const synth_doc of synth_patches) {
        const id = synth_doc.synth_id;
        synths[id] = {
            params: synth_doc.synth_parameters,
            note: synth_doc.note
        };
        synth_counts[id] = 0;
    }
    for (const synth_doc of synth_patches) {
        const ref = synth_doc.reference_sound;

        if (ref in synth_counts) synth_counts[ref] += 1;
    }
    const synth_ids = Object.keys(synth_counts);
    synth_ids.sort((a, b) => {
        if (synth_counts[a] > synth_counts[b]) return 1;
        else if (synth_counts[a] < synth_counts[b]) return -1;
        else return Math.random >= 0.5 ? 1 : -1;
    });

    shuffle(synth_ids);

    const patches = [];
    for (let n = 0; n < pitches.length; n++) {
        patches.push([]);

        const note = pitches[n];
        for (let i = 0; i < prompts.length; i++) {
            for (const id of synth_ids) {
                if (synths[id].note === note) {
                    patches[n].push({
                        id,
                        preset: synths[id].params
                    });

                    delete synths[id];
                    synth_ids.splice(synth_ids.indexOf(id), 1);
                    break;
                }
            }
        }
    }
    return patches;
}

function createExperimentSpec(db_collection) {
    const trials = [];
    const synth_patches = findLeastReferencedSynthPatches(db_collection);

    const date = new Date();
    const participant_id = md5(date.toString() + Math.random().toString);

    for (let descriptor_index of prompts) {
        for (let i = 0; i < pitches.length; i++) {
            const pitch = pitches[i];
            const trial = {};
            const ref_synth =
                synth_patches[i].length > 0 ? synth_patches[i].pop() : default_synth;
            const direction = directions[Math.floor(Math.random() * 2)];
            trial.semantic_prompt = {descriptor_index, direction};
            trial.note_pitch = pitch;
            trial.synth_preset = ref_synth.preset;
            trial.synth_id = ref_synth.id;

            trials.push(trial);
        }
    }
    shuffle(trials);
    return {semantic_descriptors, trials, participant_id};
}

module.exports = createExperimentSpec;