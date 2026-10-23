// Texto-fonte da interface. O tipo Messages abaixo obriga todos os outros idiomas a ter as mesmas chaves.
const pt = {
  // Metadados / SEO
  metaTitle: "Aniimo Dex — Pokédex e tracker de capturas do Aniimo",
  metaTitleShort: "Aniimo Dex — tracker de capturas do Aniimo",
  metaDescription:
    "Acompanhe sua coleção de Aniimo: marque os capturados nas storages, incluindo formas regionais, umbral, cintilante e prismana. Projeto de fã, gratuito.",
  metaKeywords: "Aniimo, Aniimo Dex, lista de Aniimo, Aniimo capturados, formas regionais, Aniimo cintilante, Aniimo umbral, Aniimo prismana",
  ogTagline: "Marque seus Aniimo capturados: formas regionais, umbral, cintilante e prismana.",

  // Geral
  skipToContent: "Pular para o conteúdo",
  language: "Idioma",
  opensNewTab: " (abre em nova aba)",
  back: "← Voltar ao Aniimo Dex",
  privacy: "Privacidade",
  legalNotice: "Aviso legal",
  myAccount: "Minha conta",
  legalFallback: "Esta página está disponível em português e inglês.",

  // Cabeçalho
  variantsLegend: "Tipo de Aniimo",
  vNormal: "Normal",
  vUmbral: "Umbral",
  vShiny: "Cintilante",
  vPrismana: "Prismana",
  signIn: "Entrar",
  signOut: "Sair",
  searchPlaceholder: "Buscar Aniimo…",
  searchLabel: "Buscar Aniimo por nome ou número",

  // Avisos
  sharedBanner: "Coleção de {owner} · somente leitura.",
  sharedCta: "Monte a sua",
  loadErr: "Não foi possível carregar seu progresso salvo. As alterações ficam bloqueadas para não sobrescrever nada.",
  syncErr: "Algumas alterações ainda não foram salvas no servidor.",
  retry: "Tentar novamente",
  retryShort: "Tentar de novo",
  loading: "Carregando seu progresso…",

  // Storages e grade
  storages: "Storages",
  storageN: "Storage {n}",
  storageAria: "Storage {n}, {c} de {t} capturados",
  prevStorage: "Storage anterior",
  nextStorage: "Próximo storage",
  keyHint: " (tecla {k})",
  gridAria: "Storage {n} de {total}, tipo {variant}, {c} de {t} capturados",
  slotAria: "Número {id}, {name}, {element}",
  slotCaught: "capturado",
  slotNotCaught: "não capturado",

  // Painel
  panelAria: "Detalhes do Aniimo selecionado",
  stageN: "Estágio {n}",
  portraitAlt: "Ilustração de {name}",
  caught: "Capturado",
  notCaught: "Não capturado",
  markCaught: "Marcar como capturado",
  unmark: "Desmarcar",

  // Barra inferior
  barAria: "Progresso e ações",
  caughtOf: "{c}/{t} capturados",
  goToStorage: "Ir para o storage",
  markPage: "Marcar página toda",
  shortcuts: "Atalhos Q/E",
  reset: "Resetar",
  resetConfirm: "Apagar o progresso de {variant}?",

  // Anúncios para leitor de tela
  annMarked: "{name}: marcado como capturado",
  annUnmarked: "{name}: desmarcado",
  annPageAll: "Storage {n}: todos marcados",
  annPageNone: "Storage {n}: todos desmarcados",
  annReset: "Progresso de {variant} apagado",
  annVariant: "Tipo {variant}",

  // Rodapé
  fanBefore: "Projeto de fã, sem vínculo oficial com o jogo. Dados e imagens da ",
  fanAfter: ".",
  legalNav: "Informações legais",

  // Elementos
  elFire: "Fogo",
  elWater: "Água",
  elGrass: "Planta",
  elIce: "Gelo",
  elRock: "Pedra",
  elWind: "Vento",
  elElectric: "Elétrico",
  elDark: "Sombra",
  elHoly: "Luz",

  // Login
  signinTitle: "Entrar",
  signinText: "Entre para salvar seu progresso e acessá-lo em qualquer dispositivo.",
  signinWith: "Entrar com {provider}",
  signinNone: "Nenhum método de login está configurado.",
  signinError: "Não foi possível entrar. Tente novamente.",

  // Conta
  accountTitle: "Minha conta",
  signedAs: "Você entrou como {name}.",
  noName: "conta sem nome",
  yourId: "Seu identificador:",
  adminLink: "Abrir o painel de administração",
  shareTitle: "Compartilhar minha coleção",
  shareDesc:
    "Gere um link para mostrar seu progresso a quem você quiser. Quem tiver o link vê o nome de exibição e quais Aniimo você marcou, sem poder alterar nada. A página não aparece em buscas.",
  displayName: "Nome de exibição",
  saveName: "Salvar nome",
  nameSaved: "Nome salvo.",
  publicOn: "Link público ativado",
  publicEnabled: "Link público ativado.",
  publicDisabled: "Link público desativado.",
  yourLink: "Seu link:",
  copyLink: "Copiar link",
  copied: "Link copiado.",
  copyFail: "Não foi possível copiar automaticamente. Selecione o link e copie.",
  newLink: "Gerar novo link",
  newLinkDone: "Novo link gerado. O anterior deixou de funcionar.",
  signOutTitle: "Sair",
  signOutBtn: "Sair da conta",
  deleteTitle: "Excluir meus dados",
  deleteDesc: "Apaga seu progresso salvo e seu perfil público, e encerra a sessão. Não dá para desfazer.",
  deleteBtn: "Excluir meus dados…",
  sure: "Tem certeza?",
  yesDelete: "Sim, excluir tudo",
  cancel: "Cancelar",
  confirmDelete: "Confirmar exclusão",
  saveFail: "Não foi possível salvar. Tente de novo.",
  deleteFail: "Não foi possível excluir agora. Tente de novo.",
  sharedTitle: "Coleção de {owner}",
  sharedNotFound: "Coleção não encontrada",

  // Erros
  errTitle: "Não foi possível carregar",
  errText: "Algo deu errado ao buscar os dados. Isso costuma ser passageiro: tente de novo em instantes.",
  nfTitle: "Página não encontrada",
  nfText: "O endereço não existe ou foi removido.",
  nfBack: "Voltar ao Aniimo Dex",
};

export type Messages = typeof pt;
export default pt;
