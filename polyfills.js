

String.prototype.capitalize = function () {
    return this.toLowerCase().replace(/\b\w/g, m => m.toUpperCase());
}

String.prototype.norm = function () {
    return this.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
