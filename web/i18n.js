(() => {
  'use strict';

  const supportedLanguages = Object.freeze(['en', 'it', 'ko', 'ja', 'es', 'fr', 'pt']);
  const localeMap = Object.freeze({
    en: 'en-US',
    it: 'it-IT',
    ko: 'ko-KR',
    ja: 'ja-JP',
    es: 'es-ES',
    fr: 'fr-FR',
    pt: 'pt-BR',
  });
  let currentLanguage = 'en';

  const entries = {
    eyebrow: [
      'POKETOKENDOCKER · LOCAL COMPANION',
      'POKETOKENDOCKER · COMPANION LOCALE',
      'POKETOKENDOCKER · 로컬 컴패니언',
      'POKETOKENDOCKER · ローカルコンパニオン',
      'POKETOKENDOCKER · COMPAÑERO LOCAL',
      'POKETOKENDOCKER · COMPAGNON LOCAL',
      'POKETOKENDOCKER · COMPANHEIRO LOCAL',
    ],
    pageTitle: ['PokeTokenDocker Home', 'Home PokeTokenDocker', 'PokeTokenDocker 홈', 'PokeTokenDocker ホーム', 'Inicio de PokeTokenDocker', 'Accueil PokeTokenDocker', 'Início do PokeTokenDocker'],
    workspaceTitle: ['Companion workspace', 'Workspace del companion', '컴패니언 워크스페이스', 'コンパニオンワークスペース', 'Espacio del compañero', 'Espace du compagnon', 'Área do companheiro'],
    settingsButton: ['⚙ Settings', '⚙ Impostazioni', '⚙ 설정', '⚙ 設定', '⚙ Ajustes', '⚙ Paramètres', '⚙ Configurações'],
    refreshButton: ['↻ Refresh', '↻ Aggiorna', '↻ 새로 고침', '↻ 更新', '↻ Actualizar', '↻ Actualiser', '↻ Atualizar'],
    unknownStatus: ['docker · unknown', 'docker · sconosciuto', 'docker · 알 수 없음', 'docker · 不明', 'docker · desconocido', 'docker · inconnu', 'docker · desconhecido'],
    publicMode: ['public read-only', 'pubblico read-only', '공개 읽기 전용', '公開読み取り専用', 'público de solo lectura', 'public en lecture seule', 'público somente leitura'],
    localMode: ['local', 'locale', '로컬', 'ローカル', 'local', 'local', 'local'],
    overview: ['overview', 'panoramica', '개요', '概要', 'resumen', 'aperçu', 'visão geral'],
    inventory: ['inventory', 'inventario', '인벤토리', 'インベントリ', 'inventario', 'inventaire', 'inventário'],
    home: ['Home', 'Home', '홈', 'ホーム', 'Inicio', 'Accueil', 'Início'],
    bag: ['Bag', 'Borsa', '가방', 'バッグ', 'Bolsa', 'Sac', 'Bolsa'],
    shop: ['Shop', 'Negozio', '상점', 'ショップ', 'Tienda', 'Boutique', 'Loja'],
    pokedex: ['Pokédex', 'Pokédex', 'Pokédex', 'ポケモン図鑑', 'Pokédex', 'Pokédex', 'Pokédex'],
    workspaceAria: ['PokeTokenDocker windows', 'Finestre PokeTokenDocker', 'PokeTokenDocker 창', 'PokeTokenDocker ウィンドウ', 'Ventanas de PokeTokenDocker', 'Fenêtres PokeTokenDocker', 'Janelas do PokeTokenDocker'],
    loadingRarity: ['EGG', 'UOVO', '알', 'タマゴ', 'HUEVO', 'ŒUF', 'OVO'],
    loadingEggName: ['Incubating egg', 'Uovo in incubazione', '부화 중인 알', '孵化中のタマゴ', 'Huevo en incubación', 'Œuf en incubation', 'Ovo em incubação'],
    loadingDetail: ['Reading local usage in read-only mode.', 'Leggo l’utilizzo locale in sola lettura.', '읽기 전용으로 로컬 사용량을 읽는 중입니다.', 'ローカル使用量を読み取り専用で読み込んでいます。', 'Leyendo el uso local en modo de solo lectura.', 'Lecture de l’utilisation locale en lecture seule.', 'Lendo o uso local em modo somente leitura.'],
    progressAria: ['Egg progress', 'Progresso uovo', '알 진행도', 'タマゴの進行度', 'Progreso del huevo', 'Progression de l’œuf', 'Progresso do ovo'],
    loadingProgress: ['0% · loading data', '0% · dati in caricamento', '0% · 데이터 로드 중', '0% · データ読み込み中', '0% · cargando datos', '0 % · chargement des données', '0% · carregando dados'],
    wallet: ['Wallet', 'Wallet', '지갑', 'ウォレット', 'Cartera', 'Portefeuille', 'Carteira'],
    spendableTokens: ['spendable tokens', 'token spendibili', '사용 가능한 토큰', '使用可能トークン', 'tokens disponibles', 'jetons disponibles', 'tokens disponíveis'],
    today: ['Today', 'Oggi', '오늘', '今日', 'Hoy', 'Aujourd’hui', 'Hoje'],
    readTokens: ['tokens read', 'token letti', '읽은 토큰', '読み取りトークン', 'tokens leídos', 'jetons lus', 'tokens lidos'],
    week: ['Week', 'Settimana', '이번 주', '今週', 'Semana', 'Semaine', 'Semana'],
    source: ['Source', 'Fonte', '소스', 'ソース', 'Fuente', 'Source', 'Fonte'],
    local: ['local', 'locale', '로컬', 'ローカル', 'local', 'local', 'local'],
    noUpload: ['no upload', 'nessun upload', '업로드 없음', 'アップロードなし', 'sin carga', 'aucun envoi', 'sem upload'],
    provider: ['Provider', 'Provider', '제공자', 'プロバイダー', 'Proveedor', 'Fournisseur', 'Provedor'],
    officialLimits: ['Official limits', 'Limiti ufficiali', '공식 한도', '公式上限', 'Límites oficiales', 'Limites officiels', 'Limites oficiais'],
    homeReadOnlyCallout: ['This public instance is read-only: no action changes the wallet.', 'Questa istanza è pubblica e read-only: nessuna azione modifica il wallet.', '이 공개 인스턴스는 읽기 전용이므로 지갑을 변경할 수 없습니다.', 'この公開インスタンスは読み取り専用です。ウォレットは変更されません。', 'Esta instancia pública es de solo lectura: ninguna acción modifica la cartera.', 'Cette instance publique est en lecture seule : aucune action ne modifie le portefeuille.', 'Esta instância pública é somente leitura: nenhuma ação altera a carteira.'],
    homeLocalCallout: ['This Home uses the configured local service. The Hermes database remains read-only.', 'La Home browser usa il servizio configurato. Il database Hermes resta read-only.', '이 홈은 구성된 로컬 서비스를 사용합니다. Hermes 데이터베이스는 읽기 전용입니다.', 'このホームは設定済みのローカルサービスを使用します。Hermes データベースは読み取り専用です。', 'Este inicio usa el servicio local configurado. La base de datos de Hermes permanece en modo de solo lectura.', 'Cette page utilise le service local configuré. La base Hermes reste en lecture seule.', 'Esta página usa o serviço local configurado. O banco Hermes permanece somente leitura.'],
    bagIntro: ['Companion resources.', 'Risorse del companion.', '컴패니언 리소스입니다.', 'コンパニオンのリソース。', 'Recursos del compañero.', 'Ressources du compagnon.', 'Recursos do companheiro.'],
    bagCallout: ['The displayed items come from local companion state.', 'Gli oggetti mostrati arrivano dallo stato locale del companion.', '표시된 아이템은 로컬 컴패니언 상태에서 가져옵니다.', '表示されるアイテムはローカルのコンパニオン状態から取得されます。', 'Los objetos mostrados proceden del estado local del compañero.', 'Les objets affichés proviennent de l’état local du compagnon.', 'Os itens exibidos vêm do estado local do companheiro.'],
    shopIntro: ['Use wallet tokens.', 'Usa i token del wallet.', '지갑 토큰을 사용합니다.', 'ウォレットのトークンを使います。', 'Usa los tokens de la cartera.', 'Utilisez les jetons du portefeuille.', 'Use os tokens da carteira.'],
    collectionDexDescription: ['discovered species, sorted by number', 'specie scoperte, ordinate per numero', '발견한 종을 번호순으로 정렬', '発見した種を番号順に表示', 'especies descubiertas, ordenadas por número', 'espèces découvertes, triées par numéro', 'espécies descobertas, ordenadas por número'],
    collectionLogDescription: ['active and completed catches', 'attivo e catture concluse', '활성 및 완료된 포획', '育成中と捕獲完了', 'activo y capturas completadas', 'actif et captures terminées', 'ativo e capturas concluídas'],
    scrollExplore: ['scroll to explore', 'scorri per esplorare', '스크롤하여 탐색', 'スクロールして探索', 'desplázate para explorar', 'faites défiler pour explorer', 'role para explorar'],
    pokedexViewAria: ['Pokédex view', 'Vista Pokédex', 'Pokédex 보기', '図鑑ビュー', 'Vista de Pokédex', 'Vue du Pokédex', 'Visualização da Pokédex'],
    pokedexTab: ['Pokémon', 'Pokémon', 'Pokémon', 'ポケモン', 'Pokémon', 'Pokémon', 'Pokémon'],
    catchLogTab: ['Catch log', 'Registro catture', '포획 기록', '捕獲記録', 'Registro de capturas', 'Journal des captures', 'Registro de capturas'],
    settingsTitle: ['All settings', 'Tutte le impostazioni', '모든 설정', 'すべての設定', 'Todos los ajustes', 'Tous les paramètres', 'Todas as configurações'],
    settingsDescription: ['Changes are saved in companion state.', 'Le modifiche vengono salvate nello stato del companion.', '변경 사항은 컴패니언 상태에 저장됩니다.', '変更はコンパニオンの状態に保存されます。', 'Los cambios se guardan en el estado del compañero.', 'Les modifications sont enregistrées dans l’état du compagnon.', 'As alterações são salvas no estado do companheiro.'],
    settingsCloseAria: ['Close settings', 'Chiudi impostazioni', '설정 닫기', '設定を閉じる', 'Cerrar ajustes', 'Fermer les paramètres', 'Fechar configurações'],
    actionFailed: ['Unable to complete the action.', 'Impossibile completare l’azione.', '작업을 완료할 수 없습니다.', '操作を完了できません。', 'No se puede completar la acción.', 'Impossible de terminer l’action.', 'Não foi possível concluir a ação.'],
    updated: ['Updated.', 'Aggiornato.', '업데이트되었습니다.', '更新しました。', 'Actualizado.', 'Mis à jour.', 'Atualizado.'],
    connected: ['Connected to the local service.', 'Connesso al servizio locale.', '로컬 서비스에 연결되었습니다.', 'ローカルサービスに接続しました。', 'Conectado al servicio local.', 'Connecté au service local.', 'Conectado ao serviço local.'],
    exported: ['Save exported.', 'Salvataggio esportato.', '저장 데이터를 내보냈습니다.', 'セーブデータをエクスポートしました。', 'Guardado exportado.', 'Sauvegarde exportée.', 'Salvamento exportado.'],
    imported: ['Save imported.', 'Salvataggio importato.', '저장 데이터를 가져왔습니다.', 'セーブデータをインポートしました。', 'Guardado importado.', 'Sauvegarde importée.', 'Salvamento importado.'],
    activePokemon: ['Active Pokémon', 'Pokémon attivo', '활성 Pokémon', '現在のポケモン', 'Pokémon activo', 'Pokémon actif', 'Pokémon ativo'],
    incubatingEgg: ['Incubating egg', 'Uovo in incubazione', '부화 중인 알', '孵化中のタマゴ', 'Huevo en incubación', 'Œuf en incubation', 'Ovo em incubação'],
    shiny: ['Shiny', 'Shiny', '색이 다른', '色違い', 'Shiny', 'Chromatique', 'Shiny'],
    nature: ['Nature', 'Natura', '성격', '性格', 'Naturaleza', 'Nature', 'Natureza'],
    stage: ['Stage', 'Fase', '단계', '段階', 'Fase', 'Stade', 'Estágio'],
    activeCompanion: ['active companion', 'companion attivo', '활성 컴패니언', '育成中のコンパニオン', 'compañero activo', 'compagnon actif', 'companheiro ativo'],
    tokensToHatch: ['tokens to hatch', 'token alla schiusa', '부화까지 남은 토큰', '孵化までのトークン', 'tokens para eclosionar', 'jetons avant l’éclosion', 'tokens até a eclosão'],
    incubationActive: ['active incubation', 'incubazione attiva', '부화 진행 중', '孵化中', 'incubación activa', 'incubation active', 'incubação ativa'],
    incubationBlocked: ['incubation blocked', 'incubazione bloccata', '부화 차단됨', '孵化が停止中', 'incubación bloqueada', 'incubation bloquée', 'incubação bloqueada'],
    noNewPokemon: ['All eligible Pokémon have already been caught. Deactivate Poke Doll to continue.', 'Tutti i Pokémon idonei sono già stati ottenuti. Disattiva Poké Doll per continuare.', '얻을 수 있는 Pokémon을 모두 이미 획득했습니다. 계속하려면 포켓몬 인형을 끄세요.', '入手可能なポケモンはすべて捕獲済みです。続けるにはポケモンドールを無効にしてください。', 'Ya has obtenido todos los Pokémon elegibles. Desactiva el Muñeco Pokémon para continuar.', 'Tous les Pokémon éligibles ont déjà été capturés. Désactivez la Poupée Pokémon pour continuer.', 'Todos os Pokémon elegíveis já foram obtidos. Desative o Boneco Pokémon para continuar.'],
    noCompatiblePokemon: ['No Pokémon in the current catalog matches this egg. Choose another egg tier or refresh the catalog.', 'Nessun Pokémon del catalogo corrente è compatibile con questo uovo. Scegli un altro livello o aggiorna il catalogo.', '현재 카탈로그에 이 알과 호환되는 Pokémon이 없습니다. 다른 알 등급을 선택하거나 카탈로그를 새로 고치세요.', '現在のカタログにこのタマゴに合うポケモンがありません。別のタマゴ段階を選ぶか、カタログを更新してください。', 'Ningún Pokémon del catálogo actual coincide con este huevo. Elige otro nivel o actualiza el catálogo.', 'Aucun Pokémon du catalogue actuel ne correspond à cet œuf. Choisissez un autre niveau ou actualisez le catalogue.', 'Nenhum Pokémon do catálogo atual é compatível com este ovo. Escolha outro nível ou atualize o catálogo.'],
    candyInUse: ['Candy in use… update in progress', 'Caramella in uso… aggiornamento in corso', '사탕 사용 중… 업데이트하는 중', 'アメ使用中…更新しています', 'Caramelo en uso… actualización en curso', 'Bonbon utilisé… mise à jour en cours', 'Doce em uso… atualização em andamento'],
    purchaseInProgress: ['Purchase in progress… updating {item}', 'Acquisto in corso… aggiornamento di {item}', '구매 중… {item} 업데이트 중', '購入中…{item}を更新しています', 'Compra en curso… actualizando {item}', 'Achat en cours… mise à jour de {item}', 'Compra em andamento… atualizando {item}'],
    purchaseCompleted: ['Purchase completed: {item}', 'Acquisto completato: {item}', '구매 완료: {item}', '購入完了: {item}', 'Compra completada: {item}', 'Achat terminé : {item}', 'Compra concluída: {item}'],
    itemUpdating: ['Updating {item}…', 'Aggiornamento di {item} in corso…', '{item} 업데이트 중…', '{item}を更新しています…', 'Actualizando {item}…', 'Mise à jour de {item}…', 'Atualizando {item}…'],
    itemActivated: ['Item activated: {item}', 'Oggetto attivato: {item}', '아이템 활성화됨: {item}', 'アイテムを有効化しました: {item}', 'Objeto activado: {item}', 'Objet activé : {item}', 'Item ativado: {item}'],
    itemDeactivated: ['Item deactivated: {item}', 'Oggetto disattivato: {item}', '아이템 비활성화됨: {item}', 'アイテムを無効化しました: {item}', 'Objeto desactivado: {item}', 'Objet désactivé : {item}', 'Item desativado: {item}'],
    providerDisabled: ['disabled', 'disattivato', '사용 안 함', '無効', 'desactivado', 'désactivé', 'desativado'],
    providerDisabledDetail: ['Provider status checks are disabled in settings.', 'Il controllo stato provider è disattivato nelle impostazioni.', '설정에서 제공자 상태 확인이 비활성화되었습니다.', '設定でプロバイダー状態の確認が無効です。', 'La comprobación del estado del proveedor está desactivada en los ajustes.', 'La vérification de l’état du fournisseur est désactivée dans les paramètres.', 'A verificação do estado do provedor está desativada nas configurações.'],
    providerCount: ['{count} provider(s)', '{count} provider', '{count}개 제공자', '{count} 件のプロバイダー', '{count} proveedor(es)', '{count} fournisseur(s)', '{count} provedor(es)'],
    noProviderData: ['No usage available for today.', 'Nessun utilizzo disponibile per oggi.', '오늘 사용량이 없습니다.', '今日の使用量はありません。', 'No hay uso disponible hoy.', 'Aucune utilisation disponible aujourd’hui.', 'Nenhum uso disponível hoje.'],
    unknownProvider: ['Unknown', 'Sconosciuto', '알 수 없음', '不明', 'Desconocido', 'Inconnu', 'Desconhecido'],
    inputShort: ['in', 'in', '입력', '入力', 'entrada', 'entrée', 'entrada'],
    outputShort: ['out', 'out', '출력', '出力', 'salida', 'sortie', 'saída'],
    cacheShort: ['cache', 'cache', '캐시', '캐시', 'caché', 'cache', 'cache'],
    reasoningShort: ['reasoning', 'ragionamento', '추론', '推論', 'razonamiento', 'raisonnement', 'raciocínio'],
    costSessions: ['{cost} · {sessions} session(s)', '{cost} · {sessions} sessioni', '{cost} · 세션 {sessions}개', '{cost} · {sessions} セッション', '{cost} · {sessions} sesión(es)', '{cost} · {sessions} session(s)', '{cost} · {sessions} sessão(ões)'],
    tokensCount: ['{tokens} tokens', '{tokens} token', '{tokens} 토큰', '{tokens} 토큰', '{tokens} tokens', '{tokens} jetons', '{tokens} tokens'],
    hidden: ['hidden', 'nascosti', '숨김', '非表示', 'ocultos', 'masqués', 'ocultos'],
    limitsPrivacy: ['Official limits are hidden by privacy settings.', 'Le quote ufficiali sono nascoste dalla privacy.', '공식 한도는 개인정보 보호 설정으로 숨겨져 있습니다.', '公式上限はプライバシー設定で非表示です。', 'Los límites oficiales están ocultos por privacidad.', 'Les limites officielles sont masquées par la confidentialité.', 'Os limites oficiais estão ocultos pelas configurações de privacidade.'],
    unavailable: ['not available', 'non disponibili', '사용할 수 없음', '利用不可', 'no disponibles', 'indisponibles', 'indisponíveis'],
    limitsUnavailableDetail: ['Official limits are unavailable; the local counter continues to work.', 'Le quote ufficiali non sono disponibili; il contatore locale continua a funzionare.', '공식 한도를 사용할 수 없어도 로컬 카운터는 계속 작동합니다.', '公式上限を取得できなくてもローカルカウンターは動作します。', 'Los límites oficiales no están disponibles; el contador local sigue funcionando.', 'Les limites officielles sont indisponibles ; le compteur local continue de fonctionner.', 'Os limites oficiais não estão disponíveis; o contador local continua funcionando.'],
    windowCount: ['{count} windows', '{count} finestre', '창 {count}개', '{count} 件のウィンドウ', '{count} ventanas', '{count} fenêtres', '{count} janelas'],
    weekly: ['Weekly', 'Settimanale', '주간', '週間', 'Semanal', 'Hebdomadaire', 'Semanal'],
    session: ['Session', 'Sessione', '세션', 'セッション', 'Sesión', 'Session', 'Sessão'],
    remaining: ['remaining', 'rimanenti', '남음', '残り', 'restantes', 'restants', 'restantes'],
    used: ['used', 'usati', '사용됨', '使用済み', 'usados', 'utilisés', 'usados'],
    item: ['item', 'oggetto', '아이템', 'アイテム', 'objeto', 'objet', 'item'],
    rareCandy: ['Rare Candy', 'Rare Candy', '이상한사탕', 'ふしぎなアメ', 'Caramelo Raro', 'Super Bonbon', 'Doce Raro'],
    rareCandyDetail: ['100M progress', '100M di progresso', '1억 진행도', '1億の進行度', '100M de progreso', '100 M de progression', '100M de progresso'],
    mint: ['Mint', 'Mint', '민트', 'ミント', 'Menta', 'Menthe', 'Menta'],
    mintDetail: ['Change nature', 'Cambia natura', '성격 변경', '性格を変更', 'Cambia la naturaleza', 'Change la nature', 'Muda a natureza'],
    shinyCharm: ['Shiny Charm', 'Shiny Charm', '빛나는부적', 'ひかるおまもり', 'Amuleto Iris', 'Charme Chroma', 'Amuleto Brilhante'],
    shinyCharmDetail: ['Shiny bonus · toggleable', 'Bonus shiny · attivabile/disattivabile', '색이 다른 확률 보너스 · 전환 가능', '色違いボーナス · 切り替え可能', 'Bonus Shiny · activable', 'Bonus chromatique · activable', 'Bônus Shiny · alternável'],
    pokeDoll: ['Poke Doll', 'Poké Doll', '포켓몬 인형', 'ポケモンドール', 'Muñeco Pokémon', 'Poupée Pokémon', 'Boneco Pokémon'],
    pokeDollDetail: ['Avoids hatching previously caught Pokémon · toggleable', 'Evita di schiudere Pokémon già ottenuti · attivabile/disattivabile', '이미 얻은 Pokémon의 부화를 방지 · 전환 가능', '以前入手したポケモンの孵化を防止 · 切り替え可能', 'Evita eclosionar Pokémon ya obtenidos · activable', 'Évite l’éclosion de Pokémon déjà obtenus · activable', 'Evita eclosionar Pokémon já obtidos · alternável'],
    pokeDollDescription: ['Prevents hatching Pokémon already caught.', 'Impedisce di schiudere Pokémon già ottenuti.', '이미 얻은 Pokémon의 부화를 방지합니다.', 'すでに入手したポケモンの孵化を防ぎます。', 'Impide eclosionar Pokémon ya obtenidos.', 'Empêche l’éclosion de Pokémon déjà obtenus.', 'Impede eclosionar Pokémon já obtidos.'],
    active: ['Active', 'Attivo', '활성', '有効', 'Activo', 'Actif', 'Ativo'],
    activate: ['Activate', 'Attiva', '활성화', '有効化', 'Activar', 'Activer', 'Ativar'],
    deactivate: ['Deactivate', 'Disattiva', '비활성화', '無効化', 'Desactivar', 'Désactiver', 'Desativar'],
    inactive: ['Inactive', 'Disattivo', '비활성', '無効', 'Inactivo', 'Inactif', 'Inativo'],
    use: ['Use', 'Usa', '사용', '使う', 'Usar', 'Utiliser', 'Usar'],
    ownedCount: ['{count} owned', '{count} posseduti', '{count}개 보유', '{count} 個所持', '{count} en posesión', '{count} possédé(s)', '{count} em posse'],
    itemCount: ['{count} items', '{count} oggetti', '아이템 {count}개', '{count} 個のアイテム', '{count} objetos', '{count} objets', '{count} itens'],
    emptyBag: ['The bag is empty.', 'La borsa è vuota.', '가방이 비어 있습니다.', 'バッグは空です。', 'La bolsa está vacía.', 'Le sac est vide.', 'A bolsa está vazia.'],
    notFound: ['Not found', 'Non trovato', '찾을 수 없음', '未所持', 'No encontrado', 'Introuvable', 'Não encontrado'],
    bagReadOnly: ['Read-only bag: items cannot be consumed in this instance.', 'Borsa in sola lettura: gli oggetti non possono essere consumati da questa istanza.', '읽기 전용 가방: 이 인스턴스에서는 아이템을 사용할 수 없습니다.', '読み取り専用バッグ：このインスタンスではアイテムを使用できません。', 'Bolsa de solo lectura: no se pueden usar objetos en esta instancia.', 'Sac en lecture seule : les objets ne peuvent pas être consommés dans cette instance.', 'Bolsa somente leitura: os itens não podem ser consumidos nesta instância.'],
    canUseItems: ['Use Rare Candy and Mint on the active companion, or toggle owned items.', 'Usa Rare Candy e Mint sul companion attivo, oppure attiva/disattiva gli oggetti posseduti.', '활성 컴패니언에게 이상한사탕과 민트를 사용하거나 보유 아이템을 켜고 끌 수 있습니다.', '現在のコンパニオンにふしぎなアメとミントを使うか、所持アイテムを切り替えられます。', 'Usa Caramelo Raro y Menta en el compañero activo, o activa y desactiva tus objetos.', 'Utilisez un Super Bonbon et une Menthe sur le compagnon actif, ou activez et désactivez vos objets.', 'Use Doce Raro e Menta no companheiro ativo, ou ative e desative os itens que possui.'],
    waitForHatch: ['Wait for the egg to hatch before using items.', 'Attendi la schiusa per usare gli oggetti sul companion.', '알이 부화할 때까지 아이템을 사용할 수 없습니다.', 'タマゴが孵化するまでアイテムは使えません。', 'Espera a que eclosione el huevo antes de usar objetos.', 'Attendez l’éclosion de l’œuf avant d’utiliser des objets.', 'Aguarde a eclosão do ovo antes de usar itens.'],
    rareCandyDescription: ['Adds 100M progress.', 'Aggiunge 100M di progresso.', '1억 진행도를 추가합니다.', '1億の進行度を追加します。', 'Añade 100M de progreso.', 'Ajoute 100 M de progression.', 'Adiciona 100M de progresso.'],
    mintDescription: ['Changes the companion’s nature.', 'Cambia la natura del companion.', '컴패니언의 성격을 바꿉니다.', 'コンパニオンの性格を変更します。', 'Cambia la naturaleza del compañero.', 'Change la nature du compagnon.', 'Muda a natureza do companheiro.'],
    shinyCharmDescription: ['Improves shiny odds.', 'Migliora le probabilità shiny.', '색이 다른 확률을 높입니다.', '色違いの確率を上げます。', 'Mejora las probabilidades de Shiny.', 'Améliore les chances de chromatique.', 'Melhora as chances de Shiny.'],
    commonEgg: ['Common egg', 'Uovo comune', '일반 알', 'ふつうのタマゴ', 'Huevo común', 'Œuf commun', 'Ovo comum'],
    commonEggDescription: ['Replaces the current incubation.', 'Sostituisce l’incubazione corrente.', '현재 부화를 교체합니다.', '現在の孵化を置き換えます。', 'Sustituye la incubación actual.', 'Remplace l’incubation actuelle.', 'Substitui a incubação atual.'],
    uncommonEgg: ['Uncommon egg', 'Uovo non comune', '희귀한 알', '珍しいタマゴ', 'Huevo poco común', 'Œuf peu commun', 'Ovo incomum'],
    uncommonEggDescription: ['Guarantees Uncommon or higher.', 'Garantisce Non comune o superiore.', '희귀 이상을 보장합니다.', '珍しい以上を保証します。', 'Garantiza Poco común o superior.', 'Garantit Peu commun ou supérieur.', 'Garante Incomum ou superior.'],
    rareEgg: ['Rare egg', 'Uovo raro', '희귀 알', 'レアなタマゴ', 'Huevo raro', 'Œuf rare', 'Ovo raro'],
    rareEggDescription: ['Guarantees Rare or higher.', 'Garantisce Raro o superiore.', '희귀 이상을 보장합니다.', 'レア以上を保証します。', 'Garantiza Raro o superior.', 'Garantit Rare ou supérieur.', 'Garante Raro ou superior.'],
    buy: ['Buy', 'Acquista', '구매', '購入', 'Comprar', 'Acheter', 'Comprar'],
    price: ['{price} tokens', '{price} token', '{price} 토큰', '{price} トークン', '{price} tokens', '{price} jetons', '{price} tokens'],
    ownedPrice: ['{count} owned · {price} tokens', '{count} posseduti · {price} token', '{count}개 보유 · {price} 토큰', '{count} 個所持 · {price} トークン', '{count} en posesión · {price} tokens', '{count} possédé(s) · {price} jetons', '{count} em posse · {price} tokens'],
    catchCount: ['{count} catches', '{count} catture', '포획 {count}회', '{count} 件の捕獲', '{count} capturas', '{count} captures', '{count} capturas'],
    speciesCount: ['{count} species', '{count} specie', '종 {count}개', '{count} 種', '{count} especies', '{count} espèces', '{count} espécies'],
    emptyCatchLog: ['The catch log is empty.', 'Il registro catture è ancora vuoto.', '포획 기록이 비어 있습니다.', '捕獲記録はまだ空です。', 'El registro de capturas está vacío.', 'Le journal des captures est encore vide.', 'O registro de capturas está vazio.'],
    emptyPokedex: ['The Pokédex is empty.', 'Il Pokédex è ancora vuoto.', 'Pokédex가 비어 있습니다.', '図鑑はまだ空です。', 'La Pokédex está vacía.', 'Le Pokédex est encore vide.', 'A Pokédex está vazia.'],
    growing: ['Growing', 'In crescita', '성장 중', '育成中', 'En crecimiento', 'En croissance', 'Em crescimento'],
    caught: ['Caught', 'Catturato', '포획됨', '捕獲済み', 'Capturado', 'Capturé', 'Capturado'],
    natureUnknown: ['Nature —', 'Natura —', '성격 —', '性格 —', 'Naturaleza —', 'Nature —', 'Natureza —'],
    dexNumber: ['#{id}', '#{id}', '#{id}', 'No. {id}', '#{id}', '#{id}', '#{id}'],
    numberUnknown: ['#?', '#?', '#?', 'No. ?', '#?', '#?', '#?'],

    rarityCommon: ['common', 'comune', '일반', 'ふつう', 'común', 'commun', 'comum'],
    rarityUncommon: ['uncommon', 'non comune', '희귀', '珍しい', 'poco común', 'peu commun', 'incomum'],
    rarityRare: ['rare', 'raro', '레어', 'レア', 'raro', 'rare', 'raro'],
    rarityLegendary: ['legendary', 'leggendario', '전설', '伝説', 'legendario', 'légendaire', 'lendário'],
    settingsGeneral: ['GENERAL', 'GENERALE', '일반', '一般', 'GENERAL', 'GÉNÉRAL', 'GERAL'],
    settingLanguage: ['Language', 'Lingua', '언어', '言語', 'Idioma', 'Langue', 'Idioma'],
    settingLanguageHint: ['Shared language for this web companion.', 'Lingua condivisa per questo companion web.', '이 웹 컴패니언의 공용 언어입니다.', 'このウェブコンパニオンの共通言語です。', 'Idioma compartido de este compañero web.', 'Langue commune de ce compagnon web.', 'Idioma compartilhado deste companheiro web.'],
    settingRefresh: ['Refresh interval', 'Intervallo aggiornamento', '새로 고침 간격', '更新間隔', 'Intervalo de actualización', 'Intervalle d’actualisation', 'Intervalo de atualização'],
    settingRefreshHint: ['From 1 to 15 minutes, or manual.', 'Da 1 a 15 minuti oppure manuale.', '1~15분 또는 수동입니다.', '1～15分または手動。', 'De 1 a 15 minutos o manual.', 'De 1 à 15 minutes ou manuel.', 'De 1 a 15 minutos ou manual.'],
    manual: ['Manual', 'Manuale', '수동', '手動', 'Manual', 'Manuel', 'Manual'],
    minute: ['minute', 'minuto', '분', '分', 'minuto', 'minute', 'minuto'],
    minutes: ['minutes', 'minuti', '분', '分', 'minutos', 'minutes', 'minutos'],
    settingLimitDisplay: ['Limit display', 'Visualizzazione limiti', '한도 표시', '上限表示', 'Mostrar límites', 'Affichage des limites', 'Exibição de limites'],
    settingLimitDisplayHint: ['Show used or remaining quota.', 'Mostra quota usata oppure rimanente.', '사용량 또는 잔여 한도를 표시합니다.', '使用量または残量を表示します。', 'Muestra la cuota usada o restante.', 'Affiche le quota utilisé ou restant.', 'Mostra a cota usada ou restante.'],
    usedOption: ['Used', 'Usati', '사용됨', '使用済み', 'Usados', 'Utilisés', 'Usados'],
    remainingOption: ['Remaining', 'Rimanenti', '남음', '残り', 'Restantes', 'Restants', 'Restantes'],
    settingAutostart: ['Automatic startup', 'Avvio automatico', '자동 시작', '自動起動', 'Inicio automático', 'Démarrage automatique', 'Inicialização automática'],
    settingAutostartHint: ['Saved preference; Docker startup is controlled by the system.', 'Preferenza salvata; l’avvio Docker dipende dal sistema.', '저장되는 기본 설정이며 Docker 시작은 시스템이 제어합니다.', '保存される設定です。Docker の起動はシステムが制御します。', 'Preferencia guardada; el inicio de Docker depende del sistema.', 'Préférence enregistrée ; le démarrage Docker dépend du système.', 'Preferência salva; a inicialização do Docker depende do sistema.'],

    summaryGroup: ['SUMMARY DISPLAY', 'RIEPILOGO', '요약 표시', 'サマリー表示', 'RESUMEN', 'RÉSUMÉ', 'RESUMO'],
    settingTodayTokens: ['Today’s tokens', 'Token di oggi', '오늘의 토큰', '今日のトークン', 'Tokens de hoy', 'Jetons du jour', 'Tokens de hoje'],
    settingTodayTokensHint: ['Show today’s tokens in the summary.', 'Mostra i token di oggi nel riepilogo.', '요약에 오늘의 토큰을 표시합니다.', 'サマリーに今日のトークンを表示します。', 'Muestra los tokens de hoy en el resumen.', 'Affiche les jetons du jour dans le résumé.', 'Mostra os tokens de hoje no resumo.'],
    settingTodayCost: ['Today’s cost', 'Costo di oggi', '오늘의 비용', '今日のコスト', 'Coste de hoy', 'Coût du jour', 'Custo de hoje'],
    settingTodayCostHint: ['Show today’s cost in the summary.', 'Aggiunge il costo di oggi nel riepilogo.', '요약에 오늘의 비용을 표시합니다.', 'サマリーに今日のコストを表示します。', 'Muestra el coste de hoy en el resumen.', 'Affiche le coût du jour dans le résumé.', 'Mostra o custo de hoje no resumo.'],
    settingLimitPercent: ['Limit percentages', 'Percentuale limiti', '한도 백분율', '上限の割合', 'Porcentajes de límites', 'Pourcentages des limites', 'Percentuais de limite'],
    settingLimitPercentHint: ['Show percentages for official quotas.', 'Visualizza le percentuali delle quote ufficiali.', '공식 한도의 백분율을 표시합니다.', '公式上限の割合を表示します。', 'Muestra los porcentajes de las cuotas oficiales.', 'Affiche les pourcentages des quotas officiels.', 'Mostra os percentuais das cotas oficiais.'],
    settingProvider: ['Provider status', 'Controllo stato provider', '제공자 상태', 'プロバイダー状態', 'Estado del proveedor', 'État du fournisseur', 'Status do provedor'],
    settingProviderHint: ['Show input/output/cache/reasoning details.', 'Mostra il dettaglio input/output/cache/ragionamento.', '입력/출력/캐시/추론 세부 정보를 표시합니다.', '入力・出力・キャッシュ・推論の詳細を表示します。', 'Muestra detalles de entrada/salida/caché/razonamiento.', 'Affiche les détails entrée/sortie/cache/raisonnement.', 'Mostra detalhes de entrada/saída/cache/raciocínio.'],
    privacyGroup: ['PRIVACY', 'PRIVACY', '개인정보 보호', 'プライバシー', 'PRIVACIDAD', 'CONFIDENTIALITÉ', 'PRIVACIDADE'],
    settingHideLimits: ['Hide official limits', 'Nascondi quote ufficiali', '공식 한도 숨기기', '公式上限を隠す', 'Ocultar límites oficiales', 'Masquer les limites officielles', 'Ocultar limites oficiais'],
    settingHideLimitsHint: ['Hide quota windows without changing the local counter.', 'Nasconde le finestre quota senza toccare il contatore locale.', '로컬 카운터에 영향을 주지 않고 한도 창을 숨깁니다.', 'ローカルカウンターを変更せず上限ウィンドウを隠します。', 'Oculta las ventanas de cuota sin cambiar el contador local.', 'Masque les fenêtres de quota sans modifier le compteur local.', 'Oculta as janelas de cota sem alterar o contador local.'],
    scanGroup: ['ADVANCED SCAN', 'SCANSIONE AVANZATA', '고급 스캔', '詳細スキャン', 'ESCANEO AVANZADO', 'ANALYSE AVANCÉE', 'VARREDURA AVANÇADA'],
    additionalFolders: ['Additional usage folders', 'Cartelle utilizzo aggiuntive', '추가 사용량 폴더', '追加使用フォルダー', 'Carpetas de uso adicionales', 'Dossiers d’utilisation supplémentaires', 'Pastas de uso adicionais'],
    additionalFoldersHint: ['{count} configured · read-only JSON/JSONL scan', '{count} configurate · scansione JSON/JSONL in sola lettura', '{count}개 구성됨 · 읽기 전용 JSON/JSONL 스캔', '{count} 件設定済み · 読み取り専用 JSON/JSONL スキャン', '{count} configuradas · escaneo JSON/JSONL de solo lectura', '{count} configuré(s) · analyse JSON/JSONL en lecture seule', '{count} configuradas · varredura JSON/JSONL somente leitura'],
    absolutePath: ['Absolute path…', 'Percorso assoluto…', '절대 경로…', '絶対パス…', 'Ruta absoluta…', 'Chemin absolu…', 'Caminho absoluto…'],
    add: ['Add', 'Aggiungi', '추가', '追加', 'Añadir', 'Ajouter', 'Adicionar'],
    clear: ['Clear', 'Pulisci', '지우기', 'クリア', 'Limpiar', 'Effacer', 'Limpar'],
    backupGroup: ['BACKUP & TRANSFER', 'BACKUP E TRASFERIMENTO', '백업 및 전송', 'バックアップと転送', 'COPIA Y TRANSFERENCIA', 'SAUVEGARDE ET TRANSFERT', 'BACKUP E TRANSFERÊNCIA'],
    export: ['Export…', 'Esporta…', '내보내기…', 'エクスポート…', 'Exportar…', 'Exporter…', 'Exportar…'],
    import: ['Import…', 'Importa…', '가져오기…', 'インポート…', 'Importar…', 'Importer…', 'Importar…'],
    save: ['Companion save', 'Salvataggio companion', '컴패니언 저장 데이터', 'コンパニオンセーブ', 'Guardado del compañero', 'Sauvegarde du compagnon', 'Salvamento do companheiro'],
    saveHint: ['Pokédex, lifetime tokens, Bag and active Pokémon; local paths are not exported.', 'Pokédex, token lifetime, Borsa e Pokémon attuale; i percorsi locali non vengono esportati.', 'Pokédex, 누적 토큰, 가방과 현재 Pokémon을 저장하며 로컬 경로는 내보내지 않습니다.', '図鑑、累計トークン、バッグ、現在のポケモンを保存します。ローカルパスは出力しません。', 'Pokédex, tokens de por vida, Bolsa y Pokémon activo; las rutas locales no se exportan.', 'Pokédex, jetons cumulés, sac et Pokémon actif ; les chemins locaux ne sont pas exportés.', 'Pokédex, tokens vitalícios, Bolsa e Pokémon ativo; caminhos locais não são exportados.'],
    updatesGroup: ['UPDATES', 'AGGIORNAMENTI', '업데이트', '更新', 'ACTUALIZACIONES', 'MISES À JOUR', 'ATUALIZAÇÕES'],
    settingUpdate: ['Notify about new versions', 'Segnala nuove versioni', '새 버전 알림', '新バージョンを知らせる', 'Avisar de nuevas versiones', 'Signaler les nouvelles versions', 'Avisar sobre novas versões'],
    settingUpdateHint: ['Enable the read-only release check.', 'Abilita il controllo release read-only.', '읽기 전용 릴리스 확인을 활성화합니다.', '読み取り専用のリリース確認を有効にします。', 'Activa la comprobación de versiones en solo lectura.', 'Active la vérification des versions en lecture seule.', 'Ativa a verificação de release somente leitura.'],
    updateNew: ['New version {version}', 'Nuova versione {version}', '새 버전 {version}', '新バージョン {version}', 'Nueva versión {version}', 'Nouvelle version {version}', 'Nova versão {version}'],
    updateCurrent: ['You are up to date', 'È tutto aggiornato', '최신 버전입니다', '最新バージョンです', 'Está actualizado', 'Tout est à jour', 'Está atualizado'],
    updateUnavailable: ['Updates unavailable', 'Aggiornamenti non disponibili', '업데이트를 사용할 수 없음', '更新を利用できません', 'Actualizaciones no disponibles', 'Mises à jour indisponibles', 'Atualizações indisponíveis'],
    updateNotChecked: ['Not checked yet', 'Non ancora verificato', '아직 확인하지 않음', '未確認', 'Aún no comprobado', 'Pas encore vérifié', 'Ainda não verificado'],
    checkNow: ['Check now', 'Controlla ora', '지금 확인', '今すぐ確認', 'Comprobar ahora', 'Vérifier maintenant', 'Verificar agora'],
    openRelease: ['Open release', 'Apri release', '릴리스 열기', 'リリースを開く', 'Abrir versión', 'Ouvrir la release', 'Abrir release'],
    supportGroup: ['INFORMATION & SUPPORT', 'INFORMAZIONI E SUPPORTO', '정보 및 지원', '情報とサポート', 'INFORMACIÓN Y SOPORTE', 'INFORMATIONS ET ASSISTANCE', 'INFORMAÇÕES E SUPORTE'],
    projectPage: ['Project page', 'Pagina del progetto', '프로젝트 페이지', 'プロジェクトページ', 'Página del proyecto', 'Page du projet', 'Página do projeto'],
    projectPageHint: ['Source code and releases.', 'Sorgenti e release.', '소스 코드와 릴리스입니다.', 'ソースコードとリリース。', 'Código fuente y versiones.', 'Sources et releases.', 'Código-fonte e releases.'],
    reportIssue: ['Report a problem', 'Segnala un problema', '문제 신고', '問題を報告', 'Informar de un problema', 'Signaler un problème', 'Relatar um problema'],
    reportIssueHint: ['Open the project issue tracker.', 'Apre il tracker del progetto.', '프로젝트 이슈 트래커를 엽니다.', 'プロジェクトの課題トラッカーを開きます。', 'Abre el gestor de incidencias del proyecto.', 'Ouvre le suivi des problèmes du projet.', 'Abre o rastreador de problemas do projeto.'],
    open: ['Open', 'Apri', '열기', '開く', 'Abrir', 'Ouvrir', 'Abrir'],
    readOnlySettings: ['This instance is read-only: settings and purchases are disabled.', 'Questa istanza è read-only: le impostazioni e gli acquisti restano disabilitati.', '이 인스턴스는 읽기 전용이므로 설정과 구매가 비활성화됩니다.', 'このインスタンスは読み取り専用です。設定と購入は無効です。', 'Esta instancia es de solo lectura: los ajustes y las compras están desactivados.', 'Cette instance est en lecture seule : paramètres et achats désactivés.', 'Esta instância é somente leitura: configurações e compras desativadas.'],
    localActions: ['Web actions use the local service; Hermes and providers are read without writing.', 'Le azioni web passano dal servizio locale; Hermes e i provider vengono letti senza scrittura.', '웹 작업은 로컬 서비스를 사용하며 Hermes와 제공자는 쓰기 없이 읽습니다.', 'ウェブ操作はローカルサービスを使用し、Hermes とプロバイダーは書き込みなしで読み取ります。', 'Las acciones web usan el servicio local; Hermes y los proveedores se leen sin escritura.', 'Les actions web utilisent le service local ; Hermes et les fournisseurs sont lus sans écriture.', 'As ações web usam o serviço local; Hermes e os provedores são lidos sem escrita.'],
    toggleSetting: ['Toggle {name}', 'Attiva o disattiva {name}', '{name} 전환', '{name}を切り替え', 'Activar o desactivar {name}', 'Activer ou désactiver {name}', 'Alternar {name}'],
  };

  const messages = Object.freeze(Object.fromEntries(
    supportedLanguages.map((language, index) => [
      language,
      Object.freeze(Object.fromEntries(
        Object.entries(entries).map(([key, values]) => [key, values[index]]),
      )),
    ]),
  ));

  function normalizeLanguage(value) {
    return supportedLanguages.includes(value) ? value : 'en';
  }

  function interpolate(value, variables = {}) {
    return String(value).replace(/\{([A-Za-z0-9_]+)\}/g, (match, key) => (
      Object.prototype.hasOwnProperty.call(variables, key) ? String(variables[key]) : match
    ));
  }

  function translate(key, language = currentLanguage, variables = {}) {
    const selected = normalizeLanguage(language);
    const value = messages[selected]?.[key] ?? messages.en[key] ?? key;
    return interpolate(value, variables);
  }

  function applyStatic(root = typeof document !== 'undefined' ? document : null) {
    if (!root) return;
    if (root.documentElement) root.documentElement.lang = currentLanguage;
    root.querySelectorAll?.('[data-i18n]').forEach((node) => {
      node.textContent = translate(node.dataset.i18n);
    });
    root.querySelectorAll?.('[data-i18n-aria-label]').forEach((node) => {
      node.setAttribute('aria-label', translate(node.dataset.i18nAriaLabel));
    });
    root.querySelectorAll?.('[data-i18n-placeholder]').forEach((node) => {
      node.setAttribute('placeholder', translate(node.dataset.i18nPlaceholder));
    });
  }

  function setLanguage(value, root = typeof document !== 'undefined' ? document : null) {
    currentLanguage = normalizeLanguage(value);
    applyStatic(root);
    return currentLanguage;
  }

  const api = Object.freeze({
    supportedLanguages,
    messages,
    locale: () => localeMap[currentLanguage] || localeMap.en,
    language: () => currentLanguage,
    normalizeLanguage,
    translate,
    setLanguage,
    applyStatic,
  });

  if (typeof window !== 'undefined') window.PokeTokenDockerI18n = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
