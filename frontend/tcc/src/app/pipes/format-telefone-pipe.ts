import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTelefone'
})
export class FormatTelefonePipe implements PipeTransform {

  transform(value: number | string): string {
    const telStr = value.toString().replace(/\D/g, '');

    if (telStr.length === 8) {
      return telStr.replace(/(\d{4})(\d{4})/, '$1-$2');
    }

    if (telStr.length === 9) {
      return telStr.replace(/(\d{5})(\d{4})/, '$1-$2');
    }

    if (telStr.length === 10) {
      return telStr.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    if (telStr.length === 11) {
      return telStr.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    return telStr;
  }

}
