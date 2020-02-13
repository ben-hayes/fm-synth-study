class FMSynthProcessor extends AudioWorkletProcessor {
    constructor () {
        super();

        this.op1_phase_ = 0.0;
        this.op2_phase_ = 0.0;
        this.op3_phase_ = 0.0;
        this.note_freq = 110.0;
    }

    static get parameterDescriptors() {
        return [
            { name: 'coarse_1', defaultValue: 1.0 },
            { name: 'fine_1', defaultValue: 0.0 },
            { name: 'gain_1', defaultValue: 0.0 },
            { name: 'attack_1', defaultValue: 0.0 },
            { name: 'decay_1', defaultValue: 0.1 },
            { name: 'sustain_1', defaultValue: 0.5 },
            { name: 'release_1', defaultValue: 0.2 },
            { name: 'coarse_2', defaultValue: 1.0 },
            { name: 'fine_2', defaultValue: 0.0 },
            { name: 'gain_2', defaultValue: 0.0 },
            { name: 'attack_2', defaultValue: 0.0 },
            { name: 'decay_2', defaultValue: 0.1 },
            { name: 'sustain_2', defaultValue: 0.5 },
            { name: 'release_2', defaultValue: 0.2 },
            { name: 'coarse_3', defaultValue: 1.0 },
            { name: 'fine_3', defaultValue: 0.0 },
            { name: 'gain_3', defaultValue: 0.0 },
            { name: 'attack_3', defaultValue: 0.0 },
            { name: 'decay_3', defaultValue: 0.1 },
            { name: 'sustain_3', defaultValue: 0.5 },
            { name: 'release_3', defaultValue: 0.2 }
        ];
    }

    process(inputs, outputs, params) {
        const coarse_1 = params.coarse_1[0];
        for (let output of outputs) {
            for (let channel of output) {
                for (let n = 0; n < channel.length; n++) {
                    const op3_out =
                        6.283 * params.gain_3[0] * Math.sin(this.op3_phase_);
                    const op2_out =
                        6.283 * params.gain_2[0] * Math.sin(this.op2_phase_);
                    const op1_out = params.gain_1[0] * Math.sin(
                        this.op1_phase_ + op2_out + op3_out);

                    const op1_multiplier =
                        params.coarse_1[0] + 0.001 * params.fine_1[0];
                    this.op1_phase_ +=
                        op1_multiplier * 
                            2.0 * Math.PI * this.note_freq / sampleRate;

                    const op2_multiplier =
                        params.coarse_2[0] + 0.001 * params.fine_2[0];
                    this.op2_phase_ +=
                        op2_multiplier * 
                            2.0 * Math.PI * this.note_freq / sampleRate;
                    
                    const op3_multiplier =
                        params.coarse_3[0] + 0.001 * params.fine_3[0];
                    this.op3_phase_ +=
                        op3_multiplier * 
                            2.0 * Math.PI * this.note_freq / sampleRate;

                    channel[n] = op1_out;
                }
            }
        }
        return true;
    }
}

registerProcessor('fm_synth_processor', FMSynthProcessor);