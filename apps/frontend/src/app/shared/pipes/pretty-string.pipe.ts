import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pretty',
})
export class EnumPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) {
      return '';
    }

    return value.split('_').join(' ').toLowerCase();
  }
}
