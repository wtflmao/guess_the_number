module.exports = class Conf {
    constructor(multiplier, easyBase, normalBase, hardBase) {
        this.multiplier = multiplier;
        this.easyBase = easyBase;
        this.normalBase = normalBase;
        this.hardBase = hardBase;
    };

    getConf() {
        return new Conf(this.multiplier, this.easyBase, this.normalBase, this.hardBase);
    };

    toStr() {
        return `{\n\t"multiplier": "${this.multiplier}",\n\t"easyBase": "${this.easyBase}",\n\t"normalBase": "${this.normalBase}",\n\t"hardBase": "${this.hardBase}"\n}`;
    }

    fromString(jsonStr) {
        const obj = JSON.parse(jsonStr);
        return new Conf(obj.multiplier, obj.easyBase, obj.normalBase, obj.hardBase);
    }
}