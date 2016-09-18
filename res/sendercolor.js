const sendercolor = function (nick) {
    var sendercolors = [
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
    ];

    var reflect = function (crc, n) {
        var j = 1, crcout = 0;
        for (var i = (1 << (n - 1)); i > 0; i >>= 1) {
            if ((crc & i) > 0) {
                crcout |= j;
            }
            j <<= 1;
        }
        return crcout;
    };

    var qChecksum = function (str) {
        var crc = 0xffff;
        var crcHighBitMask = 0x8000;

        for (var i = 0; i < str.length; i++) {
            var b = str.codePointAt(i);
            var c = reflect(b, 8);
            for (var j = 0x80; j > 0; j >>= 1) {
                var highBit = crc & crcHighBitMask;
                crc <<= 1;
                if ((c & j) > 0) {
                    highBit ^= crcHighBitMask;
                }
                if (highBit > 0) {
                    crc ^= 0x1021;
                }
            }
        }

        crc = reflect(crc, 16);
        crc ^= 0xffff;
        crc &= 0xffff;

        return crc;
    };

    var senderIndex = function (str) {
        var nickToHash = str.replace(/_*$/, "").toLowerCase();
        return qChecksum(nickToHash) & 0xF;
    };

    return sendercolors[senderIndex(nick)];
};