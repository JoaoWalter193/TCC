import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateNome',
  standalone: true,
})
export class TruncateNomePipe implements PipeTransform {
  transform(value: string, max = 24): string {
    if (!value || value.length <= max) return value;
    return value.substring(0, max - 3) + '...';
  }
}
