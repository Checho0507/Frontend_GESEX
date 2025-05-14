// src/utils/fingerprint.ts
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const obtenerFingerprint = async (): Promise<string> => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
};
