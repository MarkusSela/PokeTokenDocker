(() => {
  'use strict';

  const model = {
    snapshot: null,
    capabilities: null,
    config: null,
    update: null,
    settingsOpen: false,
    collectionMode: 'dex',
    actionPending: false,
    actionType: null,
    actionValue: null,
    actionItemKey: null,
    actionFeedback: null,
    actionFeedbackItem: null,
    actionFeedbackTimer: null,
    refreshMinutes: null,
    refreshTimer: null,
  };
  const settingTimers = new Map();
  const readActions = new Set(['refresh', 'check-update', 'export-save']);
  const visualActions = new Set(['candy', 'buy', 'egg', 'mint', 'toggle-item']);
  const catalog = window.PokeTokenDockerI18n;
  const t = (key, variables) => catalog.translate(key, catalog.language(), variables);
  const setLanguage = (value) => catalog.setLanguage(value);

  const $ = (selector) => document.querySelector(selector);
  const number = (value) => {
    const result = Number(value);
    return Number.isFinite(result) && result >= 0 ? result : 0;
  };
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, number(value)));
  const compact = (value) => {
    const result = number(value);
    if (result >= 1e9) return `${(result / 1e9).toFixed(1).replace('.0', '')}B`;
    if (result >= 1e6) return `${(result / 1e6).toFixed(1).replace('.0', '')}M`;
    if (result >= 1e3) return `${(result / 1e3).toFixed(1).replace('.0', '')}K`;
    return Math.floor(result).toLocaleString(catalog.locale());
  };
  const money = (value) => new Intl.NumberFormat(catalog.locale(), {
    style: 'currency',
    currency: 'USD',
  }).format(number(value));
  const text = (target, value) => {
    const node = typeof target === 'string' ? $(target) : target;
    if (node) node.textContent = String(value ?? '');
  };
  const element = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value != null) node.textContent = String(value);
    return node;
  };
  const clear = (node) => {
    if (node) node.replaceChildren();
    return node;
  };
  const safeImage = (value) => {
    if (typeof value !== 'string') return null;
    if (/^assets\/[A-Za-z0-9._/-]+$/.test(value) && !value.includes('..')) return `/${value}`;
    if (/^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/[A-Za-z0-9._/?=-]+$/.test(value)) return value;
    return null;
  };
  const appendImage = (parent, url, alt, fallback = '🥚', className = '') => {
    const safe = safeImage(url);
    if (safe) {
      const image = element('img', className);
      image.src = safe;
      image.alt = alt;
      image.loading = 'lazy';
      image.addEventListener('error', () => {
        image.replaceWith(element('span', 'sprite-fallback', fallback));
      }, { once: true });
      parent.append(image);
    } else parent.append(element('span', 'sprite-fallback', fallback));
  };
  const settings = () => model.snapshot?.settings || {};
  const canMutate = () => Boolean(model.capabilities?.actions && !model.snapshot?.readOnly);
  const officialLimits = () => Boolean(model.snapshot?.limits?.officialAvailable && model.snapshot?.limits?.windows?.length);
  const rarityLabel = (value) => {
    const key = String(value || 'common').toLowerCase();
    return t(`rarity${key[0].toUpperCase()}${key.slice(1)}`);
  };
  const settingLabels = {
    language: 'settingLanguage',
    refreshMinutes: 'settingRefresh',
    limitDisplay: 'settingLimitDisplay',
    launchAtLogin: 'settingAutostart',
    menuTodayTokens: 'settingTodayTokens',
    menuTodayCost: 'settingTodayCost',
    menuLimitPercent: 'settingLimitPercent',
    providerStatus: 'settingProvider',
    keychainOptOut: 'settingHideLimits',
    updateNotifications: 'settingUpdate',
  };
  const settingLabel = (key) => t(settingLabels[key] || key);

  function notify(message, error = false) {
    const notice = $('#notice');
    if (!notice) return;
    text(notice, message || '');
    notice.style.color = error ? 'var(--danger)' : 'var(--good)';
  }

  async function request(url, options = {}) {
    const response = await fetch(url, { cache: 'no-store', ...options });
    let payload = null;
    try { payload = await response.json(); } catch {}
    if (!response.ok) throw new Error(payload?.error?.message || `HTTP ${response.status}`);
    return payload;
  }

  function applyActionResult(result) {
    if (result?.snapshot) model.snapshot = result.snapshot;
    if (result?.update) model.update = result.update;
  }

  function actionPendingKey(type) {
    if (type === 'candy') return 'candyInUse';
    if (type === 'buy' || type === 'egg') return 'purchaseInProgress';
    return 'itemUpdating';
  }

  function actionItemKeyFor(type, value, itemKey, snapshot = model.snapshot) {
    if (itemKey) return itemKey;
    if (type === 'toggle-item' || type === 'buy') return typeof value === 'string' ? value : null;
    if (type === 'egg' && snapshot) {
      return shopDefinitions(snapshot).find((item) => item.kind.endsWith('Egg') && item.tier === value)?.kind || null;
    }
    return null;
  }

  function actionItemTitle(type, value, itemKey, snapshot = model.snapshot) {
    if (!snapshot) return t('item');
    const key = actionItemKeyFor(type, value, itemKey, snapshot);
    const inventoryItem = key ? inventoryDefinitions(snapshot).find((item) => item.key === key) : null;
    if (inventoryItem) return inventoryItem.title;
    const shopItem = key ? shopDefinitions(snapshot).find((item) => item.kind === key) : null;
    return shopItem?.title || t('item');
  }

  function actionCompletedKey(type, value, result) {
    if (type === 'toggle-item') {
      return result?.snapshot?.state?.itemActivation?.[value] === false
        ? 'itemDeactivated'
        : 'itemActivated';
    }
    if (type === 'buy' || type === 'egg') return 'purchaseCompleted';
    return 'updated';
  }

  function actionFeedbackForItem(itemKey, fallbackTitle) {
    if (!(model.actionPending || model.actionFeedback) || model.actionItemKey !== itemKey) return '';
    const key = model.actionPending ? actionPendingKey(model.actionType) : model.actionFeedback;
    if (!key) return '';
    const title = model.actionPending
      ? actionItemTitle(model.actionType, model.actionValue, model.actionItemKey)
      : model.actionFeedbackItem || fallbackTitle;
    return t(key, { item: title });
  }

  function showActionFeedback(key, itemTitle) {
    clearTimeout(model.actionFeedbackTimer);
    model.actionFeedback = key;
    model.actionFeedbackItem = itemTitle;
    model.actionFeedbackTimer = setTimeout(() => {
      model.actionFeedback = null;
      model.actionFeedbackItem = null;
      model.actionItemKey = null;
      model.actionFeedbackTimer = null;
      render();
    }, 1_200);
  }

  async function sendAction(type, value, { silent = false, renderAfter = true, itemKey = null } = {}) {
    const visualAction = visualActions.has(type);
    if (!readActions.has(type) && !canMutate()) {
      if (visualAction) {
        clearTimeout(model.actionFeedbackTimer);
        model.actionPending = false;
        model.actionType = null;
        model.actionValue = value;
        model.actionItemKey = actionItemKeyFor(type, value, itemKey);
        showActionFeedback('actionFailed', actionItemTitle(type, value, model.actionItemKey));
        render();
      } else notify(t('actionFailed'), true);
      return null;
    }
    if (visualAction && model.actionPending) return null;
    if (visualAction) {
      clearTimeout(model.actionFeedbackTimer);
      model.actionFeedback = null;
      model.actionFeedbackItem = null;
      model.actionPending = true;
      model.actionType = type;
      model.actionValue = value;
      model.actionItemKey = actionItemKeyFor(type, value, itemKey);
      render();
    }
    try {
      const result = await request('/api/action', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type, value }),
      });
      applyActionResult(result);
      const failed = result.ok === false || (type === 'refresh' && result.snapshot?.error);
      if (visualAction) {
        const itemTitle = actionItemTitle(type, value, model.actionItemKey);
        model.actionPending = false;
        model.actionType = null;
        model.actionValue = null;
        if (!failed) showActionFeedback(actionCompletedKey(type, value, result), itemTitle);
        else showActionFeedback('actionFailed', itemTitle);
        if (model.snapshot) render();
      } else if (renderAfter) render();
      if (failed) {
        if (!visualAction) notify(t('actionFailed'), true);
      } else if (!silent && !visualAction) {
        notify(t('updated'));
      }
      return result;
    } catch {
      if (visualAction) {
        const itemTitle = actionItemTitle(type, value, model.actionItemKey);
        model.actionPending = false;
        model.actionType = null;
        model.actionValue = null;
        model.actionFeedback = null;
        model.actionFeedbackItem = null;
        showActionFeedback('actionFailed', itemTitle);
        if (model.snapshot) render();
      } else notify(t('actionFailed'), true);
      return null;
    }
  }

  function companionView(snapshot) {
    const active = snapshot.active;
    if (active) {
      const threshold = Math.max(1, number(active.threshold));
      const progress = clamp(number(active.usedAtStage) / threshold);
      return {
        name: active.name || t('activePokemon'),
        rarity: rarityLabel(active.rarity),
        sprite: snapshot.sprite,
        fallback: active.shinyVisible ? '✨' : '🔹',
        progress,
        detail: `${active.shinyVisible ? `✨ ${t('shiny')} · ` : ''}${t('nature')} ${active.nature || '—'} · ${t('stage')} ${Math.floor(number(active.stageIndex)) + 1}/${Math.max(1, Math.floor(number(active.totalForms)))}`,
        label: `${Math.round(progress * 100)}% · ${t('activeCompanion')}`,
      };
    }
    const egg = snapshot.egg || {};
    const progress = clamp(egg.progress);
    const blockedMessage = {
      'no-new-pokemon': 'noNewPokemon',
      'no-compatible-pokemon': 'noCompatiblePokemon',
    }[egg.blockedReason];
    const blocked = Boolean(blockedMessage);
    return {
      name: t('incubatingEgg'),
      rarity: rarityLabel(egg.tier),
      sprite: egg.sprite,
      fallback: '🥚',
      progress,
      detail: blocked ? t(blockedMessage) : `${compact(egg.remaining)} ${t('tokensToHatch')}`,
      label: `${Math.round(progress * 100)}% · ${t(blocked ? 'incubationBlocked' : 'incubationActive')}`,
    };
  }

  function renderStatus() {
    const status = $('#status');
    if (!status) return;
    const snapshot = model.snapshot;
    const session = model.capabilities?.session || snapshot?.capabilities?.session || 'unknown';
    status.className = `status ${snapshot && !snapshot.error ? 'ready' : 'error'}`;
    const mode = snapshot?.mode === 'public-readonly' ? t('publicMode') : t('localMode');
    text(status, snapshot ? `${mode} · ${session}` : t('unknownStatus'));
  }

  function renderProviders(snapshot) {
    const providerList = clear($('#providers'));
    const providers = Array.isArray(snapshot.usage?.todayProviders) ? snapshot.usage.todayProviders : [];
    if (settings().providerStatus === false) {
      text('#provider-summary', t('providerDisabled'));
      providerList?.append(element('div', 'empty', t('providerDisabledDetail')));
      return;
    }
    text('#provider-summary', providers.length ? t('providerCount', { count: providers.length }) : t('unavailable'));
    if (!providers.length) {
      providerList?.append(element('div', 'empty', t('noProviderData')));
      return;
    }
    for (const provider of providers) {
      const row = element('div', 'provider-row');
      const copy = element('div', 'provider-copy');
      copy.append(element('strong', '', provider.name || t('unknownProvider')));
      const metrics = element('div', 'provider-metrics');
      for (const [label, key] of [
        [t('inputShort'), 'input'],
        [t('outputShort'), 'output'],
        [t('cacheShort'), 'cacheRead'],
        [t('reasoningShort'), 'reasoning'],
      ]) {
        const metric = element('span');
        metric.append(element('b', '', `${label}: `), document.createTextNode(compact(provider[key])));
        metrics.append(metric);
      }
      copy.append(metrics);
      copy.append(element('span', '', t('costSessions', {
        cost: money(provider.cost),
        sessions: Math.floor(number(provider.sessions)),
      })));
      row.append(copy, element('strong', '', t('tokensCount', { tokens: compact(provider.tokens) })));
      providerList?.append(row);
    }
  }

  function renderLimits(snapshot) {
    const list = clear($('#limits'));
    if (settings().keychainOptOut || snapshot.limits?.hiddenByPreference) {
      text('#limits-summary', t('hidden'));
      list?.append(element('div', 'empty', t('limitsPrivacy')));
      return;
    }
    const windows = Array.isArray(snapshot.limits?.windows) ? snapshot.limits.windows : [];
    if (!officialLimits() || !windows.length) {
      text('#limits-summary', t('unavailable'));
      list?.append(element('div', 'empty', t('limitsUnavailableDetail')));
      return;
    }
    text('#limits-summary', t('windowCount', { count: windows.length }));
    const warning = number(settings().warningPercent) / 100;
    const critical = number(settings().criticalPercent) / 100;
    for (const window of windows) {
      const utilization = clamp(number(window.utilization) / 100);
      const row = element('article', 'limit-row');
      const header = element('header');
      const label = window.kind === 'weekly' ? t('weekly') : t('session');
      const percentage = settings().menuLimitPercent !== false;
      const shown = settings().limitDisplay === 'remaining'
        ? (percentage ? `${Math.round((1 - utilization) * 100)}% ${t('remaining')}` : t('remaining'))
        : (percentage ? `${Math.round(utilization * 100)}% ${t('used')}` : t('used'));
      header.append(element('span', '', `${window.provider || t('provider')} · ${label}`));
      header.append(element('strong', '', shown));
      row.append(header);
      const bar = element('div', 'limit-bar');
      if (utilization >= critical) bar.classList.add('critical');
      else if (utilization >= warning) bar.classList.add('warning');
      const fill = element('span');
      fill.style.width = `${Math.round(utilization * 100)}%`;
      bar.append(fill);
      row.append(bar);
      list?.append(row);
    }
  }

  function renderHome(snapshot) {
    const view = companionView(snapshot);
    const representativeSprite = snapshot.representative
      ? dexSprite({ shiny: snapshot.representative.shiny }, snapshot.representative.id)
      : null;
    const homeSprite = representativeSprite || view.sprite;
    const homeAlt = snapshot.representative?.name || view.name;
    const homeFallback = snapshot.representative?.shiny ? '✨' : view.fallback;
    $('#hero-block')?.classList.remove('progress-updating');
    const frame = clear($('#hero-sprite'));
    if (frame) appendImage(frame, homeSprite, homeAlt, homeFallback);
    text('#hero-rarity', view.rarity);
    text('#hero-name', view.name);
    text('#hero-detail', view.detail);
    const bar = $('#egg-progress span');
    if (bar) bar.style.width = `${Math.round(view.progress * 100)}%`;
    text('#egg-label', view.label);
    text('#progress-feedback', '');
    text('#wallet', compact(snapshot.wallet));
    text('#today-tokens', compact(snapshot.usage?.today?.tokens));
    text('#week-tokens', compact(snapshot.usage?.week?.tokens));
    text('#source-mode', snapshot.mode === 'public-readonly' ? t('publicMode') : t('localMode'));
    renderProviders(snapshot);
    renderLimits(snapshot);
    text('#home-callout', snapshot.readOnly ? t('homeReadOnlyCallout') : t('homeLocalCallout'));
  }

  function itemActive(snapshot, key) {
    return number(snapshot.state?.inventory?.[key]) > 0
      && snapshot.state?.itemActivation?.[key] !== false;
  }

  function inventoryDefinitions(snapshot) {
    return [
      { key: 'rareCandy', title: t('rareCandy'), image: 'assets/items/rare-candy.png', fallback: '🍬', detail: t('rareCandyDetail'), action: 'candy', actionLabel: t('use') },
      { key: 'mint', title: t('mint'), image: 'assets/items/mint.png', fallback: '🌿', detail: t('mintDetail'), action: 'mint', actionLabel: t('use') },
      { key: 'shinyCharm', title: t('shinyCharm'), image: 'assets/items/shiny-charm.png', fallback: '✨', detail: t('shinyCharmDetail'), toggle: true },
      { key: 'pokeDoll', title: t('pokeDoll'), image: 'assets/items/poke-doll.webp', fallback: '🧸', detail: t('pokeDollDetail'), toggle: true },
    ];
  }

  function appendIcon(parent, item) {
    const icon = element('div', 'item-icon');
    if (item.image) appendImage(icon, item.image, item.title, item.fallback);
    else icon.append(element('span', 'item-emoji', item.fallback));
    parent.append(icon);
  }

  function renderBag(snapshot) {
    const inventory = snapshot.state?.inventory || {};
    const list = clear($('#bag-items'));
    const definitions = inventoryDefinitions(snapshot);
    const total = definitions.reduce((sum, item) => sum + number(inventory[item.key]), 0);
    text('#bag-total', t('itemCount', { count: total }));
    if (!total) list?.append(element('div', 'empty', t('emptyBag')));
    for (const item of definitions) {
      const count = number(inventory[item.key]);
      const row = element('div', 'item-row');
      appendIcon(row, item);
      const copy = element('div', 'item-copy');
      copy.append(element('strong', '', item.title));
      copy.append(element('span', '', `${item.detail} · ${t('ownedCount', { count })}`));
      const feedback = actionFeedbackForItem(item.key, item.title);
      if (feedback) {
        row.classList.add('action-feedback-visible');
        copy.append(element('span', 'item-feedback', feedback));
      }
      row.append(copy);
      if (item.toggle) {
        const button = element('button', 'action-button', itemActive(snapshot, item.key) ? t('deactivate') : t('activate'));
        button.type = 'button';
        button.disabled = !canMutate() || model.actionPending || count < 1;
        button.addEventListener('click', () => sendAction('toggle-item', item.key));
        row.append(button);
      } else if (item.action) {
        const button = element('button', 'action-button', item.actionLabel);
        button.type = 'button';
        button.disabled = !canMutate() || model.actionPending || count < 1 || !snapshot.active;
        button.addEventListener('click', () => sendAction(item.action, undefined, { itemKey: item.key }));
        row.append(button);
      } else row.append(element('span', 'meta', count ? item.actionLabel : t('notFound')));
      list?.append(row);
    }
    text('#bag-callout', snapshot.readOnly
      ? t('bagReadOnly')
      : snapshot.active ? t('canUseItems') : t('waitForHatch'));
  }

  function shopDefinitions(snapshot) {
    return [
      { kind: 'rareCandy', title: t('rareCandy'), description: t('rareCandyDescription'), image: 'assets/items/rare-candy.png', fallback: '🍬', price: snapshot.balance?.rareCandy?.price },
      { kind: 'mint', title: t('mint'), description: t('mintDescription'), image: 'assets/items/mint.png', fallback: '🌿', price: snapshot.balance?.mint?.price },
      { kind: 'shinyCharm', title: t('shinyCharm'), description: t('shinyCharmDescription'), image: 'assets/items/shiny-charm.png', fallback: '✨', price: snapshot.balance?.shinyCharm?.price },
      { kind: 'pokeDoll', title: t('pokeDoll'), description: t('pokeDollDescription'), image: 'assets/items/poke-doll.webp', fallback: '🧸', price: snapshot.balance?.pokeDoll?.price },
      { kind: 'freshEgg', tier: null, title: t('commonEgg'), description: t('commonEggDescription'), image: 'assets/emerald-egg-static.png', fallback: '🥚', price: snapshot.balance?.freshEgg?.price },
      { kind: 'uncommonEgg', tier: 'uncommon', title: t('uncommonEgg'), description: t('uncommonEggDescription'), image: 'assets/emerald-egg-static.png', fallback: '🥚', price: snapshot.balance?.uncommonEgg?.price },
      { kind: 'rareEgg', tier: 'rare', title: t('rareEgg'), description: t('rareEggDescription'), image: 'assets/emerald-egg-static.png', fallback: '🥚', price: snapshot.balance?.rareEgg?.price },
    ];
  }

  function renderShop(snapshot) {
    const list = clear($('#shop-items'));
    const inventory = snapshot.state?.inventory || {};
    text('#shop-wallet', t('tokensCount', { tokens: compact(snapshot.wallet) }));
    const uniqueItems = new Set(['shinyCharm', 'pokeDoll']);
    const purchasable = shopDefinitions(snapshot).filter(
      (item) => item.kind !== 'shinyCharm' || number(inventory[item.kind]) < 1,
    );
    for (const item of purchasable) {
      const row = element('article', 'shop-row');
      const main = element('div', 'shop-main');
      appendIcon(main, item);
      const copy = element('div', 'shop-copy');
      copy.append(element('strong', '', item.title));
      copy.append(element('span', '', item.description));
      const feedback = actionFeedbackForItem(item.kind, item.title);
      if (feedback) {
        row.classList.add('action-feedback-visible');
        copy.append(element('span', 'item-feedback', feedback));
      }
      main.append(copy);
      row.append(main);
      const footer = element('div', 'shop-footer');
      const count = item.tier == null && item.kind !== 'freshEgg' ? number(inventory[item.kind]) : null;
      footer.append(element('span', 'meta', count != null
        ? t('ownedPrice', { count, price: compact(item.price) })
        : t('price', { price: compact(item.price) })));
      const button = element('button', 'action-button', t('buy'));
      button.type = 'button';
      const unavailable = uniqueItems.has(item.kind) && number(inventory[item.kind]) > 0;
      button.disabled = !canMutate() || model.actionPending || unavailable || number(item.price) <= 0 || number(snapshot.wallet) < number(item.price);
      button.addEventListener('click', () => sendAction(item.kind.endsWith('Egg') ? 'egg' : 'buy', item.kind.endsWith('Egg') ? item.tier : item.kind));
      footer.append(button);
      row.append(footer);
      list?.append(row);
    }
  }

  function collectionName(entry, id = entry?.finalId || entry?.baseId) {
    const names = entry?.names?.[id];
    if (typeof names === 'string') return names;
    return names?.[catalog.language()] || names?.en || names?.it || entry?.name || t('numberUnknown');
  }

  function dexSprite(entry, id = entry?.id || entry?.finalId || entry?.baseId) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId < 1 || numericId > 100_000) return null;
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${entry.shiny ? 'shiny/' : ''}${numericId}.gif`;
  }

  function renderPokedex(snapshot) {
    const collection = snapshot.collection || {};
    const mode = model.collectionMode === 'log' ? 'log' : 'dex';
    const entries = mode === 'log'
      ? (Array.isArray(collection.catchLog) ? collection.catchLog : [])
      : (Array.isArray(collection.pokedex) ? collection.pokedex : []);
    const list = clear($('#collection-items'));
    const heading = mode === 'log' ? t('catchLogTab') : t('pokedexTab');
    text('#collection-heading', heading);
    text('#collection-description', mode === 'log' ? t('collectionLogDescription') : t('collectionDexDescription'));
    text('#collection-count', mode === 'log'
      ? t('catchCount', { count: entries.length })
      : t('speciesCount', { count: entries.length }));
    document.querySelectorAll('[data-collection-mode]').forEach((button) => {
      const selected = button.dataset.collectionMode === mode;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
    });
    if (!entries.length) {
      list?.append(element('div', 'empty', mode === 'log' ? t('emptyCatchLog') : t('emptyPokedex')));
      return;
    }
    if (mode === 'log') {
      const log = element('div', 'catch-log');
      for (const entry of entries) {
        const row = element('article', 'catch-row');
        const stages = element('div', 'catch-stages');
        const chain = Array.isArray(entry.chainOrder) ? entry.chainOrder : [];
        for (const [index, id] of chain.entries()) {
          if (index) stages.append(element('span', 'chain-arrow', '›'));
          const stage = element('div', 'catch-stage');
          const frame = element('div', 'dex-sprite-frame');
          appendImage(frame, dexSprite(entry, id), collectionName(entry, id), entry.shiny ? '✨' : '🔹');
          stage.append(frame, element('span', 'catch-stage-name', collectionName(entry, id)));
          stages.append(stage);
        }
        const meta = element('div', 'catch-meta');
        const finalId = chain.at(-1);
        meta.append(element('strong', 'catch-name', collectionName(entry, finalId)));
        meta.append(element('span', 'catch-detail', `${entry.kind === 'active' ? t('growing') : t('caught')} · ${rarityLabel(entry.rarity)}`));
        meta.append(element('span', 'catch-detail', `${entry.nature || t('natureUnknown')}${entry.caughtAt ? ` · ${new Date(entry.caughtAt).toLocaleString(catalog.locale())}` : ''}`));
        row.append(stages, meta);
        log.append(row);
      }
      list?.append(log);
      return;
    }
    const grid = element('div', 'pokedex-grid');
    for (const entry of entries) {
      const card = element('article', 'dex-card');
      const imageFrame = element('div', 'dex-sprite-frame');
      const name = collectionName(entry, entry.id);
      appendImage(imageFrame, dexSprite(entry), name, entry.shiny ? '✨' : '🔹');
      card.append(imageFrame);
      card.append(element('span', 'dex-number', entry.id ? t('dexNumber', { id: entry.id }) : t('numberUnknown')));
      card.append(element('strong', 'dex-name', `${entry.shiny ? '✨ ' : ''}${name}`));
      card.append(element('span', 'dex-detail', entry.isRaising ? t('growing') : rarityLabel(entry.rarity)));
      grid.append(card);
    }
    list?.append(grid);
  }

  function settingRow(label, hint, control, full = false) {
    const row = element('div', `setting-row${full ? ' full' : ''}`);
    const copy = element('div', 'setting-copy');
    copy.append(element('strong', '', label));
    if (hint) copy.append(element('small', '', hint));
    row.append(copy);
    const wrapper = element('div', 'setting-control');
    if (control) wrapper.append(control);
    row.append(wrapper);
    return row;
  }

  function settingGroup(label) {
    return element('div', 'settings-group', label);
  }

  function settingButton(label, handler, disabled = false) {
    const button = element('button', 'button', label);
    button.type = 'button';
    button.disabled = disabled;
    button.addEventListener('click', handler);
    return button;
  }

  function createSwitch(key) {
    const button = element('button', `switch${settings()[key] ? ' on' : ''}`);
    button.type = 'button';
    button.setAttribute('aria-label', t('toggleSetting', { name: settingLabel(key) }));
    button.setAttribute('aria-pressed', String(Boolean(settings()[key])));
    button.disabled = !canMutate();
    button.addEventListener('click', () => changeSetting(key, !settings()[key]));
    return button;
  }

  function createSelect(key, options, disabled = false) {
    const select = element('select');
    select.value = String(settings()[key] ?? '');
    select.disabled = disabled || !canMutate();
    for (const [value, label] of options) {
      const option = element('option', '', label);
      option.value = String(value);
      option.selected = String(settings()[key]) === String(value);
      select.append(option);
    }
    select.addEventListener('change', () => {
      if (key === 'language') setLanguage(select.value);
      changeSetting(key, key === 'refreshMinutes' ? Number(select.value) : select.value);
    });
    return select;
  }

  function createRange(key, min, max, suffix = '') {
    const wrapper = element('span', 'range-control');
    const input = element('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.value = String(settings()[key] ?? min);
    input.disabled = !canMutate();
    const output = element('output', 'setting-value', `${input.value}${suffix}`);
    input.addEventListener('input', () => {
      const value = Number(input.value);
      output.textContent = `${value}${suffix}`;
      if (model.snapshot?.settings) model.snapshot.settings[key] = value;
      clearTimeout(settingTimers.get(key));
      settingTimers.set(key, setTimeout(() => {
      sendAction('setting-live', { key, value }, { silent: true, renderAfter: false });
      }, 180));
    });
    wrapper.append(input, output);
    return wrapper;
  }

  async function changeSetting(key, value) {
    return sendAction('setting', { key, value });
  }

  function renderSettingsOverlay() {
    if (!model.settingsOpen || !model.snapshot) return;
    const content = clear($('#settings-content'));
    if (!content) return;
    const noLimits = !officialLimits();
    const s = settings();
    content.append(settingGroup(t('settingsGeneral')));
    content.append(settingRow(t('settingLanguage'), t('settingLanguageHint'), createSelect('language', [
      ['en', 'English'], ['it', 'Italiano'], ['ko', '한국어'], ['ja', '日本語'], ['es', 'Español'], ['fr', 'Français'], ['pt', 'Português'],
    ])));
    const refreshOptions = [['0', t('manual')]];
    for (let minute = 1; minute <= 15; minute += 1) refreshOptions.push([String(minute), `${minute} ${t(minute === 1 ? 'minute' : 'minutes')}`]);
    content.append(settingRow(t('settingRefresh'), t('settingRefreshHint'), createSelect('refreshMinutes', refreshOptions)));
    content.append(settingRow(t('settingLimitDisplay'), t('settingLimitDisplayHint'), createSelect('limitDisplay', [['used', t('usedOption')], ['remaining', t('remainingOption')]], noLimits)));
    content.append(settingRow(t('settingAutostart'), t('settingAutostartHint'), createSwitch('launchAtLogin')));

    content.append(settingGroup(t('summaryGroup')));
    content.append(settingRow(t('settingTodayTokens'), t('settingTodayTokensHint'), createSwitch('menuTodayTokens')));
    content.append(settingRow(t('settingTodayCost'), t('settingTodayCostHint'), createSwitch('menuTodayCost')));
    content.append(settingRow(t('settingLimitPercent'), t('settingLimitPercentHint'), createSwitch('menuLimitPercent')));

    content.append(settingRow(t('settingProvider'), t('settingProviderHint'), createSwitch('providerStatus')));

    content.append(settingGroup(t('privacyGroup')));
    content.append(settingRow(t('settingHideLimits'), t('settingHideLimitsHint'), createSwitch('keychainOptOut')));

    content.append(settingGroup(t('scanGroup')));
    const scanRow = element('div', 'setting-row full');
    const scanCopy = element('div', 'setting-copy');
    scanCopy.append(element('strong', '', t('additionalFolders')));
    scanCopy.append(element('small', '', t('additionalFoldersHint', { count: number(s.additionalScanFolderCount) })));
    const scanActions = element('div', 'scan-folder-actions');
    const scanInput = element('input');
    scanInput.type = 'text';
    scanInput.placeholder = t('absolutePath');
    scanInput.setAttribute('aria-label', t('additionalFolders'));
    scanActions.append(scanInput);
    scanActions.append(settingButton(t('add'), async () => {
      const folder = scanInput.value.trim();
      if (!folder) return notify(t('actionFailed'), true);
      const result = await sendAction('add-scan-folder', { folder });
      if (result?.ok) scanInput.value = '';
    }, !canMutate()));
    scanActions.append(settingButton(t('clear'), () => sendAction('clear-scan-folders'), !canMutate()));
    scanRow.append(scanCopy, scanActions);
    content.append(scanRow);

    content.append(settingGroup(t('backupGroup')));
    const backupButtons = element('span');
    backupButtons.append(settingButton(t('export'), exportSave, !canMutate()), settingButton(t('import'), importSave, !canMutate()));
    content.append(settingRow(t('save'), t('saveHint'), backupButtons));

    content.append(settingGroup(t('updatesGroup')));
    content.append(settingRow(t('settingUpdate'), t('settingUpdateHint'), createSwitch('updateNotifications')));
    const updateCopy = model.update?.ok
      ? model.update.updateAvailable ? t('updateNew', { version: model.update.latestVersion }) : t('updateCurrent')
      : model.update ? t('updateUnavailable') : t('updateNotChecked');
    const updateButtons = element('span');
    updateButtons.append(settingButton(t('checkNow'), checkForUpdates, false));
    if (model.update?.url) {
      const link = element('a', 'button', t('openRelease'));
      link.href = model.update.url;
      link.target = '_blank';
      link.rel = 'noreferrer';
      updateButtons.append(link);
    }
    content.append(settingRow(t('checkNow'), updateCopy, updateButtons));

    content.append(settingGroup(t('supportGroup')));
    const projectLink = model.config?.projectUrl ? element('a', 'button', t('open')) : settingButton(t('unavailable'), () => {}, true);
    if (projectLink.tagName === 'A') {
      projectLink.href = model.config.projectUrl;
      projectLink.target = '_blank';
      projectLink.rel = 'noreferrer';
    }
    content.append(settingRow(t('projectPage'), t('projectPageHint'), projectLink));
    const issueLink = model.config?.issuesUrl ? element('a', 'button', t('open')) : settingButton(t('unavailable'), () => {}, true);
    if (issueLink.tagName === 'A') {
      issueLink.href = model.config.issuesUrl;
      issueLink.target = '_blank';
      issueLink.rel = 'noreferrer';
    }
    content.append(settingRow(t('reportIssue'), t('reportIssueHint'), issueLink));
    content.append(element('p', 'settings-footnote', model.snapshot.readOnly
      ? t('readOnlySettings')
      : t('localActions')));
  }

  async function checkForUpdates() {
    await sendAction('check-update');
  }

  function downloadJson(filename, value) {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = element('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function exportSave() {
    const result = await sendAction('export-save', undefined, { silent: true, renderAfter: false });
    if (!result?.save) return;
    downloadJson('poketokendocker-companion-save.json', {
      format: 'poketokendocker-web-save-v1',
      state: result.save,
    });
    notify(t('exported'));
  }

  async function importSave() {
    const input = element('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file || file.size > 1_024 * 1_024) return notify(t('actionFailed'), true);
      try {
        const payload = JSON.parse(await file.text());
        const state = payload?.state && typeof payload.state === 'object' ? payload.state : payload;
        const result = await sendAction('import-save', state);
        if (result?.ok) notify(t('imported'));
      } catch {
        notify(t('actionFailed'), true);
      }
    }, { once: true });
    input.click();
  }

  function openSettings() {
    if (!model.snapshot) return;
    model.settingsOpen = true;
    const overlay = $('#settings-overlay');
    if (overlay) overlay.hidden = false;
    renderSettingsOverlay();
    $('#settings-close')?.focus();
  }

  function closeSettings() {
    model.settingsOpen = false;
    const overlay = $('#settings-overlay');
    if (overlay) overlay.hidden = true;
  }

  function scheduleRefresh() {
    const minutes = Math.floor(number(settings().refreshMinutes));
    if (model.refreshMinutes === minutes) return;
    if (model.refreshTimer) clearInterval(model.refreshTimer);
    model.refreshMinutes = minutes;
    model.refreshTimer = minutes > 0
      ? setInterval(() => sendAction('refresh', undefined, { silent: true }), minutes * 60_000)
      : null;
  }

  function render() {
    if (model.snapshot) setLanguage(settings().language);
    renderStatus();
    if (!model.snapshot) return;
    renderHome(model.snapshot);
    renderBag(model.snapshot);
    renderShop(model.snapshot);
    renderPokedex(model.snapshot);
    scheduleRefresh();
    if (model.settingsOpen) renderSettingsOverlay();
  }

  async function boot() {
    try {
      model.capabilities = await request('/api/capabilities');
      try {
        model.config = await request('/api/config');
      } catch {
        model.config = {};
      }
      model.snapshot = await request('/api/snapshot');
      render();
      notify(t('connected'));
      if (settings().updateNotifications) setTimeout(() => sendAction('check-update', undefined, { silent: true }), 0);
      if (typeof EventSource !== 'undefined') {
        const events = new EventSource('/api/events');
        events.addEventListener('activity', (event) => {
          try {
            const activity = JSON.parse(event.data);
            if (activity.type !== 'candy') return;
            model.actionPending = Boolean(activity.pending);
            render();
          } catch {}
        });
        events.addEventListener('snapshot', (event) => {
          try {
            model.snapshot = JSON.parse(event.data);
            render();
          } catch {}
        });
      }
    } catch {
      renderStatus();
      notify(t('actionFailed'), true);
    }
  }

  $('#refresh')?.addEventListener('click', () => sendAction('refresh'));
  $('#settings-open')?.addEventListener('click', openSettings);
  $('#settings-close')?.addEventListener('click', closeSettings);
  $('[data-close-settings]')?.addEventListener('click', closeSettings);
  document.querySelectorAll('[data-collection-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      model.collectionMode = button.dataset.collectionMode === 'log' ? 'log' : 'dex';
      renderPokedex(model.snapshot);
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && model.settingsOpen) closeSettings();
  });
  boot();
})();