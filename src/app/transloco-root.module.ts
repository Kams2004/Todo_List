import { NgModule } from '@angular/core';
import {
  TranslocoModule,
  TRANSLOCO_CONFIG,
  translocoConfig,
  TranslocoService,
  TRANSLOCO_TRANSPILER,
  DefaultTranspiler
} from '@ngneat/transloco';
import { provideTransloco } from '@ngneat/transloco';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';

@NgModule({
  exports: [TranslocoModule],
  imports: [HttpClientModule, TranslocoModule],
  providers: [
    provideTransloco({
      config: translocoConfig({
        availableLangs: ['en', 'fr'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: false
      }),
      loader: TranslocoHttpLoader
    }),
    {
      provide: TRANSLOCO_TRANSPILER,
      useClass: DefaultTranspiler
    }
  ]
})
export class TranslocoRootModule {
  constructor(private translocoService: TranslocoService) {
    this.translocoService.setDefaultLang('en');
  }
}
