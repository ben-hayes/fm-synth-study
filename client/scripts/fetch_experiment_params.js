define(function() {
function fetchExperimentParams(num_samples) {
    const synth_params = [];
    const semantic_descriptors = [
        {
            name: 'brightness',
            less: 'less bright',
            more: 'brighter'
        },
        {
            name: 'darkness',
            less: 'less dark',
            more: 'darker'
        },
        {
            name: 'metallicness',
            less: 'less metallic',
            more: 'more metallic'
        }
    ];
    const semantic_prompts = [
        {
            descriptor_index: 2,
            direction: 'less'
        },
        {
            descriptor_index: 1,
            direction: 'more'
        },
        {
            descriptor_index: 0,
            direction: 'more'
        }
    ];
    for (let i = 0; i < num_samples; i++) {
        synth_params.push({
            'coarse_1': Math.ceil(Math.random() * 48),
            'fine_1': Math.floor (Math.random() * 999 - 499),
            'gain_1': Math.random(),
            'attack_1': Math.random(),
            'decay_1': Math.random(),
            'sustain_1': Math.random(),
            'release_1': Math.random(),
            'coarse_2': Math.ceil(Math.random() * 48),
            'fine_2': Math.floor (Math.random() * 999 - 499),
            'gain_2': Math.random(),
            'attack_2': Math.random(),
            'decay_2': Math.random(),
            'sustain_2': Math.random(),
            'release_2': Math.random(),
            'coarse_3': Math.ceil(Math.random() * 48),
            'fine_3': Math.floor (Math.random() * 999 - 499),
            'gain_3': Math.random(),
            'attack_3': Math.random(),
            'decay_3': Math.random(),
            'sustain_3': Math.random(),
            'release_3': Math.random()
        });
    }
    return {
        synth_params,
        semantic_descriptors,
        semantic_prompts
    };
}

return fetchExperimentParams;
})