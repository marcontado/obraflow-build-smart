import { Link } from "react-router-dom";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Voltar para home
            </Link>
          </Button>

          <h1 className="text-4xl font-bold mb-4 text-foreground">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">1. Informações que Coletamos</h2>
              <p className="text-muted-foreground mb-2">Coletamos as seguintes informações:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>
                  <strong>Informações de cadastro:</strong> nome, email, telefone
                </li>
                <li>
                  <strong>Informações de uso:</strong> como você interage com nossa plataforma
                </li>
                <li>
                  <strong>Informações de projetos:</strong> dados que você adiciona sobre obras, clientes e tarefas
                </li>
                <li>
                  <strong>Informações técnicas:</strong> endereço IP, tipo de navegador, sistema operacional
                </li>
                <li>
                  <strong>Informações de pagamento:</strong> processadas de forma segura por terceiros (Stripe)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">2. Como Usamos suas Informações</h2>
              <p className="text-muted-foreground mb-2">Utilizamos seus dados para:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Processar pagamentos e gerenciar assinaturas</li>
                <li>Enviar atualizações importantes sobre o serviço</li>
                <li>Responder solicitações de suporte</li>
                <li>Personalizar sua experiência</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">3. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground mb-2">
                Não vendemos seus dados pessoais. Podemos compartilhar informações limitadas com:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>
                  <strong>Provedores de serviços:</strong> para hospedagem, processamento de pagamentos e analytics
                </li>
                <li>
                  <strong>Cumprimento legal:</strong> quando exigido por lei ou para proteger nossos direitos
                </li>
                <li>
                  <strong>Com seu consentimento:</strong> quando você autorizar explicitamente
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">4. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground mb-2">Conforme a Lei Geral de Proteção de Dados, você tem direito a:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Confirmar a existência de tratamento de seus dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados</li>
                <li>Solicitar a portabilidade de seus dados</li>
                <li>Revogar o consentimento</li>
                <li>Opor-se ao tratamento de dados</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Para exercer seus direitos, entre em contato pelo email:{" "}
                <a href="mailto:privacidade@archestra.com" className="text-primary hover:underline">
                  privacidade@archestra.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">5. Segurança dos Dados</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados, incluindo
                criptografia, controles de acesso e monitoramento contínuo. No entanto, nenhum método de transmissão
                pela internet é 100% seguro.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">6. Cookies</h2>
              <p className="text-muted-foreground mb-2">Utilizamos cookies para:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Manter você conectado</li>
                <li>Entender como você usa nossa plataforma</li>
                <li>Melhorar sua experiência de navegação</li>
                <li>Lembrar suas preferências</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Você pode controlar o uso de cookies através das configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">7. Retenção de Dados</h2>
              <p className="text-muted-foreground">
                Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta
                política, a menos que um período de retenção maior seja exigido ou permitido por lei.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">8. Alterações na Política</h2>
              <p className="text-muted-foreground">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças
                significativas por email ou através de um aviso em nossa plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">9. Contato do Encarregado de Dados</h2>
              <p className="text-muted-foreground">
                Para questões relacionadas a privacidade e proteção de dados, entre em contato com nosso Encarregado de
                Dados:
              </p>
              <p className="text-muted-foreground mt-2">
                Email:{" "}
                <a href="mailto:dpo@archestra.com" className="text-primary hover:underline">
                  dpo@archestra.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">10. Legislação Aplicável</h2>
              <p className="text-muted-foreground">
                Esta Política de Privacidade é regida pela Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) e
                demais legislações aplicáveis no Brasil.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Veja também nossos{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Termos de Uso
              </Link>
            </p>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
