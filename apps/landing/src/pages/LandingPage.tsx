import { Bell, CalendarClock, Download, FolderSync, Gauge, PencilLine, Play, ShieldCheck, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { DownloadButton } from "@/components/DownloadButton";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSiteManifest } from "@/hooks/useSiteManifest";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: CalendarClock,
    title: "Ponto do dia com um toque",
    description: "Inicie jornada, marque pausas e feche o expediente sem navegar por telas desnecessarias."
  },
  {
    icon: Gauge,
    title: "Saldo visivel no contexto",
    description: "Veja horas feitas, previsto do periodo e banco acumulado com leitura imediata."
  },
  {
    icon: PencilLine,
    title: "Ajustes manuais sem drama",
    description: "Corrija dias atipicos e observacoes direto no app quando a rotina sair do plano."
  },
  {
    icon: FolderSync,
    title: "Backup local e exportacao",
    description: "Exporte CSV e mantenha seus dados com voce, sem cadastro e sem dependencia de nuvem."
  },
  {
    icon: Bell,
    title: "Lembretes de jornada",
    description: "Configure notificacoes para nao esquecer pausa, retorno ou encerramento do expediente."
  },
  {
    icon: ShieldCheck,
    title: "Privacidade por padrao",
    description: "Os registros ficam no aparelho e a politica explica com clareza o que o app faz e nao faz."
  }
];

const screenshotCards = [
  {
    src: "/generated/screenshots/today.png",
    alt: "Tela Hoje do DevHora",
    eyebrow: "Hoje",
    title: "Registro de jornada direto na tela principal",
    description: "Saldo do dia, status atual e pontos marcados ficam acessiveis no mesmo fluxo."
  },
  {
    src: "/generated/screenshots/progress.png",
    alt: "Tela Progresso do DevHora",
    eyebrow: "Progresso",
    title: "Leitura clara do periodo",
    description: "Banco de horas, horas previstas e compartilhamento de CSV em uma visao unica."
  },
  {
    src: "/generated/screenshots/adjust.png",
    alt: "Tela Ajuste do DevHora",
    eyebrow: "Ajustes",
    title: "Edicao manual para dias fora do roteiro",
    description: "Carregue um dia ja registrado e ajuste eventos, observacoes ou saldo quando necessario."
  },
  {
    src: "/generated/screenshots/config.png",
    alt: "Tela Configuracoes do DevHora",
    eyebrow: "Configuracoes",
    title: "Regras de calculo e notificacoes no seu controle",
    description: "Defina horas diarias, data inicial, dias de trabalho, alertas e opcoes de backup."
  }
];

const highlights = [
  "Android nativo via Expo",
  "Sem login obrigatorio",
  "Backup local importavel",
  "CSV pronto para compartilhar"
];

