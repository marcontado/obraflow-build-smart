import { Moon, Sun, Monitor, Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";
import { useLocale } from "@/contexts/LocaleContext";
import { useTranslation } from 'react-i18next';

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation('settings');

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t('appearance.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {locale === 'pt' ? 'Personalize a aparência da interface' : 
           locale === 'en' ? 'Customize the interface appearance' :
           'Personalice la apariencia de la interfaz'}
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-base">{t('appearance.theme.title')}</Label>
        <RadioGroup value={theme} onValueChange={setTheme} className="grid gap-4">
          <div className="flex items-center space-x-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="flex flex-1 items-center gap-3 cursor-pointer">
              <div className="rounded-full bg-primary/10 p-2">
                <Sun className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">{t('appearance.theme.light')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('appearance.theme.description.light')}
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark" className="flex flex-1 items-center gap-3 cursor-pointer">
              <div className="rounded-full bg-primary/10 p-2">
                <Moon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">{t('appearance.theme.dark')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('appearance.theme.description.dark')}
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="system" id="system" />
            <Label htmlFor="system" className="flex flex-1 items-center gap-3 cursor-pointer">
              <div className="rounded-full bg-primary/10 p-2">
                <Monitor className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">{t('appearance.theme.system')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('appearance.theme.description.system')}
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          💡 <strong>
            {locale === 'pt' ? 'Dica' : locale === 'en' ? 'Tip' : 'Consejo'}:
          </strong> {locale === 'pt' ? 'O tema escuro pode reduzir o cansaço visual em ambientes com pouca luz.' :
                     locale === 'en' ? 'Dark theme can reduce eye strain in low-light environments.' :
                     'El tema oscuro puede reducir la fatiga visual en ambientes con poca luz.'}
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-base">{t('appearance.language.title')}</Label>
        <RadioGroup value={locale} onValueChange={(value) => setLocale(value as 'pt' | 'en' | 'es')} className="grid gap-4">
          <div className="flex items-center space-x-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="pt" id="pt" />
            <Label htmlFor="pt" className="flex flex-1 items-center gap-3 cursor-pointer">
              <div className="rounded-full bg-primary/10 p-2 text-2xl">
                🇧🇷
              </div>
              <div>
                <div className="font-medium">{t('appearance.language.pt')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('appearance.language.description.pt')}
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="en" id="en" />
            <Label htmlFor="en" className="flex flex-1 items-center gap-3 cursor-pointer">
              <div className="rounded-full bg-primary/10 p-2 text-2xl">
                🇺🇸
              </div>
              <div>
                <div className="font-medium">{t('appearance.language.en')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('appearance.language.description.en')}
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="es" id="es" />
            <Label htmlFor="es" className="flex flex-1 items-center gap-3 cursor-pointer">
              <div className="rounded-full bg-primary/10 p-2 text-2xl">
                🇪🇸
              </div>
              <div>
                <div className="font-medium">{t('appearance.language.es')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('appearance.language.description.es')}
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          🌍 <strong>
            {locale === 'pt' ? 'Dica' : locale === 'en' ? 'Tip' : 'Consejo'}:
          </strong> {locale === 'pt' ? 'As alterações de idioma são aplicadas imediatamente e salvas no seu perfil.' :
                     locale === 'en' ? 'Language changes are applied immediately and saved to your profile.' :
                     'Los cambios de idioma se aplican inmediatamente y se guardan en su perfil.'}
        </p>
      </div>
    </div>
  );
}
