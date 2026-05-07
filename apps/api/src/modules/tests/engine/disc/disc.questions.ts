/**
 * DISC Questions Bank — 28 blocos de 4 afirmações
 *
 * Cada bloco: candidato escolhe qual afirmação "MAIS" e qual "MENOS" o descreve
 * dimensão: D, I, S, C
 *
 * Fonte: Baseado no modelo clássico de William Marston (domínio público)
 */

import { DiscQuestionBlock } from "@/modules/tests/domain/interfaces/disc-question-block.interface";

export const DISC_QUESTIONS: DiscQuestionBlock[] = [
  {
    id: 'disc-1', blockNumber: 1,
    items: [
      { id: 'disc-1-D', text: 'Sou direto e vou ao ponto nas conversas', dimension: 'D' },
      { id: 'disc-1-I', text: 'Sou animado e contagio as pessoas ao meu redor', dimension: 'I' },
      { id: 'disc-1-S', text: 'Sou paciente e prefiro ambientes estáveis', dimension: 'S' },
      { id: 'disc-1-C', text: 'Sou cuidadoso e analiso tudo em detalhes', dimension: 'C' },
    ],
  },
  {
    id: 'disc-2', blockNumber: 2,
    items: [
      { id: 'disc-2-D', text: 'Aceito desafios difíceis sem hesitar', dimension: 'D' },
      { id: 'disc-2-I', text: 'Gosto de conhecer pessoas novas e fazer amizades', dimension: 'I' },
      { id: 'disc-2-S', text: 'Sou leal e comprometido com minha equipe', dimension: 'S' },
      { id: 'disc-2-C', text: 'Me preocupo com qualidade e precisão', dimension: 'C' },
    ],
  },
  {
    id: 'disc-3', blockNumber: 3,
    items: [
      { id: 'disc-3-D', text: 'Tomo decisões rapidamente, mesmo sem todas as informações', dimension: 'D' },
      { id: 'disc-3-I', text: 'Consigo motivar e inspirar pessoas com facilidade', dimension: 'I' },
      { id: 'disc-3-S', text: 'Prefiro ambientes harmoniosos e evito conflitos', dimension: 'S' },
      { id: 'disc-3-C', text: 'Sigo processos e procedimentos à risca', dimension: 'C' },
    ],
  },
  {
    id: 'disc-4', blockNumber: 4,
    items: [
      { id: 'disc-4-D', text: 'Sou determinado em atingir metas', dimension: 'D' },
      { id: 'disc-4-I', text: 'Gosto de trabalhar em grupo e colaborar', dimension: 'I' },
      { id: 'disc-4-S', text: 'Sou um ouvinte empático e paciente', dimension: 'S' },
      { id: 'disc-4-C', text: 'Prefiro ter certeza antes de agir', dimension: 'C' },
    ],
  },
  {
    id: 'disc-5', blockNumber: 5,
    items: [
      { id: 'disc-5-D', text: 'Sou competitivo e gosto de ganhar', dimension: 'D' },
      { id: 'disc-5-I', text: 'Sou entusiasta e otimista mesmo em situações difíceis', dimension: 'I' },
      { id: 'disc-5-S', text: 'Sou consistente e confiável nas minhas entregas', dimension: 'S' },
      { id: 'disc-5-C', text: 'Analiso riscos antes de tomar qualquer decisão', dimension: 'C' },
    ],
  },
  {
    id: 'disc-6', blockNumber: 6,
    items: [
      { id: 'disc-6-D', text: 'Tomo a liderança naturalmente em situações de crise', dimension: 'D' },
      { id: 'disc-6-I', text: 'Me comunico com facilidade em qualquer contexto', dimension: 'I' },
      { id: 'disc-6-S', text: 'Prefiro mudanças graduais a transformações radicais', dimension: 'S' },
      { id: 'disc-6-C', text: 'Tenho alta exigência com a qualidade do meu trabalho', dimension: 'C' },
    ],
  },
  {
    id: 'disc-7', blockNumber: 7,
    items: [
      { id: 'disc-7-D', text: 'Prefiro ter autonomia para decidir como fazer o meu trabalho', dimension: 'D' },
      { id: 'disc-7-I', text: 'Uso o humor para aliviar tensões no ambiente', dimension: 'I' },
      { id: 'disc-7-S', text: 'Priorizo relacionamentos de longo prazo', dimension: 'S' },
      { id: 'disc-7-C', text: 'Verifico e reviso meu trabalho antes de entregar', dimension: 'C' },
    ],
  },
  {
    id: 'disc-8', blockNumber: 8,
    items: [
      { id: 'disc-8-D', text: 'Enfrento problemas de frente sem evitar conflitos', dimension: 'D' },
      { id: 'disc-8-I', text: 'Sou persuasivo e consigo convencer as pessoas', dimension: 'I' },
      { id: 'disc-8-S', text: 'Me importo genuinamente com o bem-estar da equipe', dimension: 'S' },
      { id: 'disc-8-C', text: 'Sou sistemático e metódico na minha abordagem', dimension: 'C' },
    ],
  },
  {
    id: 'disc-9', blockNumber: 9,
    items: [
      { id: 'disc-9-D', text: 'Prefiro resultados rápidos a processos longos', dimension: 'D' },
      { id: 'disc-9-I', text: 'Adoro apresentações e estar no centro das atenções', dimension: 'I' },
      { id: 'disc-9-S', text: 'Sou pacificador em situações de conflito', dimension: 'S' },
      { id: 'disc-9-C', text: 'Mantenho registros detalhados e organizados', dimension: 'C' },
    ],
  },
  {
    id: 'disc-10', blockNumber: 10,
    items: [
      { id: 'disc-10-D', text: 'Gosto de desafios que exijam coragem e ousadia', dimension: 'D' },
      { id: 'disc-10-I', text: 'Conheço facilmente pessoas novas', dimension: 'I' },
      { id: 'disc-10-S', text: 'Adapto-me ao ritmo dos outros com facilidade', dimension: 'S' },
      { id: 'disc-10-C', text: 'Sou crítico e analítico nas minhas avaliações', dimension: 'C' },
    ],
  },
  {
    id: 'disc-11', blockNumber: 11,
    items: [
      { id: 'disc-11-D', text: 'Faço as coisas acontecerem mesmo sem apoio total', dimension: 'D' },
      { id: 'disc-11-I', text: 'Crio um ambiente positivo e animado ao meu redor', dimension: 'I' },
      { id: 'disc-11-S', text: 'Sou previsível e confiável para a minha equipe', dimension: 'S' },
      { id: 'disc-11-C', text: 'Prefiro dados e fatos a impressões subjetivas', dimension: 'C' },
    ],
  },
  {
    id: 'disc-12', blockNumber: 12,
    items: [
      { id: 'disc-12-D', text: 'Sou direto ao expressar minha opinião', dimension: 'D' },
      { id: 'disc-12-I', text: 'Sou espontâneo e improviso bem em situações inesperadas', dimension: 'I' },
      { id: 'disc-12-S', text: 'Gosto de ajudar os outros sem esperar reconhecimento', dimension: 'S' },
      { id: 'disc-12-C', text: 'Planejo cuidadosamente antes de agir', dimension: 'C' },
    ],
  },
  {
    id: 'disc-13', blockNumber: 13,
    items: [
      { id: 'disc-13-D', text: 'Prefiro liderar a seguir', dimension: 'D' },
      { id: 'disc-13-I', text: 'Motivo as pessoas com energia e entusiasmo', dimension: 'I' },
      { id: 'disc-13-S', text: 'Valorizo a estabilidade e previsibilidade', dimension: 'S' },
      { id: 'disc-13-C', text: 'Busco a perfeição em tudo que faço', dimension: 'C' },
    ],
  },
  {
    id: 'disc-14', blockNumber: 14,
    items: [
      { id: 'disc-14-D', text: 'Sou assertivo e defendo minhas ideias com firmeza', dimension: 'D' },
      { id: 'disc-14-I', text: 'Faço amigos facilmente e gosto de socializar', dimension: 'I' },
      { id: 'disc-14-S', text: 'Sou paciente mesmo em situações de pressão', dimension: 'S' },
      { id: 'disc-14-C', text: 'Me preocupo em fazer as coisas corretamente', dimension: 'C' },
    ],
  },
  {
    id: 'disc-15', blockNumber: 15,
    items: [
      { id: 'disc-15-D', text: 'Não me importo de tomar decisões impopulares', dimension: 'D' },
      { id: 'disc-15-I', text: 'Sou um bom contador de histórias e comunicador', dimension: 'I' },
      { id: 'disc-15-S', text: 'Prefiro cooperar a competir', dimension: 'S' },
      { id: 'disc-15-C', text: 'Tenho dificuldade em aceitar trabalho de baixa qualidade', dimension: 'C' },
    ],
  },
  {
    id: 'disc-16', blockNumber: 16,
    items: [
      { id: 'disc-16-D', text: 'Gosto de ambientes de trabalho ágeis e dinâmicos', dimension: 'D' },
      { id: 'disc-16-I', text: 'Uso criatividade para resolver problemas', dimension: 'I' },
      { id: 'disc-16-S', text: 'Sou confiável e cumpro minhas promessas', dimension: 'S' },
      { id: 'disc-16-C', text: 'Faço pesquisa extensiva antes de decidir', dimension: 'C' },
    ],
  },
  {
    id: 'disc-17', blockNumber: 17,
    items: [
      { id: 'disc-17-D', text: 'Prefiro agir a deliberar por muito tempo', dimension: 'D' },
      { id: 'disc-17-I', text: 'Gosto de ser reconhecido pelos meus feitos', dimension: 'I' },
      { id: 'disc-17-S', text: 'Ofereço suporte emocional à minha equipe', dimension: 'S' },
      { id: 'disc-17-C', text: 'Sou cético com afirmações sem evidências', dimension: 'C' },
    ],
  },
  {
    id: 'disc-18', blockNumber: 18,
    items: [
      { id: 'disc-18-D', text: 'Assumo riscos calculados para alcançar resultados', dimension: 'D' },
      { id: 'disc-18-I', text: 'Me adapto facilmente a novas pessoas e ambientes', dimension: 'I' },
      { id: 'disc-18-S', text: 'Valorizo relacionamentos profundos e duradouros', dimension: 'S' },
      { id: 'disc-18-C', text: 'Sigo padrões e regras estabelecidos com rigor', dimension: 'C' },
    ],
  },
  {
    id: 'disc-19', blockNumber: 19,
    items: [
      { id: 'disc-19-D', text: 'Sou eficiente e foco no que realmente importa', dimension: 'D' },
      { id: 'disc-19-I', text: 'Celebro vitórias da equipe com entusiasmo', dimension: 'I' },
      { id: 'disc-19-S', text: 'Trabalho melhor em ambientes tranquilos e organizados', dimension: 'S' },
      { id: 'disc-19-C', text: 'Documento tudo para garantir rastreabilidade', dimension: 'C' },
    ],
  },
  {
    id: 'disc-20', blockNumber: 20,
    items: [
      { id: 'disc-20-D', text: 'Supero obstáculos com determinação', dimension: 'D' },
      { id: 'disc-20-I', text: 'Inspiro outros com minha visão e entusiasmo', dimension: 'I' },
      { id: 'disc-20-S', text: 'Sou moderado e equilibrado nas minhas reações', dimension: 'S' },
      { id: 'disc-20-C', text: 'Tenho altos padrões para mim e para os outros', dimension: 'C' },
    ],
  },
  {
    id: 'disc-21', blockNumber: 21,
    items: [
      { id: 'disc-21-D', text: 'Gosto de estar no controle das situações', dimension: 'D' },
      { id: 'disc-21-I', text: 'Sou carismático e atraio pessoas naturalmente', dimension: 'I' },
      { id: 'disc-21-S', text: 'Tenho facilidade em ensinar e dar suporte', dimension: 'S' },
      { id: 'disc-21-C', text: 'Desafio hipóteses e questiono o status quo com dados', dimension: 'C' },
    ],
  },
  {
    id: 'disc-22', blockNumber: 22,
    items: [
      { id: 'disc-22-D', text: 'Coloco resultados acima de processos quando necessário', dimension: 'D' },
      { id: 'disc-22-I', text: 'Gosto de novas ideias e brainstormings criativos', dimension: 'I' },
      { id: 'disc-22-S', text: 'Sou discreto e evito conflitos desnecessários', dimension: 'S' },
      { id: 'disc-22-C', text: 'Tomo decisões baseadas em análise objetiva', dimension: 'C' },
    ],
  },
  {
    id: 'disc-23', blockNumber: 23,
    items: [
      { id: 'disc-23-D', text: 'Tenho alta tolerância a pressão e urgência', dimension: 'D' },
      { id: 'disc-23-I', text: 'Sou positivo mesmo em situações adversas', dimension: 'I' },
      { id: 'disc-23-S', text: 'Me importo com o bem-estar de todos ao redor', dimension: 'S' },
      { id: 'disc-23-C', text: 'Prefiro comunicação escrita e formal a verbal', dimension: 'C' },
    ],
  },
  {
    id: 'disc-24', blockNumber: 24,
    items: [
      { id: 'disc-24-D', text: 'Agi rapidamente frente a oportunidades', dimension: 'D' },
      { id: 'disc-24-I', text: 'Uso networking para abrir portas e criar oportunidades', dimension: 'I' },
      { id: 'disc-24-S', text: 'Sou um membro confiável de qualquer equipe', dimension: 'S' },
      { id: 'disc-24-C', text: 'Mantenho alta precisão mesmo sob pressão', dimension: 'C' },
    ],
  },
  {
    id: 'disc-25', blockNumber: 25,
    items: [
      { id: 'disc-25-D', text: 'Defendo meu ponto de vista com convicção', dimension: 'D' },
      { id: 'disc-25-I', text: 'Sou otimista quanto ao futuro e possibilidades', dimension: 'I' },
      { id: 'disc-25-S', text: 'Promovo harmonia e cooperação no time', dimension: 'S' },
      { id: 'disc-25-C', text: 'Avalio situações de forma imparcial e objetiva', dimension: 'C' },
    ],
  },
  {
    id: 'disc-26', blockNumber: 26,
    items: [
      { id: 'disc-26-D', text: 'Tenho iniciativa para resolver problemas sem ser pedido', dimension: 'D' },
      { id: 'disc-26-I', text: 'Construo relacionamentos com facilidade e rapidez', dimension: 'I' },
      { id: 'disc-26-S', text: 'Sou paciente e não perco a calma facilmente', dimension: 'S' },
      { id: 'disc-26-C', text: 'Verifico e confirmo informações antes de agir', dimension: 'C' },
    ],
  },
  {
    id: 'disc-27', blockNumber: 27,
    items: [
      { id: 'disc-27-D', text: 'Gosto de metas desafiadoras e ambiciosas', dimension: 'D' },
      { id: 'disc-27-I', text: 'Me expresso bem em público e gosto de palestrar', dimension: 'I' },
      { id: 'disc-27-S', text: 'Prefiro cooperação a disputas de poder', dimension: 'S' },
      { id: 'disc-27-C', text: 'Tenho alta autoexigência em relação a erros', dimension: 'C' },
    ],
  },
  {
    id: 'disc-28', blockNumber: 28,
    items: [
      { id: 'disc-28-D', text: 'Não me intimido com autoridades ou pressão externa', dimension: 'D' },
      { id: 'disc-28-I', text: 'Crio um ambiente de trabalho divertido e engajante', dimension: 'I' },
      { id: 'disc-28-S', text: 'Sou dedicado e comprometido com minha equipe', dimension: 'S' },
      { id: 'disc-28-C', text: 'Identifico erros e inconsistências com facilidade', dimension: 'C' },
    ],
  },
];