export function LandingPage() {
  const manifest = useSiteManifest();

  return (
    <main>
      <section className="section-frame overflow-hidden pb-20 pt-10 md:pb-28 md:pt-16">
        <div className="hero-grid">
          <div className="space-y-8">
            <Badge className="w-fit" variant="outline">
              jornada simples para quem quer so registrar e seguir o dia
            </Badge>

            <div className="space-y-6">
              <h1 className="max-w-4xl font-display text-5xl leading-[0.94] text-ink md:text-7xl">
                Controle de horas com cara de app leve, nao de planilha corporativa.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink/76 md:text-xl">
                O DevHora foi desenhado para registrar ponto, acompanhar saldo e corrigir excecoes com uma interface
                limpa, local e objetiva.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <DownloadButton available={manifest.hasApk} />
              <span
                aria-disabled="true"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "cursor-not-allowed justify-center opacity-60"
                )}
              >
                <Play className="h-4 w-4" />
                Em breve na Google Play
              </span>
              <Link className={buttonVariants({ size: "lg", variant: "secondary" })} to="/#screens">
                <Smartphone className="h-4 w-4" />
                Ver telas
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              {highlights.map((item) => (
                <Badge className="w-fit" key={item}>
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass-panel overflow-hidden rounded-[2.25rem] p-5 md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <PhoneFrame
                  alt="Tela hoje"
                  className="h-[426px] flex-1 md:h-[560px] md:max-w-[360px]"
                  src="/generated/screenshots/today.png"
                />
                <div className="flex flex-1 flex-col gap-4">
                  <Card className="overflow-hidden rounded-[2rem] border-none bg-moss text-white shadow-float">
                    <CardContent className="space-y-4 p-6">
                      <div className="text-sm uppercase tracking-[0.2em] text-white/65">Disponivel agora</div>
                      <div className="text-3xl font-semibold leading-tight">APK direto no site para teste interno</div>
                      <p className="m-0 text-sm leading-7 text-white/72">
                        Ideal para validar com colegas, RH ou uso pessoal antes da publicacao oficial na Play Store.
                      </p>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm text-white/88">
                        <Download className="h-4 w-4" />
                        arquivo servido no proprio dominio
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            <div className="absolute -left-4 bottom-6 hidden rounded-full bg-[#f4e8bf] px-4 py-3 text-sm font-semibold text-[#7a4f22] shadow-lg md:block">
              sem login • sem ruído • sem burocracia
            </div>
          </div>
        </div>
      </section>

      <section className="section-frame pb-20 md:pb-24" id="features">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Badge variant="warm">Features</Badge>
            <h2 className="max-w-3xl font-display text-4xl leading-tight md:text-5xl">
              Tudo o que importa em uma rotina real de jornada.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-ink/74">
            O desenho segue o proprio app: cards amplos, leitura rapida e interacoes que resolvem o problema sem
            enterrar a pessoa em configuracoes.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map(({ description, icon: Icon, title }) => (
            <Card className="glass-panel rounded-[2rem]" key={title}>
              <CardContent className="space-y-5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-moss">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-ink">{title}</h3>
                  <p className="m-0 text-base leading-7 text-ink/72">{description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-frame pb-20 md:pb-28" id="screens">
        <div className="mb-8 space-y-3">
          <Badge variant="outline">Telas reais do app</Badge>
          <h2 className="max-w-3xl font-display text-4xl leading-tight md:text-5xl">
            A landing usa screenshots do proprio produto para vender o que ele realmente entrega.
          </h2>
        </div>

        <div className="screen-grid">
          {screenshotCards.map((screen, index) => (
            <Card className="glass-panel overflow-hidden rounded-[2.2rem]" key={screen.title}>
              <CardContent className="grid gap-8 p-5 md:grid-cols-[0.85fr_1fr] md:p-7">
                <PhoneFrame
                  alt={screen.alt}
                  className={index % 2 === 0 ? "rotate-[-2deg]" : "rotate-[2deg]"}
                  src={screen.src}
                />
                <div className="flex flex-col justify-center space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-dusk">{screen.eyebrow}</div>
                  <h3 className="text-3xl font-semibold leading-tight text-ink">{screen.title}</h3>
                  <p className="m-0 text-base leading-7 text-ink/72">{screen.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-frame pb-20">
        <Card className="overflow-hidden rounded-[2.5rem] border-none bg-[#1f2f24] text-white shadow-float">
          <CardContent className="grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div className="space-y-4">
              <Badge className="w-fit bg-white/10 text-white" variant="default">
                download direto
              </Badge>
              <h2 className="max-w-2xl font-display text-4xl leading-tight md:text-5xl">
                Quer testar o app agora? Baixe o APK direto por aqui.
              </h2>
              <p className="m-0 max-w-2xl text-base leading-7 text-white/74">
                Instale no Android em poucos passos e veja como o DevHora funciona no uso real do dia a dia.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <DownloadButton available={manifest.hasApk} />
              <span
                aria-disabled="true"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "cursor-not-allowed justify-center opacity-60"
                )}
              >
                <Play className="h-4 w-4" />
                Em breve na Google Play
              </span>
              <Link className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "justify-center")} to="/privacy">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
