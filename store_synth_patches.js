const md5 = require('md5');

function makeSynthPatchDoc(synth_data) {
    const synth_id =
        md5(Math.random().toString()
            + synth_data.reference_synth
            + synth_data.participant_id);
    const synth_document = {
        participant_id: synth_data.participant_id,
        synth_id,
        note: synth_data.note,
        reference_sound: synth_data.reference_synth,
        semantic_differentials: {},
        prompt: {},
        synth_parameters: {},
    };
    for (const param in synth_data.synth) {
        if (param.startsWith("param_")) {
            synth_document.synth_parameters[
                    param.replace("param_", "")] = synth_data.synth[param];
        }
    }
    for (const param in synth_data.prompt) {
        if (param.startsWith("prompt_")) {
            synth_document.prompt.descriptor = param.replace("prompt_", "");
            synth_document.prompt.rating = synth_data.prompt[param];
        }
    }
    for (const descriptor_screen of synth_data.descriptors) {
        for (const param in descriptor_screen) {
            if (param.startsWith("descriptor_")) {
                synth_document.semantic_differentials[
                    param.replace("descriptor_", "")] 
                        = descriptor_screen[param];
            }
        }
    }
    return synth_document;
}

module.exports = makeSynthPatchDoc;