class SenderColorHandler {
    constructor(sendercolors = [
        "#e90d7f",
        "#8e55e9",
        "#b30e0e",
        "#17b339",
        "#58afb3",
        "#9d54b3",
        "#b39775",
        "#3176b3",
        "#e90d7f",
        "#8e55e9",
        "#b30e0e",
        "#17b339",
        "#58afb3",
        "#9d54b3",
        "#b39775",
        "#3176b3"
    ]) {
        this.sendercolors = sendercolors;
    }

    static reflect(crc, n) {
        let j = 1, crcout = 0;
        for (let i = (1 << (n - 1)); i > 0; i >>= 1) {
            if ((crc & i) > 0) {
                crcout |= j;
            }
            j <<= 1;
        }
        return crcout;
    }

    static qChecksum(str) {
        let crc = 0xffff;
        const crcHighBitMask = 0x8000;

        for (let i = 0; i < str.length; i++) {
            const b = str.codePointAt(i);
            const c = SenderColorHandler.reflect(b, 8);
            for (let j = 0x80; j > 0; j >>= 1) {
                let highBit = crc & crcHighBitMask;
                crc <<= 1;
                if ((c & j) > 0) {
                    highBit ^= crcHighBitMask;
                }
                if (highBit > 0) {
                    crc ^= 0x1021;
                }
            }
        }

        crc = SenderColorHandler.reflect(crc, 16);
        crc ^= 0xffff;
        crc &= 0xffff;

        return crc;
    }

    static senderIndex(str) {
        const nickToHash = str.replace(/_*$/, "").toLowerCase();
        return SenderColorHandler.qChecksum(nickToHash) & 0xF;
    }

    nickToColor(nick) {
        return this.sendercolors[SenderColorHandler.senderIndex(nick)];
    }
}