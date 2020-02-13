const ADSRStates = {
    ATTACK: 'attack',
    DECAY: 'decay',
    SUSTAIN: 'sustain',
    RELEASE: 'release',
    SILENT: 'silent',
}

class ADSR {
    constructor (segmentLength) {
        this.phase_ = 0;
        this.segmentLength_ = segmentLength;
        this.state_ = ADSRStates.SILENT;

        this.attack_ = 0.1;
        this.decay_ = 0.5;
        this.sustain_ = 0.3;
        this.release_ = 0.4;

        this.releaseAmp_ = 0.0;
        this.lastEnvValue_ = 0.0;
    }

    setParams(attack, decay, sustain, release) {
        this.attack_ = attack * this.segmentLength_;
        this.decay_ = decay * this.segmentLength_;
        this.sustain_ = sustain;
        this.release_ = release * this.segmentLength_;
    }

    attack() {
        this.phase_ = 0;
        this.state_ = ADSRStates.ATTACK;
    }

    release() {
        if (this.state_ === ADSRStates.RELEASE 
            || this.state_ === ADSRStates.SILENT) return;

        this.releaseAmp_ = this.lastEnvValue_;
        this.state_ = ADSRStates.RELEASE;
    }

    process() {
        let envValue = 0.0;

        switch (this.state_) {
            case ADSRStates.ATTACK:
                if (this.phase_ < this.attack_) {
                    envValue = this.phase_ / this.attack_;
                    this.phase_ += 1;
                } else {
                    this.state_ = ADSRStates.DECAY;
                    this.phase_ = 0;
                    envValue = 1;
                }
            break;

            case ADSRStates.DECAY:
                if (this.phase_ < this.decay_) {
                    envValue =
                     (1 - this.phase_ / this.decay_) 
                     * (1 - this.sustain_) 
                     + this.sustain_;
                    this.phase_ += 1;
                } else {
                    this.state_ = ADSRStates.SUSTAIN;
                    this.phase_ = 0;
                    envValue = this.sustain_;
                }
            break;

            case ADSRStates.SUSTAIN:
                envValue = this.sustain_;
            break;

            case ADSRStates.RELEASE:
                if (this.phase_ < this.release_) {
                    envValue =
                        (1 - this.phase_ / this.release_) 
                        * this.releaseAmp_;
                    this.phase_ += 1;
                } else {
                    this.state_ = ADSRStates.SILENT;
                    this.phase_ = 0;
                }
            break;
        }

        this.lastEnvValue_ = envValue;
        return envValue;
    }
}

class FMSynthProcessor extends AudioWorkletProcessor {
    constructor () {
        super();

        this.envStageMaxLength = 3 * sampleRate;

        this.env1 = new ADSR(this.envStageMaxLength);
        this.env2 = new ADSR(this.envStageMaxLength);
        this.env3 = new ADSR(this.envStageMaxLength);

        this.op1_phase_ = 0.0;
        this.op2_phase_ = 0.0;
        this.op3_phase_ = 0.0;
        this.note_freq = 110.0;

        this.port.onmessage = event => {
            if (event.data.type === 'note_on') {
                this.noteOn(event.data.note);
            }
            else if (event.data.type === 'note_off') {
                this.noteOff();
            }
        };
    }

    noteOn(note) {
        this.note_freq = 2 ** ((note - 69)/12) * 440.0;
        this.env1.attack();
        this.env2.attack();
        this.env3.attack();
    }

    noteOff() {
        this.note_on_ = false;
        this.env1.release();
        this.env2.release();
        this.env3.release();
    }

    static get parameterDescriptors() {
        return [
            { name: 'coarse_1', defaultValue: 1.0 },
            { name: 'fine_1', defaultValue: 0.0 },
            { name: 'gain_1', defaultValue: 0.9 },
            { name: 'attack_1', defaultValue: 0.01 },
            { name: 'decay_1', defaultValue: 0.1 },
            { name: 'sustain_1', defaultValue: 0.0 },
            { name: 'release_1', defaultValue: 0.2 },
            { name: 'coarse_2', defaultValue: 1.0 },
            { name: 'fine_2', defaultValue: 0.0 },
            { name: 'gain_2', defaultValue: 0.0 },
            { name: 'attack_2', defaultValue: 0.3 },
            { name: 'decay_2', defaultValue: 0.1 },
            { name: 'sustain_2', defaultValue: 0.5 },
            { name: 'release_2', defaultValue: 0.2 },
            { name: 'coarse_3', defaultValue: 1.0 },
            { name: 'fine_3', defaultValue: 0.0 },
            { name: 'gain_3', defaultValue: 0.0 },
            { name: 'attack_3', defaultValue: 0.2 },
            { name: 'decay_3', defaultValue: 0.8 },
            { name: 'sustain_3', defaultValue: 0.5 },
            { name: 'release_3', defaultValue: 0.2 }
        ];
    }

    process(inputs, outputs, params) {
        this.env1.setParams(
            params.attack_1[0],
            params.decay_1[0],
            params.sustain_1[0],
            params.release_1[0]);
        this.env2.setParams(
            params.attack_2[0],
            params.decay_2[0],
            params.sustain_2[0],
            params.release_2[0]);
        this.env3.setParams(
            params.attack_3[0],
            params.decay_3[0],
            params.sustain_3[0],
            params.release_3[0]);

        for (let output of outputs) {
            for (let channel of output) {
                for (let n = 0; n < channel.length; n++) {
                    const env1_amp = this.env1.process();
                    const env2_amp = this.env2.process();
                    const env3_amp = this.env3.process();

                    const op3_out =
                        6.283 * env3_amp 
                        * params.gain_3[0] * Math.sin(this.op3_phase_);
                    const op2_out =
                        6.283 * env2_amp
                        * params.gain_2[0] * Math.sin(this.op2_phase_);
                    const op1_out = env1_amp * params.gain_1[0] * Math.sin(
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