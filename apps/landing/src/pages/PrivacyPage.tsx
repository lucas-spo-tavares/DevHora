import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function PrivacyPage() {
  return (
    <main className="section-frame py-10 md:py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <Badge variant="outline">Privacy Policy</Badge>
          <h1 className="font-display text-5xl leading-tight text-ink md:text-6xl">Politica de Privacidade do DevHora</h1>
          <p className="max-w-3xl text-lg leading-8 text-ink/74">
            Ultima atualizacao: 8 de junho de 2026. Esta politica descreve como o DevHora trata informacoes quando
            voce usa o aplicativo Android e o site `devhora.lucas-tavares.com`.
          </p>
        </div>

        <Card className="glass-panel rounded-[2.5rem]">
          <CardContent className="legal-copy p-7 md:p-10">
            <p>
              O DevHora foi criado para ajudar no registro de jornada e acompanhamento de horas trabalhadas. O app foi
              projetado para funcionar principalmente com armazenamento local no aparelho e nao exige criacao de conta.
            </p>

            <h2>1. Quem controla o aplicativo</h2>
            <p>
              O DevHora e operado por Lucas Tavares. Para duvidas sobre privacidade, tratamento de dados ou exercicio de
              direitos relacionados a esta politica, entre em contato por `dev@lucas-tavares.com`.
            </p>

            <h2>2. Quais dados o app processa</h2>
            <p>O app pode processar as seguintes categorias de informacao no proprio dispositivo:</p>
            <ul>
              <li>registros de jornada, como entrada, pausa, retorno e saida;</li>
              <li>configuracoes de calculo, como carga horaria diaria, data inicial e dias de trabalho;</li>
              <li>observacoes e ajustes manuais adicionados por voce;</li>
              <li>preferencias relacionadas a notificacoes;</li>
              <li>arquivos de backup e exportacoes CSV gerados a pedido do usuario.</li>
            </ul>

            <h2>3. Como os dados sao coletados</h2>
            <p>
              As informacoes sao inseridas diretamente por voce ao usar o aplicativo. O DevHora nao coleta dados
              pessoais sensiveis automaticamente e nao exige cadastro, login ou envio de documentos.
            </p>

            <h2>4. Onde os dados ficam armazenados</h2>
            <p>
              Por padrao, os dados de uso e configuracao ficam armazenados localmente no dispositivo. Quando voce opta
              por exportar um backup ou um arquivo CSV, o arquivo e salvo ou compartilhado conforme a acao escolhida por
              voce no proprio aparelho.
            </p>

            <h2>5. Como os dados sao usados</h2>
            <p>
              Os dados registrados no aplicativo sao usados para calcular jornada, mostrar saldo, permitir ajustes
              manuais, configurar lembretes e gerar backups ou exportacoes solicitadas por voce. O DevHora nao usa esses
              dados para publicidade comportamental ou venda de perfil de usuario.
            </p>

            <h2>6. Compartilhamento de dados</h2>
            <p>
              O DevHora nao vende dados pessoais. O app tambem nao compartilha automaticamente seus registros de jornada
              com terceiros. O compartilhamento de backups ou CSV acontece somente quando voce inicia manualmente essa
              acao usando os recursos do aparelho. O site pode utilizar infraestrutura AWS para entrega de conteudo e
              processamento de logs tecnicos estritamente necessarios para operacao, seguranca e disponibilidade.
            </p>

            <h2>7. Permissoes e recursos do dispositivo</h2>
            <p>O app pode solicitar acesso aos seguintes recursos, quando necessario para a funcionalidade escolhida:</p>
            <ul>
              <li>notificacoes, para lembrar eventos de jornada configurados por voce;</li>
              <li>armazenamento e selecao de arquivos, para importar ou exportar backups locais;</li>
              <li>compartilhamento do sistema, para enviar arquivos CSV ou backups a outro app, se voce solicitar.</li>
            </ul>

            <h2>8. Notificacoes</h2>
            <p>
              As notificacoes do DevHora sao configuradas localmente com base nas regras definidas no aplicativo. O app
              nao usa esse recurso para publicidade e nao envia mensagens promocionais por push.
            </p>

            <h2>9. Analytics, publicidade e rastreamento</h2>
            <p>
              O DevHora nao foi projetado para exibir anuncios dentro do aplicativo. Tambem nao utiliza, por padrao,
              SDKs de analytics de terceiros para perfilar comportamento do usuario no aparelho.
            </p>

            <h2>10. Retencao e exclusao de dados</h2>
            <p>
              Os registros e configuracoes locais permanecem no aparelho ate que voce os altere, restaure outro backup,
              limpe os dados do aplicativo ou desinstale o app. Backups e CSV exportados permanecem no local para onde
              foram enviados ate que voce os apague manualmente. Logs tecnicos do site, quando existentes, sao mantidos
              somente pelo periodo razoavelmente necessario para operacao, seguranca e diagnostico, e depois sao
              removidos, sobrescritos ou anonimizados conforme a configuracao da infraestrutura.
            </p>

            <h2>11. Site e download do APK</h2>
            <p>
              O site `devhora.lucas-tavares.com` serve conteudo estatico para apresentar o produto, disponibilizar esta
              politica e, quando aplicavel, oferecer o download direto do APK. Logs tecnicos padrao de infraestrutura,
              como requisicoes HTTP e metricas de entrega de conteudo, podem ser processados pela AWS para operacao e
              seguranca do servico.
            </p>

            <h2>12. Seguranca</h2>
            <p>
              O site e publicado com HTTPS e controles de infraestrutura para entrega segura do conteudo. No aplicativo,
              os registros de jornada sao armazenados localmente no aparelho e nao sao enviados a um backend proprio do
              DevHora para processamento rotineiro. Voce tambem e responsavel por proteger o dispositivo e gerenciar com
              cuidado backups, arquivos CSV e destinos de compartilhamento escolhidos por voce.
            </p>

            <h2>13. Criancas e adolescentes</h2>
            <p>
              O DevHora nao e direcionado especificamente a criancas. Se um responsavel legal acreditar que houve uso
              inadequado por menor de idade em desacordo com a legislacao aplicavel, recomenda-se interromper o uso e
              entrar em contato por `dev@lucas-tavares.com`.
            </p>

            <h2>14. Alteracoes nesta politica</h2>
            <p>
              Esta politica pode ser atualizada para refletir mudancas no aplicativo, em requisitos legais ou na
              infraestrutura de publicacao. A data de ultima atualizacao sera revisada sempre que houver alteracoes
              relevantes.
            </p>

            <h2>15. Contato</h2>
            <p>
              Para solicitacoes relacionadas a privacidade, exclusao de dados, suporte ou esclarecimentos sobre o
              DevHora, envie uma mensagem para `dev@lucas-tavares.com`.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
