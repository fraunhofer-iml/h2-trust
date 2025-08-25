import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prettyEnum',
})
export class PrettyEnumPipe implements PipeTransform {
  transform(value: string): string {
    return value.split('_').join(' ');
  }
}
