type PinAttemptsRemaining = 0 | 1 | 2 | 3 | 4 | 5;

export interface ISettings {
    loading: boolean;
    error: boolean;
    biometrics: boolean;
    pin: boolean;
    pinAttemptsRemaining: PinAttemptsRemaining;
    theme: any;
    [key: string]: any;
}
