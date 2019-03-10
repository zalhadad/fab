

String.prototype.capitalize = () => this.toLowerCase().replace(/\b\w/g, m => m.toUpperCase());

String.prototype.norm = () => this.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
