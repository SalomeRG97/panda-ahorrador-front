import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pandaCurrency',
  standalone: true
})
export class PandaCurrencyPipe implements PipeTransform {
  private formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  transform(value: number | string | null | undefined): string {
    if (value == null || value === '') return '$ 0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '$ 0';
    // Intl.NumberFormat('es-CO') outputs like "$\xa01.250.000" — we normalize spacing
    return this.formatter.format(num).replace(/\s/g, ' ');
  }
}
