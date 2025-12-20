class CreatePix {
  static create_code(px) {
    let ret = "";

    for (const k in px) {
      const v = px[k];
      if (typeof v !== "object") {
        let value = k == 54 ? Number(v).toFixed(2) : this.removeSpecialChars(v);
        ret += this.c2(k) + this.cpm(value) + value;
      } else {
        const content = this.create_code(v);
        ret += this.c2(k) + this.cpm(content) + content;
      }
    }

    return ret;
  }

  static removeSpecialChars(txt) {
    return this.removeAccents(txt).replace(/\W/g, "");
  }

  static removeAccents(text) {
    const accents = "àáâäæãåāçćčèéêëēėęîïíīįìłñńôöòóœøōõßśšûüùúūÿžźż";
    const replacements = "aaaaaaaaaccceeeeeeiiiiilnnoooooooosssuuuuuyzzz";
    return text
      .split("")
      .map((c) => {
        const i = accents.indexOf(c);
        return i !== -1 ? replacements[i] : c;
      })
      .join("");
  }

  static cpm(text) {
    if (text.length > 99) {
      throw new Error(`Valor muito longo: ${text}`);
    }
    return this.c2(text.length);
  }

  static c2(input) {
    return input.toString().padStart(2, "0");
  }

  static crcChecksum(str) {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
      crc ^= str.charCodeAt(c) << 8;
      for (let i = 0; i < 8; i++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      }
    }
    const hex = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
    return hex;
  }
}

class Pix {
  static get_code(value , chavePix) {
   const pix = {
    "00": "01",
    "26": {
    "00": "BR.GOV.BCB.PIX",
    "01": chavePix
    },
    "52": "0000",
    "53": "986",
    "54": parseFloat(value),
     "58": "BR",
     "59": "DECOLAR",
    "60": "SAO PAULO",
    "62": {
    "05": "***"
        }
    };


    let payload = CreatePix.create_code(pix);
    payload += "6304";
    payload += CreatePix.crcChecksum(payload);

    return payload;
  }

  static get_qrcode(pix_code) {
    return `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(pix_code)}`;
  }
}

module.exports = Pix;
