function makeSynthPatchDoc(synth_data) {
    const synth_document = {
        participant_id: synth_data.metadata.participant_id,
        reference_sound: synth_data.metadata.reference_synth,
        semantic_differentials: {},
        prompt: {},
        synth_parameters: {},
    };
    for (const screen of synth_data.data) {
        if (screen.sender === 'synth') {
            for (const param in screen) {
                if (param.startsWith("param_")) {
                    synth_document.synth_parameters[
                            param.replace("param_", "")] = screen[param];
                }
            }
        }
        else if (screen.sender === 'prompt') {
            for (const param in screen) {
                if (param.startsWith("prompt_")) {
                    synth_document.prompt.descriptor = param.replace("prompt_", "");
                    synth_document.prompt.rating = screen[param];
                }
            }
        }
        else if (screen.sender === 'descriptor') {
            for (const param in screen) {
                if (param.startsWith("descriptor_")) {
                    synth_document.semantic_differentials[
                        param.replace("descriptor_", "")] = screen[param];
                }
            }
        }
    }
    return synth_document;
}

module.exports = makeSynthPatchDoc;