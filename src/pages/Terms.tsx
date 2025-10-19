import { Link } from "react-router-dom";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
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

          <h1 className="text-4xl font-bold mb-4 text-foreground">Termos de Uso</h1>
          <p className="text-sm text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground">
                Ao acessar e usar o Archestra, você concorda com estes Termos de Uso e com nossa Política de
                Privacidade. Se você não concordar com qualquer parte destes termos, não utilize nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground">
                O Archestra é uma plataforma SaaS de gestão de obras para designers de interiores, oferecendo
                ferramentas de organização de projetos, controle orçamentário, relatórios e portal do cliente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">3. Conta de Usuário</h2>
              <p className="text-muted-foreground mb-2">
                Você é responsável por manter a confidencialidade da sua conta e senha, e por todas as atividades que
                ocorram sob sua conta. Você concorda em:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Fornecer informações verdadeiras, precisas e completas</li>
                <li>Manter suas informações atualizadas</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                <li>Ser responsável por todas as atividades em sua conta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">4. Assinaturas e Pagamentos</h2>
              <p className="text-muted-foreground mb-2">
                Oferecemos diferentes planos de assinatura com recursos variados:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>O plano Atelier é gratuito e permanente</li>
                <li>Planos pagos são cobrados mensalmente ou anualmente</li>
                <li>Você pode cancelar sua assinatura a qualquer momento</li>
                <li>Reembolsos são processados conforme nossa política de reembolso</li>
                <li>Os preços podem ser alterados mediante aviso prévio de 30 dias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">5. Propriedade Intelectual</h2>
              <p className="text-muted-foreground">
                Todo o conteúdo, recursos e funcionalidades do Archestra são de propriedade exclusiva da empresa e
                protegidos por leis de direitos autorais e marcas registradas. Você mantém propriedade sobre os dados
                que adiciona ao sistema.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">6. Uso Aceitável</h2>
              <p className="text-muted-foreground mb-2">Você concorda em não:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Usar o serviço para fins ilegais ou não autorizados</li>
                <li>Tentar obter acesso não autorizado ao sistema</li>
                <li>Interferir ou interromper a integridade ou desempenho do serviço</li>
                <li>Transmitir vírus ou código malicioso</li>
                <li>Violar direitos de propriedade intelectual</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">7. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground">
                O Archestra é fornecido "como está". Não garantimos que o serviço será ininterrupto ou livre de erros.
                Em nenhuma circunstância seremos responsáveis por danos indiretos, incidentais ou consequenciais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">8. Modificações dos Termos</h2>
              <p className="text-muted-foreground">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre
                mudanças significativas por email ou através da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">9. Lei Aplicável</h2>
              <p className="text-muted-foreground">
                Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Quaisquer disputas serão
                resolvidas nos tribunais competentes do Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-foreground">10. Contato</h2>
              <p className="text-muted-foreground">
                Para questões sobre estes Termos de Uso, entre em contato conosco em:{" "}
                <a href="mailto:contato@archestra.com" className="text-primary hover:underline">
                  contato@archestra.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Veja também nossa{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
