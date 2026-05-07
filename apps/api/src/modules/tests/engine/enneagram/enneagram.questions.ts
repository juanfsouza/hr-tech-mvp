/**
 * Enneagram Questions Bank — 36 pares de afirmações (A vs B)
 *
 * Baseado no RHETI (Riso-Hudson) simplificado — domínio público
 * Cada par mede dois tipos diferentes do Eneagrama
 */

import { EnneagramQuestionPair } from "@/modules/tests/domain/interfaces/enneagram-question-pair.interface";

export const ENNEAGRAM_QUESTIONS: EnneagramQuestionPair[] = [
  { id: 'enn-1', pairNumber: 1, statementA: 'Tenho altos padrões e me cobro por cumpri-los', statementB: 'Me preocupo muito com as necessidades dos outros', typeA: 1, typeB: 2 },
  { id: 'enn-2', pairNumber: 2, statementA: 'Gosto de ajudar as pessoas e me sinto útil fazendo isso', statementB: 'Sou orientado a metas e gosto de ser reconhecido por realizações', typeA: 2, typeB: 3 },
  { id: 'enn-3', pairNumber: 3, statementA: 'Foco em eficiência e imagem de sucesso', statementB: 'Me sinto diferente dos outros e valorizo autenticidade', typeA: 3, typeB: 4 },
  { id: 'enn-4', pairNumber: 4, statementA: 'Preciso de muito espaço para processar meus sentimentos', statementB: 'Prefiro observar e analisar antes de me envolver', typeA: 4, typeB: 5 },
  { id: 'enn-5', pairNumber: 5, statementA: 'Acumulo conhecimento para me sentir preparado', statementB: 'Sigo regras e busco segurança em sistemas confiáveis', typeA: 5, typeB: 6 },
  { id: 'enn-6', pairNumber: 6, statementA: 'Me preocupo com cenários de risco e prefiro me preparar', statementB: 'Gosto de diversidade de experiências e odeio limitações', typeA: 6, typeB: 7 },
  { id: 'enn-7', pairNumber: 7, statementA: 'Sou espontâneo e busco sempre novas possibilidades', statementB: 'Sou decidido e não me intimidio com conflitos', typeA: 7, typeB: 8 },
  { id: 'enn-8', pairNumber: 8, statementA: 'Tenho força e protejo as pessoas ao meu redor', statementB: 'Gosto de harmonia e evito conflitos', typeA: 8, typeB: 9 },
  { id: 'enn-9', pairNumber: 9, statementA: 'Processo as coisas no meu próprio ritmo', statementB: 'Me cobro muito para fazer o certo e o correto', typeA: 9, typeB: 1 },
  { id: 'enn-10', pairNumber: 10, statementA: 'Sou crítico comigo mesmo quando não atinjo meus padrões', statementB: 'Tenho facilidade em estabelecer conexões emocionais com as pessoas', typeA: 1, typeB: 2 },
  { id: 'enn-11', pairNumber: 11, statementA: 'Me preocupo com a impressão que causo nos outros', statementB: 'Tenho uma visão única do mundo e me sinto mal compreendido às vezes', typeA: 3, typeB: 4 },
  { id: 'enn-12', pairNumber: 12, statementA: 'Prefiro ambientes calmos e previsíveis', statementB: 'Confio mais em mim mesmo do que em opiniões externas', typeA: 9, typeB: 5 },
  { id: 'enn-13', pairNumber: 13, statementA: 'Tenho medo de ser enganado ou traído', statementB: 'Odeio ser limitado e quero explorar tudo que a vida tem a oferecer', typeA: 6, typeB: 7 },
  { id: 'enn-14', pairNumber: 14, statementA: 'Sou determinado e não tenho medo de enfrentar pessoas poderosas', statementB: 'Valorizo a paz e evito situações de conflito', typeA: 8, typeB: 9 },
  { id: 'enn-15', pairNumber: 15, statementA: 'Me dedico muito para melhorar processos e sistemas', statementB: 'Me sinto realizado quando ajudo alguém de forma significativa', typeA: 1, typeB: 2 },
  { id: 'enn-16', pairNumber: 16, statementA: 'Adapto meu comportamento conforme o contexto para ter sucesso', statementB: 'Tenho vida emocional rica e intensa', typeA: 3, typeB: 4 },
  { id: 'enn-17', pairNumber: 17, statementA: 'Sou independente e gosto de privacidade para pensar', statementB: 'Busco segurança em grupos e relacionamentos confiáveis', typeA: 5, typeB: 6 },
  { id: 'enn-18', pairNumber: 18, statementA: 'Fico entediado com rotinas e prefiro variedade', statementB: 'Não me curvo a imposições ou dominação de outros', typeA: 7, typeB: 8 },
  { id: 'enn-19', pairNumber: 19, statementA: 'Sou tranquilo e fácil de conviver', statementB: 'Tenho altos padrões e incomodo quando vejo trabalho desleixado', typeA: 9, typeB: 1 },
  { id: 'enn-20', pairNumber: 20, statementA: 'Sinto que preciso ser amado e apreciado', statementB: 'Valorizo conquistas e realizações concretas', typeA: 2, typeB: 3 },
  { id: 'enn-21', pairNumber: 21, statementA: 'Me identifico com sentimentos de melancolia e profundidade', statementB: 'Prefiro entender sistemas e conceitos complexos', typeA: 4, typeB: 5 },
  { id: 'enn-22', pairNumber: 22, statementA: 'Questiono sempre se estou fazendo a coisa certa', statementB: 'Prefiro ter muitas opções abertas a me comprometer com uma só', typeA: 6, typeB: 7 },
  { id: 'enn-23', pairNumber: 23, statementA: 'Sou protetor e defendo os mais vulneráveis', statementB: 'Me sinto bem em ambientes estáveis e harmoniosos', typeA: 8, typeB: 9 },
  { id: 'enn-24', pairNumber: 24, statementA: 'Sou organizado e gosto de tudo no lugar certo', statementB: 'Gosto de cuidar das pessoas e antecipar suas necessidades', typeA: 1, typeB: 2 },
  { id: 'enn-25', pairNumber: 25, statementA: 'Trabalho para construir uma imagem de competência e sucesso', statementB: 'Busco profundidade e autenticidade nas relações', typeA: 3, typeB: 4 },
  { id: 'enn-26', pairNumber: 26, statementA: 'Prefiro observar o mundo de longe antes de participar', statementB: 'Sinto necessidade de pertencer a algo sólido e confiável', typeA: 5, typeB: 6 },
  { id: 'enn-27', pairNumber: 27, statementA: 'Sou otimista e vejo oportunidades em tudo', statementB: 'Uso minha força para proteger o que é meu e dos que amo', typeA: 7, typeB: 8 },
  { id: 'enn-28', pairNumber: 28, statementA: 'Evito confrontos e busco o consenso', statementB: 'Me exijo muito e sinto raiva quando as coisas não são feitas direito', typeA: 9, typeB: 1 },
  { id: 'enn-29', pairNumber: 29, statementA: 'Me sinto realizado ajudando outros a crescerem', statementB: 'Estou focado em meus objetivos e resultados', typeA: 2, typeB: 3 },
  { id: 'enn-30', pairNumber: 30, statementA: 'Me sinto diferente e especial de formas que os outros não entendem', statementB: 'Gosto de acumular conhecimento antes de tomar decisões', typeA: 4, typeB: 5 },
  { id: 'enn-31', pairNumber: 31, statementA: 'Sou leal e me preocupo com traição e abandono', statementB: 'Odeio ficar parado — sempre busco novas aventuras', typeA: 6, typeB: 7 },
  { id: 'enn-32', pairNumber: 32, statementA: 'Tenho presença forte e as pessoas percebem minha autoridade', statementB: 'Sou receptivo e bom em mediar conflitos', typeA: 8, typeB: 9 },
  { id: 'enn-33', pairNumber: 33, statementA: 'Tenho princípios éticos claros e os sigo sempre', statementB: 'Me sinto mais feliz quando estou ajudando alguém', typeA: 1, typeB: 2 },
  { id: 'enn-34', pairNumber: 34, statementA: 'Sou versátil e adapto minha persona conforme o contexto', statementB: 'Tenho vida interior rica e complexa', typeA: 3, typeB: 4 },
  { id: 'enn-35', pairNumber: 35, statementA: 'Sou investigativo e curioso sobre como as coisas funcionam', statementB: 'Preciso de aprovação e suporte do grupo para me sentir seguro', typeA: 5, typeB: 6 },
  { id: 'enn-36', pairNumber: 36, statementA: 'Prefiro manter múltiplas opções em aberto', statementB: 'Assumo o comando quando a situação exige força', typeA: 7, typeB: 8 },
];
