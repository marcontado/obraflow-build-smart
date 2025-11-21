import { Moon, Sun, Monitor, Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";
import { useLocale } from "@/contexts/LocaleContext";

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Aparência</h3>
        <p className="text-sm text-muted-foreground">
          Personalize a aparência da interface
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-base">Tema</Label>
        <RadioGroup value={theme} onValueChange={setTheme} className="grid gap-4">
          <div className="flex items-center space-x-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="flex flex-1 items-center gap-3 cursor-pointer">
              <div className="rounded-full bg-primary/10 p-2">
                <Sun className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Claro</div>
                <div className="text-sm text-muted-foreground">
                  Interface clara e limpa
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
                <div className="font-medium">Escuro</div>
                <div className="text-sm text-muted-foreground">
                  Interface escura e moderna
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
                <div className="font-medium">Sistema</div>
                <div className="text-sm text-muted-foreground">
                  Segue a preferência do sistema operacional
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Dica:</strong> O tema escuro pode reduzir o cansaço visual em ambientes com pouca luz.
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-base">Idioma</Label>
        <RadioGroup value={locale} onValueChange={(value) => setLocale(value as 'pt' | 'en' | 'es')} className="grid gap-4">
          <div className="flex items-center space-x-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="pt" id="pt" />
            <Label htmlFor="pt" className="flex flex-1 items-center gap-3 cursor-pointer">
              <div className="rounded-full bg-primary/10 p-2 text-2xl">
                🇧🇷
              </div>
              <div>
                <div className="font-medium">Português</div>
                <div className="text-sm text-muted-foreground">
                  Idioma padrão do sistema
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
                <div className="font-medium">English</div>
                <div className="text-sm text-muted-foreground">
                  System language
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
                <div className="font-medium">Español</div>
                <div className="text-sm text-muted-foreground">
                  Idioma del sistema
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          🌍 <strong>Dica:</strong> As alterações de idioma são aplicadas imediatamente e salvas no seu perfil.
        </p>
      </div>
    </div>
  );
}
