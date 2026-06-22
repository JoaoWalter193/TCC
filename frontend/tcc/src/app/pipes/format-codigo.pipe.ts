import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatCodigo',
  standalone: true,
})
export class FormatCodigoPipe implements PipeTransform {
  transform(value: number | string): string {
    const s = String(value).replace(/\D/g, '');
    const padded = s.padStart(12, '0');
    return padded.slice(0, 3) + '.' + padded.slice(3, 8) + '.' + padded.slice(8, 12);
  }
}
