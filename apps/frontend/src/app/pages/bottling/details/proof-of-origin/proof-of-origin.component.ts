import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { SectionDto } from '@h2-trust/api';
import { PrettyEnumPipe } from '../../../../shared/pipes/format-enum.pipe';
import { BottlingService } from '../../../../shared/services/bottling/bottling.service';
import { BatchCardComponent } from './batch-card/batch-card.component';
import { ClassificationComponent } from './classification/classification.component';

@Component({
  selector: 'app-proof-of-origin',
  imports: [CommonModule, ClassificationComponent, BatchCardComponent, PrettyEnumPipe],
  templateUrl: './proof-of-origin.component.html',
})
export class ProofOfOriginComponent {
  id = input<string>('');
  constructor(private readonly bottlingService: BottlingService) {}

  sectionIndex$ = signal(-2);
  classificationIndex$ = signal<number[]>([0]);

  data$ = computed((): { sections: SectionDto[]; breadcrumbs: string[] } => {
    const sectionIndex = this.sectionIndex$();
    const classificationIndexes = this.classificationIndex$();
    const data = this.proofQuery.data();
    const breadcrumbs: string[] = [];

    if (sectionIndex > -1 && classificationIndexes.length > 0 && data) {
      let classification = data[sectionIndex];
      for (const index of classificationIndexes) {
        classification = classification.classifications[index];
        breadcrumbs.push(classification.name);
      }

      if (!classification) return { sections: data, breadcrumbs: breadcrumbs };

      const result: SectionDto[] = [
        {
          name: classification.name,
          batches: classification.batches,
          classifications: classification.classifications,
        },
      ];

      return { sections: result, breadcrumbs: breadcrumbs };
    }

    return { sections: data ?? [], breadcrumbs: breadcrumbs };
  });

  proofQuery = injectQuery(() => ({
    queryKey: ['proof-of-origin', this.id()],
    queryFn: () => {
      this.classificationIndex$.set([]);
      this.sectionIndex$.set(-1);
      return this.bottlingService.getProofOfOrigin(this.id() ?? '');
    },
    enabled: !!this.id(),
  }));

  setIndex(sectionIndex: number, classificationIndex: number) {
    this.sectionIndex$.set(sectionIndex);
    this.classificationIndex$.set([...this.classificationIndex$(), classificationIndex]);
  }

  navigate(index: number) {
    this.classificationIndex$.set(this.classificationIndex$().slice(0, index + 1));
  }

  back() {
    const length = this.classificationIndex$().length;
    if (length === 0) return;
    this.navigate(length - 2);
  }
}
