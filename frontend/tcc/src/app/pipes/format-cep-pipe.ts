import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatCep',
  standalone: true,
})
export class FormatCepPipe implements PipeTransform {

  transform(value: number | string): string {
    const cepStr = value.toString().replace(/\D/g, '');

    if (cepStr.length !== 8) {
      return cepStr.toString();
    }

    return cepStr.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

}
