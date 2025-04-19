import { Injectable, OnModuleInit } from '@nestjs/common';

import { i18n } from '@lingui/core';

// Define constants directly instead of importing from twenty-shared/translations
const SOURCE_LOCALE = 'en';
const APP_LOCALES = {
  [SOURCE_LOCALE]: SOURCE_LOCALE,
  'pseudo-en': 'pseudo-en',
  'af-ZA': 'af-ZA',
  'ar-SA': 'ar-SA',
  'ca-ES': 'ca-ES',
  'cs-CZ': 'cs-CZ',
  'da-DK': 'da-DK',
  'de-DE': 'de-DE',
  'el-GR': 'el-GR',
  'es-ES': 'es-ES',
  'fi-FI': 'fi-FI',
  'fr-FR': 'fr-FR',
  'he-IL': 'he-IL',
  'hu-HU': 'hu-HU',
  'it-IT': 'it-IT',
  'ja-JP': 'ja-JP',
  'ko-KR': 'ko-KR',
  'nl-NL': 'nl-NL',
  'no-NO': 'no-NO',
  'pl-PL': 'pl-PL',
  'pt-BR': 'pt-BR',
  'pt-PT': 'pt-PT',
  'ro-RO': 'ro-RO',
  'ru-RU': 'ru-RU',
  'sr-Cyrl': 'sr-Cyrl',
  'sv-SE': 'sv-SE',
  'tr-TR': 'tr-TR',
  'uk-UA': 'uk-UA',
  'vi-VN': 'vi-VN',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
};

import { messages as afMessages } from 'src/engine/core-modules/i18n/locales/generated/af-ZA';
import { messages as arMessages } from 'src/engine/core-modules/i18n/locales/generated/ar-SA';
import { messages as caMessages } from 'src/engine/core-modules/i18n/locales/generated/ca-ES';
import { messages as csMessages } from 'src/engine/core-modules/i18n/locales/generated/cs-CZ';
import { messages as daMessages } from 'src/engine/core-modules/i18n/locales/generated/da-DK';
import { messages as deMessages } from 'src/engine/core-modules/i18n/locales/generated/de-DE';
import { messages as elMessages } from 'src/engine/core-modules/i18n/locales/generated/el-GR';
import { messages as enMessages } from 'src/engine/core-modules/i18n/locales/generated/en';
import { messages as esMessages } from 'src/engine/core-modules/i18n/locales/generated/es-ES';
import { messages as fiMessages } from 'src/engine/core-modules/i18n/locales/generated/fi-FI';
import { messages as frMessages } from 'src/engine/core-modules/i18n/locales/generated/fr-FR';
import { messages as heMessages } from 'src/engine/core-modules/i18n/locales/generated/he-IL';
import { messages as huMessages } from 'src/engine/core-modules/i18n/locales/generated/hu-HU';
import { messages as itMessages } from 'src/engine/core-modules/i18n/locales/generated/it-IT';
import { messages as jaMessages } from 'src/engine/core-modules/i18n/locales/generated/ja-JP';
import { messages as koMessages } from 'src/engine/core-modules/i18n/locales/generated/ko-KR';
import { messages as nlMessages } from 'src/engine/core-modules/i18n/locales/generated/nl-NL';
import { messages as noMessages } from 'src/engine/core-modules/i18n/locales/generated/no-NO';
import { messages as plMessages } from 'src/engine/core-modules/i18n/locales/generated/pl-PL';
import { messages as pseudoEnMessages } from 'src/engine/core-modules/i18n/locales/generated/pseudo-en';
import { messages as ptBRMessages } from 'src/engine/core-modules/i18n/locales/generated/pt-BR';
import { messages as ptPTMessages } from 'src/engine/core-modules/i18n/locales/generated/pt-PT';
import { messages as roMessages } from 'src/engine/core-modules/i18n/locales/generated/ro-RO';
import { messages as ruMessages } from 'src/engine/core-modules/i18n/locales/generated/ru-RU';
import { messages as srMessages } from 'src/engine/core-modules/i18n/locales/generated/sr-Cyrl';
import { messages as svMessages } from 'src/engine/core-modules/i18n/locales/generated/sv-SE';
import { messages as trMessages } from 'src/engine/core-modules/i18n/locales/generated/tr-TR';
import { messages as ukMessages } from 'src/engine/core-modules/i18n/locales/generated/uk-UA';
import { messages as viMessages } from 'src/engine/core-modules/i18n/locales/generated/vi-VN';
import { messages as zhHansMessages } from 'src/engine/core-modules/i18n/locales/generated/zh-CN';
import { messages as zhHantMessages } from 'src/engine/core-modules/i18n/locales/generated/zh-TW';

@Injectable()
export class I18nService implements OnModuleInit {
  async loadTranslations() {
    const messages: Record<keyof typeof APP_LOCALES, any> = {
      en: enMessages,
      'pseudo-en': pseudoEnMessages,
      'af-ZA': afMessages,
      'ar-SA': arMessages,
      'ca-ES': caMessages,
      'cs-CZ': csMessages,
      'da-DK': daMessages,
      'de-DE': deMessages,
      'el-GR': elMessages,
      'es-ES': esMessages,
      'fi-FI': fiMessages,
      'fr-FR': frMessages,
      'he-IL': heMessages,
      'hu-HU': huMessages,
      'it-IT': itMessages,
      'ja-JP': jaMessages,
      'ko-KR': koMessages,
      'nl-NL': nlMessages,
      'no-NO': noMessages,
      'pl-PL': plMessages,
      'pt-BR': ptBRMessages,
      'pt-PT': ptPTMessages,
      'ro-RO': roMessages,
      'ru-RU': ruMessages,
      'sr-Cyrl': srMessages,
      'sv-SE': svMessages,
      'tr-TR': trMessages,
      'uk-UA': ukMessages,
      'vi-VN': viMessages,
      'zh-CN': zhHansMessages,
      'zh-TW': zhHantMessages,
    };

    (Object.entries(messages) as [keyof typeof APP_LOCALES, any][]).forEach(
      ([locale, message]) => {
        i18n.load(locale, message);
      },
    );

    i18n.activate(SOURCE_LOCALE);
  }

  async onModuleInit() {
    await this.loadTranslations();
  }

  getLocale() {
    return i18n.locale;
  }

  _(id: string, values?: Record<string, any>) {
    return i18n._(id, values);
  }

  has(id: string) {
    return i18n.has(id);
  }

  activate(locale: string) {
    i18n.activate(locale);
  }
}
