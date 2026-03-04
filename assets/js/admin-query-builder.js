// ==============================================================
// STATE
// ==============================================================
const API = 'http://localhost:3000/api';
let token = localStorage.getItem('admin_token') || '';
let allTables = [], allViews = [], allProcs = [], allTriggers = [];
let fkMap = {};       // table -> [{column_name, referenced_table, referenced_column}]
let colMeta = {};     // current source columns

// Operation pipeline
let ops = [];         // [{type, config, id}]
let opIdSeq = 1;
let page = 1, limit = 50;
let resultData = [], resultMeta = {};
let savedQueryId = null;

// Category mapping
const CATEGORIES = {
  'Identity & Security': ['users','roles','user_roles','permissions','role_permissions'],
  'Academics': ['students','departments','programs','semesters','courses','course_offerings','enrollments','results','grade_scale'],
  'Attendance & Timetable': ['class_sessions','attendance_records'],
  'Exams': ['exams','exam_marks'],
  'Finance': ['fee_heads','student_invoices','invoice_items','payments'],
  'Hostel': ['hostel_rooms','room_allocations'],
  'Transport': ['transport_routes','transport_subscriptions'],
  'Admin / Monitoring': ['audit_logs','ledger_events','system_config','fact_academic'],
};

// ==============================================================
// AUTH (auto-login)
// ==============================================================
async function auth() {
  // Always get a fresh token on page load to avoid expired-token issues
  token = '';
  localStorage.removeItem('admin_token');
  try {
    const r = await fetch(`${API}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@diu.edu.bd',password:'password123'})});
    const d = await r.json();
    if (d.success) {
      token = d.data?.token || d.token || '';
      localStorage.setItem('admin_token', token);
      console.log('Auth OK, token acquired');
    } else {
      console.error('Login failed:', d.message);
      toast('Login failed: ' + (d.message||'unknown error'), 'err');
    }
  } catch(e) {
    console.error('Auto-login failed', e);
    toast('Cannot reach backend at ' + API, 'err');
  }
  loadMeta();
}

function api(path, opts={}) {
  return fetch(`${API}${path}`,{...opts,headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`,...(opts.headers||{})}}).then(r => r.json());
}

// ==============================================================
// METADATA
// ==============================================================
async function loadMeta() {
  try {
    const [t,v,p,tr] = await Promise.all([
      api('/query-builder/tables'),
      api('/query-builder/views'),
      api('/query-builder/procedures'),
      api('/query-builder/triggers')
    ]);
    // Check for auth failure
    if (!t.success) {
      console.error('Tables fetch failed:', t);
      toast('Failed to load tables: ' + (t.message||'auth error'), 'err');
      return;
    }
    allTables = t.data || [];
    allViews = v.data || [];
    allProcs = p.data || [];
    allTriggers = tr.data || [];
    console.log(`Loaded: ${allTables.length} tables, ${allViews.length} views`);
    renderCatalog();
    document.getElementById('objCount').textContent = `${allTables.length} tables, ${allViews.length} views`;
  } catch(e) {
    console.error('loadMeta error:', e);
    toast('Failed to load metadata: ' + e.message, 'err');
  }
}

// ==============================================================
// LEFT SIDEBAR — Catalog
// ==============================================================
function renderCatalog() {
  const el = document.getElementById('catalog');
  const q = document.getElementById('catSearch').value.toLowerCase();
  let html = '';

  // Table categories
  const assigned = new Set();
  for (const [cat, names] of Object.entries(CATEGORIES)) {
    const tables = allTables.filter(t => names.includes(t.table_name) && t.table_name.includes(q));
    if (!tables.length && !cat.toLowerCase().includes(q)) continue;
    tables.forEach(t => assigned.add(t.table_name));
    html += catHtml(cat, tables, 'T');
  }
  // Other tables
  const other = allTables.filter(t => !assigned.has(t.table_name) && t.table_name.includes(q));
  if (other.length) html += catHtml('Other Tables', other, 'T');

  // Views
  const views = allViews.filter(v => v.view_name.includes(q));
  if (views.length || 'views'.includes(q) || !q) {
    const viewsOpen = views.length > 0;
    html += `<div class="cat"><div class="cat-head${viewsOpen?' open':''}" onclick="togCat(this)"><span class="arrow">&#9654;</span> Views (Computed) <span class="cnt">${views.length}</span></div><div class="cat-body${viewsOpen?' show':''}">`;
    views.forEach(v => {
      const act = getSource()===v.view_name?' active':'';
      html += `<div class="tbl-item${act}" onclick="selectSrc('${v.view_name}','view')"><span class="badge-icon V">V</span><span>${v.view_name}</span></div>`;
    });
    if (!views.length) html += `<div style="padding:6px 10px;font-size:.7rem;color:rgba(255,255,255,.3)">No views</div>`;
    html += '</div></div>';
  }

  el.innerHTML = html || '<div style="padding:20px;text-align:center;color:rgba(255,255,255,.4);font-size:.78rem;">No items found</div>';
}

function catHtml(cat, tables, badge) {
  const q = document.getElementById('catSearch').value;
  // Auto-expand when tables exist (always show contents). Collapse only empty categories.
  const open = tables.length > 0;
  let h = `<div class="cat"><div class="cat-head${open?' open':''}" onclick="togCat(this)"><span class="arrow">&#9654;</span> ${cat} <span class="cnt">${tables.length}</span></div><div class="cat-body${open?' show':''}">`;
  tables.forEach(t => {
    const act = getSource()===t.table_name?' active':'';
    h += `<div class="tbl-item${act}" onclick="selectSrc('${t.table_name}','table')"><span class="badge-icon ${badge}">${badge}</span><span>${t.table_name}</span><span class="rows">${t.row_count||0}</span></div>`;
  });
  if (!tables.length) h += `<div style="padding:6px 10px;font-size:.7rem;color:rgba(255,255,255,.3)">No tables</div>`;
  h += '</div></div>';
  return h;
}

function togCat(el) { el.classList.toggle('open'); el.nextElementSibling.classList.toggle('show'); }
function filterCatalog() { renderCatalog(); }

// ==============================================================
// SOURCE SELECTION (from sidebar click)
// ==============================================================
async function selectSrc(name, type) {
  // If ops already has a source, replace it; otherwise add
  const existing = ops.findIndex(o => o.type==='select_source');
  const config = { name, sourceType: type||'table' };
  if (existing >= 0) { ops[existing].config = config; } 
  else { ops.unshift({ type:'select_source', config, id: opIdSeq++ }); }
  await loadColMeta(name);
  renderOps();
  renderCatalog();
  execQuery();
  // Open drawer if it's closed so user can see operations
  const app = document.getElementById('app');
  if (!app.classList.contains('drawer-open')) {
    app.classList.add('drawer-open');
    const icon = document.getElementById('drawerToggle')?.querySelector('svg');
    if (icon) icon.style.transform = '';
  }
  return Promise.resolve();
}

async function loadColMeta(name) {
  try {
    const r = await api(`/query-builder/tables/${name}/columns`);
    colMeta = {};
    (r.data||[]).forEach(c => { colMeta[c.column_name] = c; });
    // Load FK info
    const fk = await api(`/query-builder/tables/${name}/foreign-keys`);
    fkMap[name] = fk.data||[];
  } catch(e) { colMeta = {}; }
}

function getSource() {
  const s = ops.find(o=>o.type==='select_source');
  return s ? s.config.name : '';
}
function getSourceType() {
  const s = ops.find(o=>o.type==='select_source');
  return s ? s.config.sourceType : 'table';
}
function getCols() { return Object.values(colMeta); }

// ==============================================================
// SQL BUILDER (from ops pipeline)
// ==============================================================
function buildSql() {
  const src = getSource();
  if (!src) return '';

  // Check for custom SQL op
  const customOp = ops.find(o=>o.type==='custom');
  if (customOp) return customOp.config.sql;

  // SELECT
  const projOp = ops.find(o=>o.type==='project');
  const grpOp = ops.find(o=>o.type==='group');
  const compOps = ops.filter(o=>o.type==='computed');
  const joinOps = ops.filter(o=>o.type==='join');

  let selParts = [];
  if (grpOp) {
    selParts = (grpOp.config.groupCols||[]).map(c => `\`${src}\`.\`${c}\``);
    (grpOp.config.aggs||[]).forEach(a => {
      const col = a.column==='*'?'*':`\`${a.column}\``;
      selParts.push(`${a.fn}(${col}) AS \`${a.alias||a.fn.toLowerCase()+'_'+a.column}\``);
    });
  } else if (projOp && projOp.config.columns && projOp.config.columns.length) {
    selParts = projOp.config.columns.map(c => `\`${src}\`.\`${c}\``);
    joinOps.forEach(j => {
      if (j.config.addCols && j.config.addCols.length) {
        j.config.addCols.forEach(c => selParts.push(`\`${j.config.table}\`.\`${c}\``));
      } else {
        selParts.push(`\`${j.config.table}\`.*`);
      }
    });
  } else {
    if (joinOps.length) {
      selParts.push(`\`${src}\`.*`);
      joinOps.forEach(j => {
        if (j.config.addCols && j.config.addCols.length) {
          j.config.addCols.forEach(c => selParts.push(`\`${j.config.table}\`.\`${c}\``));
        } else {
          selParts.push(`\`${j.config.table}\`.*`);
        }
      });
    } else {
      selParts.push('*');
    }
  }

  // Computed columns
  compOps.forEach(c => {
    selParts.push(`${c.config.expr} AS \`${c.config.name}\``);
  });

  let sql = `SELECT ${selParts.join(', ')}\nFROM \`${src}\``;

  // JOINs
  joinOps.forEach(j => {
    const jt = j.config.joinType;
    if (jt === 'FULL') {
      // MySQL workaround: LEFT JOIN UNION RIGHT JOIN
      // For simplicity we'll use LEFT JOIN here and note it
      sql += `\nLEFT JOIN \`${j.config.table}\` ON \`${src}\`.\`${j.config.leftCol}\` = \`${j.config.table}\`.\`${j.config.rightCol}\``;
    } else if (jt === 'CROSS') {
      sql += `\nCROSS JOIN \`${j.config.table}\``;
    } else {
      sql += `\n${jt} JOIN \`${j.config.table}\` ON \`${src}\`.\`${j.config.leftCol}\` = \`${j.config.table}\`.\`${j.config.rightCol}\``;
    }
  });

  // WHERE
  const filterOps = ops.filter(o=>o.type==='filter');
  if (filterOps.length) {
    const conds = [];
    filterOps.forEach(f => {
      (f.config.conditions||[]).forEach((c,i) => {
        const prefix = conds.length > 0 ? ` ${c.logic||'AND'} ` : '';
        if (c.op==='IS NULL'||c.op==='IS NOT NULL') {
          conds.push(`${prefix}\`${src}\`.\`${c.column}\` ${c.op}`);
        } else if (c.op==='IN') {
          conds.push(`${prefix}\`${src}\`.\`${c.column}\` IN (${c.value})`);
        } else if (c.op==='LIKE') {
          conds.push(`${prefix}\`${src}\`.\`${c.column}\` LIKE '%${c.value}%'`);
        } else if (c.op==='BETWEEN') {
          const [a,b] = (c.value||'').split(',').map(s=>s.trim());
          conds.push(`${prefix}\`${src}\`.\`${c.column}\` BETWEEN '${a}' AND '${b}'`);
        } else {
          conds.push(`${prefix}\`${src}\`.\`${c.column}\` ${c.op} '${c.value}'`);
        }
      });
    });
    if (conds.length) sql += `\nWHERE ${conds.join('')}`;
  }

  // GROUP BY
  if (grpOp && grpOp.config.groupCols && grpOp.config.groupCols.length) {
    sql += `\nGROUP BY ${grpOp.config.groupCols.map(c=>`\`${src}\`.\`${c}\``).join(', ')}`;
    if (grpOp.config.having) sql += `\nHAVING ${grpOp.config.having}`;
  }

  // UNION / Append
  const appendOp = ops.find(o=>o.type==='append');
  if (appendOp) {
    sql += `\n${appendOp.config.unionType}\nSELECT * FROM \`${appendOp.config.table}\``;
  }

  // ORDER BY
  const sortOp = ops.find(o=>o.type==='sort');
  if (sortOp && sortOp.config.sorts && sortOp.config.sorts.length) {
    sql += `\nORDER BY ${sortOp.config.sorts.map(s=>`\`${s.column}\` ${s.dir}`).join(', ')}`;
  }

  // LIMIT
  const limOp = ops.find(o=>o.type==='limit');
  const lim = limOp ? limOp.config.limit : limit;
  const offset = (page - 1) * lim;
  sql += `\nLIMIT ${lim} OFFSET ${offset}`;

  return sql;
}

function highlightSql(sql) {
  const kws = ['SELECT','FROM','WHERE','JOIN','INNER','LEFT','RIGHT','FULL','OUTER','CROSS','ON','AND','OR','NOT','IN','LIKE','IS','NULL','AS','ORDER','BY','GROUP','HAVING','LIMIT','OFFSET','UNION','ALL','DISTINCT','COUNT','SUM','AVG','MIN','MAX','DESC','ASC','BETWEEN','EXISTS','CASE','WHEN','THEN','ELSE','END','CREATE','VIEW','TABLE','INDEX','EXPLAIN','SHOW','DESCRIBE'];
  return sql.replace(/('[^']*')/g,'<span class="str">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g,'<span class="num">$1</span>')
    .replace(new RegExp(`\\b(${kws.join('|')})\\b`,'gi'),'<span class="kw">$1</span>')
    .replace(/(COUNT|SUM|AVG|MIN|MAX|ROUND|CONCAT|IFNULL|COALESCE|NOW|DATE_FORMAT|SHA2|JSON_OBJECT)\s*\(/gi,'<span class="fn">$1</span>(')
    .replace(/`([^`]+)`/g,'<span class="tbl-hl">`$1`</span>');
}

function updateSqlPreview() {
  const sql = buildSql();
  document.getElementById('sqlCode').innerHTML = highlightSql(sql || '-- Select a table to begin');
}

function toggleSql() { document.getElementById('sqlBar').classList.toggle('open'); updateSqlPreview(); }
function copySql() { navigator.clipboard.writeText(buildSql()).then(()=>toast('SQL copied!','inf')); }

// ==============================================================
// QUERY EXECUTION
// ==============================================================
async function execQuery() {
  const sql = buildSql();
  if (!sql) { console.warn('execQuery: no SQL to run'); return; }
  console.log('execQuery SQL:', sql.substring(0, 120) + '...');
  showLoading(true);
  updateSqlPreview();
  updateSourceLabel();
  try {
    const t0 = performance.now();
    const r = await api('/query-builder/execute',{method:'POST',body:JSON.stringify({sql})});
    const elapsed = Math.round(performance.now()-t0);
    console.log('execQuery result:', r.success, 'rows:', r.data?.length);
    if (r.success) {
      resultData = r.data||[];
      resultMeta = r.meta||{};
      renderGrid();
      setStatus('ok',`${resultData.length} rows in ${r.meta?.executionTime||elapsed+'ms'}`, resultMeta.rowCount);
      document.getElementById('topStatus').style.display = 'flex';
      document.getElementById('topStatusText').textContent = `${resultData.length} rows in ${r.meta?.executionTime||elapsed+'ms'}`;
    } else {
      console.error('execQuery error:', r.message);
      showError(r.message);
      setStatus('err', r.message);
    }
  } catch(e) {
    console.error('execQuery exception:', e);
    showError(e.message);
    setStatus('err', e.message);
  }
  showLoading(false);
}

function updateSourceLabel() {
  const src = getSource();
  const label = document.getElementById('sourceLabel');
  const nameEl = document.getElementById('sourceName');
  if (!src) { label.style.display='none'; return; }
  label.style.display = 'flex';
  // Build source display
  const joinOps = ops.filter(o=>o.type==='join');
  const customOp = ops.find(o=>o.type==='custom');
  if (customOp) {
    nameEl.textContent = 'Custom SQL Query';
  } else if (joinOps.length) {
    nameEl.textContent = [src, ...joinOps.map(j=>j.config.table)].join(' + ');
  } else {
    nameEl.textContent = src;
  }
  document.getElementById('topTitle').textContent = document.getElementById('qTitle').value || src;
}

// ==============================================================
// GRID RENDERING
// ==============================================================
function renderGrid() {
  if (!resultData.length) {
    document.getElementById('dataGrid').style.display='none';
    document.getElementById('emptyState').style.display='flex';
    document.getElementById('emptyState').innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><h3>No Results</h3><p>The query returned 0 rows.</p>`;
    return;
  }
  document.getElementById('emptyState').style.display='none';
  const grid = document.getElementById('dataGrid');
  grid.style.display='table';

  const cols = Object.keys(resultData[0]);
  const src = getSource();
  const fks = fkMap[src]||[];
  const fkLookup = {};
  fks.forEach(f=>{fkLookup[f.column_name]=f;});

  // Header
  let hh = '<tr><th class="row-num">#</th>';
  cols.forEach(col => {
    const m = colMeta[col];
    const dtype = m ? m.data_type : '';
    let badges = '';
    if (m?.column_key === 'PRI') badges += '<span class="pk-badge">PK</span>';
    if (m?.column_key === 'MUL' || fkLookup[col]) {
      const ref = fkLookup[col];
      const tip = ref ? `${ref.referenced_table}.${ref.referenced_column}` : '';
      badges += `<span class="fk-badge" title="FK → ${tip}">FK</span>`;
    }
    hh += `<th onclick="sortCol('${col}')">
      <span>${col}</span>${badges}
      <span class="sort-arrow">⇅</span>
      <span class="col-menu" title="Column options">⋯</span>
      <div class="col-meta">${dtype?`<span class="dtype">${dtype}${m?.max_length?`(${m.max_length})`:''}</span>`:''}</div>
    </th>`;
  });
  hh += '</tr>';
  document.getElementById('gridHead').innerHTML = hh;

  // Body
  const limOp = ops.find(o=>o.type==='limit');
  const lim = limOp ? limOp.config.limit : limit;
  let bh = '';
  resultData.forEach((row, idx) => {
    bh += `<tr><td class="row-num">${(page-1)*lim+idx+1}</td>`;
    cols.forEach(col => {
      const v = row[col];
      const m = colMeta[col];
      if (v === null || v === undefined) {
        bh += '<td><span class="null">NULL</span></td>';
      } else if (m?.column_key === 'PRI') {
        bh += `<td class="pk-cell">${esc(String(v))}</td>`;
      } else if (m?.column_key === 'MUL' || fkLookup[col]) {
        bh += `<td class="fk-cell" title="FK value">${esc(String(v))}</td>`;
      } else if (typeof v === 'object') {
        bh += `<td title="${esc(JSON.stringify(v))}">{JSON}</td>`;
      } else {
        bh += `<td>${esc(String(v))}</td>`;
      }
    });
    bh += '</tr>';
  });
  document.getElementById('gridBody').innerHTML = bh;

  // Pagination
  document.getElementById('pageInfo').textContent = `Page ${page}`;
  document.getElementById('prevBtn').disabled = page <= 1;
  document.getElementById('nextBtn').disabled = resultData.length < (limOp?limOp.config.limit:limit);
}

function sortCol(col) {
  let sortOp = ops.find(o=>o.type==='sort');
  if (!sortOp) { sortOp = {type:'sort',config:{sorts:[]},id:opIdSeq++}; ops.push(sortOp); }
  const existing = sortOp.config.sorts.find(s=>s.column===col);
  if (existing) existing.dir = existing.dir==='ASC'?'DESC':'ASC';
  else sortOp.config.sorts = [{column:col,dir:'ASC'}];
  renderOps();
  execQuery();
}

function prevPage() { page = Math.max(1,page-1); execQuery(); }
function nextPage() { page++; execQuery(); }

// ==============================================================
// RIGHT DRAWER
// ==============================================================
function toggleDrawer() {
  const app = document.getElementById('app');
  app.classList.toggle('drawer-open');
  const icon = document.getElementById('drawerToggle').querySelector('svg');
  icon.style.transform = app.classList.contains('drawer-open') ? '' : 'rotate(180deg)';
}

// ==============================================================
// OPERATIONS STACK (right panel)
// ==============================================================
function renderOps() {
  const el = document.getElementById('opsList');
  const empty = document.getElementById('opsEmpty');
  if (!ops.length) {
    el.innerHTML = '';
    el.style.display = 'none';
    if (empty) empty.style.display = 'flex';
    return;
  }
  el.style.display = 'block';
  if (empty) empty.style.display = 'none';
  let html = '';
  ops.forEach((op, i) => {
    const info = opInfo(op);
    html += `
    <div class="op-card" data-id="${op.id}">
      <span class="op-order">${i+1}</span>
      <div class="op-icon ${info.cls}" title="${info.label}">${info.icon}</div>
      <div class="op-text">
        <div class="op-type">${info.label}</div>
        <div class="op-desc" title="${esc(info.desc)}">${info.desc||'<em style="opacity:.5">click edit to configure</em>'}</div>
      </div>
      <div class="op-actions">
        <button title="Edit" onclick="editOp(${op.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>
        <button title="Remove" onclick="removeOp(${op.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>`;
  });
  el.innerHTML = html;
  console.log(`renderOps: ${ops.length} operations rendered`);
}

function opInfo(op) {
  const c = op.config||{};
  switch(op.type){
    case 'select_source': return {cls:'src',icon:'⛁',label:'Select Source',desc:c.name||'-'};
    case 'project': return {cls:'proj',icon:'π',label:'Choose Columns',desc:`${(c.columns||[]).length} columns`};
    case 'filter': return {cls:'filt',icon:'σ',label:'Filter Rows',desc:(c.conditions||[]).map(f=>`${f.column} ${f.op} ${f.value||''}`).join(', ')||'No conditions'};
    case 'join': return {cls:'join',icon:'⨝',label:`${c.joinType||'INNER'} Join`,desc:`${c.table||'-'} ON ${c.leftCol||'?'}=${c.rightCol||'?'}`};
    case 'group': return {cls:'grp',icon:'γ',label:'Group & Summarize',desc:(c.groupCols||[]).join(', ')||'Global aggregate'};
    case 'computed': return {cls:'comp',icon:'+',label:'Add Column',desc:c.name||'-'};
    case 'append': return {cls:'app',icon:'∪',label:'Append (UNION)',desc:c.table||'-'};
    case 'sort': return {cls:'sort',icon:'↕',label:'Sort',desc:(c.sorts||[]).map(s=>`${s.column} ${s.dir}`).join(', ')};
    case 'limit': return {cls:'lim',icon:'#',label:'Limit',desc:`${c.limit} rows`};
    case 'custom': return {cls:'src',icon:'</>',label:'Custom SQL',desc:(c.sql||'').substring(0,40)+'…'};
    default: return {cls:'src',icon:'?',label:op.type,desc:''};
  }
}

function removeOp(id) {
  ops = ops.filter(o=>o.id!==id);
  renderOps();
  if (getSource()) { page = 1; execQuery(); }
  else {
    document.getElementById('dataGrid').style.display='none';
    document.getElementById('emptyState').style.display='flex';
    document.getElementById('emptyState').innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg><h3>Select a Source</h3><p>Pick a table or view from the Data Catalog, then add operations to build your query.</p>`;
    document.getElementById('topStatus').style.display='none';
    document.getElementById('topTitle').textContent='Select a Table';
    document.getElementById('sourceLabel').style.display='none';
  }
  renderCatalog();
}

function editOp(id) {
  const op = ops.find(o=>o.id===id);
  if (!op) return;
  switch(op.type) {
    case 'select_source': openModal('modalSource'); break;
    case 'project': openConfigModal('modalProject',op); break;
    case 'filter': openConfigModal('modalFilter',op); break;
    case 'join': openConfigModal('modalJoin',op); break;
    case 'group': openConfigModal('modalGroup',op); break;
    case 'computed': openConfigModal('modalComputed',op); break;
    case 'append': openConfigModal('modalAppend',op); break;
    case 'sort': openConfigModal('modalSort',op); break;
    case 'limit': openConfigModal('modalLimit',op); break;
    case 'custom': openConfigModal('modalCustom',op); break;
  }
}

// Track which op is being edited
let editingOpId = null;

// ==============================================================
// ADD OPERATION FLOW
// ==============================================================
function openOpPicker() { openModal('modalOpPicker'); }

function pickOp(type) {
  closeModal('modalOpPicker');
  // If no source selected, force select_source first, then continue with chosen op
  if (type !== 'select_source' && type !== 'custom' && !getSource()) {
    toast('Pick a source table first from the catalog on the left, or use Select Source.', 'err');
    // Open select source dialog so they can quickly pick one
    editingOpId = null;
    openModal('modalSource');
    populateSourceModal();
    // Store the intended op so we can auto-open it after source is confirmed
    window._pendingOp = type;
    return;
  }
  window._pendingOp = null;
  editingOpId = null; // new op
  switch(type){
    case 'select_source': openModal('modalSource'); populateSourceModal(); break;
    case 'project': openModal('modalProject'); populateProjectModal(); break;
    case 'filter': openModal('modalFilter'); populateFilterModal(); break;
    case 'join': openModal('modalJoin'); populateJoinModal(); break;
    case 'append': openModal('modalAppend'); populateAppendModal(); break;
    case 'group': openModal('modalGroup'); populateGroupModal(); break;
    case 'computed': openModal('modalComputed'); populateComputedModal(); break;
    case 'sort': openModal('modalSort'); populateSortModal(); break;
    case 'limit': openModal('modalLimit'); break;
    case 'custom': openModal('modalCustom'); break;
  }
}

function openConfigModal(modalId, op) {
  editingOpId = op.id;
  openModal(modalId);
  switch(op.type) {
    case 'select_source': populateSourceModal(); break;
    case 'project': populateProjectModal(op); break;
    case 'filter': populateFilterModal(op); break;
    case 'join': populateJoinModal(op); break;
    case 'append': populateAppendModal(op); break;
    case 'group': populateGroupModal(op); break;
    case 'computed': populateComputedModal(op); break;
    case 'sort': populateSortModal(op); break;
    case 'limit': document.getElementById('limitVal').value = op.config.limit||50; break;
    case 'custom': document.getElementById('customSqlInput').value = op.config.sql||''; break;
  }
}

// ==============================================================
// MODAL HELPERS
// ==============================================================
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); editingOpId = null; }

// -- Select Source
function populateSourceModal() {
  const sel = document.getElementById('cfgSrcName');
  loadSrcOptions();
}
function loadSrcOptions() {
  const type = document.getElementById('cfgSrcType').value;
  const sel = document.getElementById('cfgSrcName');
  const items = type==='view'?allViews:allTables;
  sel.innerHTML = '<option value="">-- Choose --</option>' + items.map(i=>{
    const n = i.table_name||i.view_name;
    return `<option value="${n}" ${n===getSource()?'selected':''}>${n}</option>`;
  }).join('');
}
function confirmSource() {
  const name = document.getElementById('cfgSrcName').value;
  const type = document.getElementById('cfgSrcType').value;
  if (!name) { toast('Pick a table','err'); return; }
  closeModal('modalSource');
  selectSrc(name, type).then(() => {
    // If there was a pending operation waiting for source, open it now
    if (window._pendingOp) {
      const pending = window._pendingOp;
      window._pendingOp = null;
      setTimeout(() => pickOp(pending), 80);
    }
  });
}

// -- Choose Columns
function populateProjectModal(op) {
  const list = document.getElementById('colCheckList');
  const selected = op ? (op.config.columns||[]) : [];
  const allCols = getCols();
  list.innerHTML = allCols.map(c => {
    const checked = !selected.length || selected.includes(c.column_name) ? 'checked' : '';
    let badge = '';
    if (c.column_key==='PRI') badge='<span class="cbadge pk">PK</span>';
    else if (c.column_key==='MUL') badge='<span class="cbadge fk">FK</span>';
    return `<label class="check-item"><input type="checkbox" value="${c.column_name}" ${checked}><span class="cname">${c.column_name}</span>${badge}<span class="ctype">${c.data_type}</span></label>`;
  }).join('');
}
function toggleAllCols(state) { document.querySelectorAll('#colCheckList input').forEach(c=>c.checked=state); }
function confirmProject() {
  const checked = Array.from(document.querySelectorAll('#colCheckList input:checked')).map(c=>c.value);
  const allCols = getCols();
  const config = { columns: checked.length===allCols.length ? [] : checked };
  if (editingOpId) {
    const op = ops.find(o=>o.id===editingOpId);
    if (op) op.config = config;
  } else {
    // Replace existing project op or add new
    const idx = ops.findIndex(o=>o.type==='project');
    if (idx>=0) ops[idx].config = config;
    else ops.push({type:'project',config,id:opIdSeq++});
  }
  closeModal('modalProject');
  renderOps(); execQuery();
}

// -- Filter Rows
let tempFilters = [];
function populateFilterModal(op) {
  tempFilters = op ? JSON.parse(JSON.stringify(op.config.conditions||[])) : [];
  if (!tempFilters.length) tempFilters.push({column:getCols()[0]?.column_name||'',op:'=',value:'',logic:'AND'});
  renderFilterRows();
}
function renderFilterRows() {
  const el = document.getElementById('filterRows');
  const cols = getCols();
  el.innerHTML = tempFilters.map((f,i) => {
    const colOpts = cols.map(c=>`<option value="${c.column_name}" ${c.column_name===f.column?'selected':''}>${c.column_name}</option>`).join('');
    const operators = ['=','!=','>','<','>=','<=','LIKE','IN','BETWEEN','IS NULL','IS NOT NULL'];
    const opOpts = operators.map(o=>`<option value="${o}" ${o===f.op?'selected':''}>${o}</option>`).join('');
    const logicOpts = ['AND','OR'].map(l=>`<option value="${l}" ${l===f.logic?'selected':''}>${l}</option>`).join('');
    const needsValue = !['IS NULL','IS NOT NULL'].includes(f.op);
    return `<div style="display:grid;grid-template-columns:60px 1fr 100px 1fr 28px;gap:5px;align-items:center;margin-bottom:5px">
      ${i>0?`<select class="form-select" style="font-size:.74rem" onchange="tempFilters[${i}].logic=this.value">${logicOpts}</select>`:'<span></span>'}
      <select class="form-select" style="font-size:.74rem" onchange="tempFilters[${i}].column=this.value">${colOpts}</select>
      <select class="form-select" style="font-size:.74rem" onchange="tempFilters[${i}].op=this.value;renderFilterRows()">${opOpts}</select>
      ${needsValue?`<input class="form-input" style="font-size:.74rem" value="${f.value}" onchange="tempFilters[${i}].value=this.value" placeholder="value">`:'<span></span>'}
      <button onclick="tempFilters.splice(${i},1);renderFilterRows()" style="color:var(--danger);font-size:1.1rem">&times;</button>
    </div>`;
  }).join('');
}
function addFilterRow() { tempFilters.push({column:getCols()[0]?.column_name||'',op:'=',value:'',logic:'AND'}); renderFilterRows(); }
function confirmFilter() {
  const conditions = tempFilters.filter(f=>f.op==='IS NULL'||f.op==='IS NOT NULL'||f.value);
  const config = { conditions };
  if (editingOpId) { const op = ops.find(o=>o.id===editingOpId); if(op) op.config = config; }
  else {
    const idx = ops.findIndex(o=>o.type==='filter');
    if (idx>=0) ops[idx].config = config;
    else ops.push({type:'filter',config,id:opIdSeq++});
  }
  closeModal('modalFilter');
  page=1; renderOps(); execQuery();
}

// -- Join Table
async function populateJoinModal(op) {
  const src = getSource();
  document.getElementById('joinLeftName').textContent = src||'-';
  const sel = document.getElementById('joinRightTable');
  sel.innerHTML = '<option value="">-- Choose --</option>' + allTables.map(t=>`<option value="${t.table_name}" ${op?.config?.table===t.table_name?'selected':''}>${t.table_name}</option>`).join('');
  // Left cols
  const leftCol = document.getElementById('joinLeftCol');
  leftCol.innerHTML = getCols().map(c=>`<option value="${c.column_name}" ${op?.config?.leftCol===c.column_name?'selected':''}>${c.column_name}</option>`).join('');
  // Set join type
  if (op?.config?.joinType) {
    document.querySelectorAll('.jt-btn').forEach(b=>{b.classList.toggle('sel',b.dataset.t===op.config.joinType);});
  } else {
    document.querySelectorAll('.jt-btn').forEach(b=>{b.classList.toggle('sel',b.dataset.t==='INNER');});
  }
  // Load right cols if editing
  if (op?.config?.table) {
    document.getElementById('joinRightName').textContent = op.config.table;
    await loadJoinCols(op);
  }
  // FK suggestions
  if (src && fkMap[src]) {
    const fks = fkMap[src];
    const sugDiv = document.getElementById('joinSuggestions');
    if (fks.length) {
      sugDiv.innerHTML = '<span>Suggested (FK):</span> ' + fks.map(fk=>`<button onclick="applySugJoin('${fk.column_name}','${fk.referenced_table}','${fk.referenced_column}')">${src}.${fk.column_name} → ${fk.referenced_table}.${fk.referenced_column}</button>`).join('');
    } else sugDiv.innerHTML = '';
  }
}
async function loadJoinCols(op) {
  const rt = document.getElementById('joinRightTable').value;
  document.getElementById('joinRightName').textContent = rt||'Select table';
  if (!rt) return;
  const r = await api(`/query-builder/tables/${rt}/columns`);
  const cols = r.data||[];
  const rightCol = document.getElementById('joinRightCol');
  rightCol.innerHTML = cols.map(c=>`<option value="${c.column_name}" ${op?.config?.rightCol===c.column_name?'selected':''}>${c.column_name}</option>`).join('');
  // Columns to add
  const addCols = op?.config?.addCols||[];
  document.getElementById('joinColsAdd').innerHTML = cols.map(c=>{
    const checked = !addCols.length||addCols.includes(c.column_name)?'checked':'';
    return `<label class="check-item"><input type="checkbox" value="${c.column_name}" ${checked}><span class="cname">${c.column_name}</span><span class="ctype">${c.data_type}</span></label>`;
  }).join('');
  // Auto-match
  if (!op) {
    const leftCols = getCols().map(c=>c.column_name);
    const match = cols.find(c=>leftCols.includes(c.column_name)&&(c.column_key==='PRI'||c.column_key==='MUL'));
    if (match) { rightCol.value=match.column_name; document.getElementById('joinLeftCol').value=match.column_name; }
  }
}
function selJoinType(btn) { document.querySelectorAll('.jt-btn').forEach(b=>b.classList.remove('sel')); btn.classList.add('sel'); }
function applySugJoin(lc,rt,rc) {
  document.getElementById('joinRightTable').value = rt;
  document.getElementById('joinRightName').textContent = rt;
  loadJoinCols().then(()=>{
    document.getElementById('joinLeftCol').value = lc;
    document.getElementById('joinRightCol').value = rc;
  });
}
function confirmJoin() {
  const table = document.getElementById('joinRightTable').value;
  const leftCol = document.getElementById('joinLeftCol').value;
  const rightCol = document.getElementById('joinRightCol').value;
  const joinType = document.querySelector('.jt-btn.sel')?.dataset.t||'INNER';
  const addCols = Array.from(document.querySelectorAll('#joinColsAdd input:checked')).map(c=>c.value);
  if (!table||!leftCol||!rightCol) { toast('Fill all join fields','err'); return; }
  const config = {table,leftCol,rightCol,joinType,addCols};
  if (editingOpId) { const op=ops.find(o=>o.id===editingOpId); if(op) op.config=config; }
  else ops.push({type:'join',config,id:opIdSeq++});
  closeModal('modalJoin');
  renderOps(); execQuery();
  toast(`${joinType} JOIN with ${table} applied`,'ok');
}

// -- Append (Union)
function populateAppendModal(op) {
  const sel = document.getElementById('appendTable');
  sel.innerHTML = '<option value="">-- Choose --</option>' + allTables.map(t=>`<option value="${t.table_name}" ${op?.config?.table===t.table_name?'selected':''}>${t.table_name}</option>`).join('');
  if (op?.config?.unionType) document.getElementById('appendType').value = op.config.unionType;
}
function confirmAppend() {
  const table = document.getElementById('appendTable').value;
  const unionType = document.getElementById('appendType').value;
  if (!table) { toast('Select a table','err'); return; }
  const config = {table,unionType};
  if (editingOpId) { const op=ops.find(o=>o.id===editingOpId); if(op) op.config=config; }
  else { const idx=ops.findIndex(o=>o.type==='append'); if(idx>=0) ops[idx].config=config; else ops.push({type:'append',config,id:opIdSeq++}); }
  closeModal('modalAppend');
  renderOps(); execQuery();
  toast(`${unionType} with ${table} applied`,'ok');
}

// -- Group & Summarize
let tempAggs = [];
function populateGroupModal(op) {
  const cols = getCols();
  const grpCols = op?.config?.groupCols||[];
  document.getElementById('grpColList').innerHTML = cols.map(c=>`<label class="check-item"><input type="checkbox" value="${c.column_name}" ${grpCols.includes(c.column_name)?'checked':''}><span class="cname">${c.column_name}</span><span class="ctype">${c.data_type}</span></label>`).join('');
  tempAggs = op?.config?.aggs ? JSON.parse(JSON.stringify(op.config.aggs)) : [{fn:'COUNT',column:'*',alias:''}];
  renderAggRows();
  document.getElementById('havingInput').value = op?.config?.having||'';
}
function renderAggRows() {
  const cols = getCols();
  const el = document.getElementById('aggRows');
  el.innerHTML = tempAggs.map((a,i) => {
    const fns = ['COUNT','SUM','AVG','MIN','MAX'];
    const colOpts = '<option value="*">*</option>' + cols.map(c=>`<option value="${c.column_name}" ${c.column_name===a.column?'selected':''}>${c.column_name}</option>`).join('');
    return `<div style="display:grid;grid-template-columns:90px 1fr 1fr 28px;gap:5px;margin-bottom:5px;align-items:center">
      <select class="form-select" style="font-size:.74rem" onchange="tempAggs[${i}].fn=this.value">${fns.map(f=>`<option ${f===a.fn?'selected':''}>${f}</option>`).join('')}</select>
      <select class="form-select" style="font-size:.74rem" onchange="tempAggs[${i}].column=this.value">${colOpts}</select>
      <input class="form-input" style="font-size:.74rem" value="${a.alias}" onchange="tempAggs[${i}].alias=this.value" placeholder="alias">
      <button onclick="tempAggs.splice(${i},1);renderAggRows()" style="color:var(--danger);font-size:1.1rem">&times;</button>
    </div>`;
  }).join('');
}
function addAggRow() { tempAggs.push({fn:'COUNT',column:'*',alias:''}); renderAggRows(); }
function confirmGroup() {
  const groupCols = Array.from(document.querySelectorAll('#grpColList input:checked')).map(c=>c.value);
  const aggs = tempAggs.filter(a=>a.fn&&a.column);
  const having = document.getElementById('havingInput').value.trim();
  const config = { groupCols, aggs, having };
  if (editingOpId) { const op=ops.find(o=>o.id===editingOpId); if(op) op.config=config; }
  else { const idx=ops.findIndex(o=>o.type==='group'); if(idx>=0) ops[idx].config=config; else ops.push({type:'group',config,id:opIdSeq++}); }
  closeModal('modalGroup');
  renderOps(); execQuery();
}

// -- Computed Column
function populateComputedModal(op) {
  document.getElementById('compName').value = op?.config?.name||'';
  document.getElementById('compExpr').value = op?.config?.expr||'';
}
function insExpr(text) { const el=document.getElementById('compExpr'); el.value += text; el.focus(); }
function confirmComputed() {
  const name = document.getElementById('compName').value.trim();
  const expr = document.getElementById('compExpr').value.trim();
  if (!name||!expr) { toast('Fill in name and expression','err'); return; }
  const config = {name,expr};
  if (editingOpId) { const op=ops.find(o=>o.id===editingOpId); if(op) op.config=config; }
  else ops.push({type:'computed',config,id:opIdSeq++});
  closeModal('modalComputed');
  renderOps(); execQuery();
}

// -- Sort
let tempSorts = [];
function populateSortModal(op) {
  tempSorts = op?.config?.sorts ? JSON.parse(JSON.stringify(op.config.sorts)) : [{column:getCols()[0]?.column_name||'',dir:'ASC'}];
  renderSortRows();
}
function renderSortRows() {
  const cols = getCols();
  const el = document.getElementById('sortRows');
  el.innerHTML = tempSorts.map((s,i) => {
    const colOpts = cols.map(c=>`<option value="${c.column_name}" ${c.column_name===s.column?'selected':''}>${c.column_name}</option>`).join('');
    return `<div style="display:grid;grid-template-columns:1fr 100px 28px;gap:5px;margin-bottom:5px;align-items:center">
      <select class="form-select" style="font-size:.74rem" onchange="tempSorts[${i}].column=this.value">${colOpts}</select>
      <select class="form-select" style="font-size:.74rem" onchange="tempSorts[${i}].dir=this.value">
        <option value="ASC" ${s.dir==='ASC'?'selected':''}>ASC ↑</option>
        <option value="DESC" ${s.dir==='DESC'?'selected':''}>DESC ↓</option>
      </select>
      <button onclick="tempSorts.splice(${i},1);renderSortRows()" style="color:var(--danger);font-size:1.1rem">&times;</button>
    </div>`;
  }).join('');
}
function addSortRow() { tempSorts.push({column:getCols()[0]?.column_name||'',dir:'ASC'}); renderSortRows(); }
function confirmSort() {
  const sorts = tempSorts.filter(s=>s.column);
  const config = {sorts};
  if (editingOpId) { const op=ops.find(o=>o.id===editingOpId); if(op) op.config=config; }
  else { const idx=ops.findIndex(o=>o.type==='sort'); if(idx>=0) ops[idx].config=config; else ops.push({type:'sort',config,id:opIdSeq++}); }
  closeModal('modalSort');
  renderOps(); execQuery();
}

// -- Limit
function confirmLimit() {
  const lim = parseInt(document.getElementById('limitVal').value)||50;
  const config = {limit:lim};
  if (editingOpId) { const op=ops.find(o=>o.id===editingOpId); if(op) op.config=config; }
  else { const idx=ops.findIndex(o=>o.type==='limit'); if(idx>=0) ops[idx].config=config; else ops.push({type:'limit',config,id:opIdSeq++}); }
  closeModal('modalLimit');
  limit = lim; page=1;
  renderOps(); execQuery();
}

// -- Custom SQL
const TEMPLATES = {
  students: `SELECT s.student_code, u.full_name, u.email, p.name AS program, d.name AS department, s.batch_year, s.section\nFROM students s\nJOIN users u ON s.user_id = u.user_id\nJOIN programs p ON s.program_id = p.program_id\nJOIN departments d ON p.dept_id = d.dept_id\nORDER BY s.student_code\nLIMIT 50;`,
  results: `SELECT s.student_code, u.full_name, c.course_code, c.title, r.total_mark, r.grade_code, g.grade_point, sem.name AS semester\nFROM results r\nJOIN enrollments e ON r.enrollment_id = e.enrollment_id\nJOIN students s ON e.student_id = s.student_id\nJOIN users u ON s.user_id = u.user_id\nJOIN course_offerings co ON e.offering_id = co.offering_id\nJOIN courses c ON co.course_id = c.course_id\nJOIN semesters sem ON co.semester_id = sem.semester_id\nLEFT JOIN grade_scale g ON r.grade_code = g.grade_code\nLIMIT 50;`,
  attendance: `SELECT * FROM vw_attendance_summary LIMIT 50;`,
  finance: `SELECT s.student_code, u.full_name, si.invoice_no, si.status, si.due_date, SUM(ii.amount) AS total\nFROM student_invoices si\nJOIN students s ON si.student_id = s.student_id\nJOIN users u ON s.user_id = u.user_id\nLEFT JOIN invoice_items ii ON si.invoice_id = ii.invoice_id\nGROUP BY si.invoice_id\nLIMIT 50;`,
  enrollment: `SELECT e.enrollment_id, s.student_code, u.full_name, c.course_code, c.title, sem.name AS semester, co.section, e.status\nFROM enrollments e\nJOIN students s ON e.student_id = s.student_id\nJOIN users u ON s.user_id = u.user_id\nJOIN course_offerings co ON e.offering_id = co.offering_id\nJOIN courses c ON co.course_id = c.course_id\nJOIN semesters sem ON co.semester_id = sem.semester_id\nLIMIT 50;`
};
function setTpl(name) { document.getElementById('customSqlInput').value = TEMPLATES[name]||''; }
function confirmCustom() {
  const sql = document.getElementById('customSqlInput').value.trim();
  if (!sql) { toast('Enter a SQL query','err'); return; }
  // Replace all ops with just custom
  ops = [{type:'custom',config:{sql},id:opIdSeq++}];
  document.getElementById('topTitle').textContent = 'Custom SQL Query';
  closeModal('modalCustom');
  renderOps(); execQuery();
}

// ==============================================================
// SAVE / LOAD QUERIES
// ==============================================================
async function saveQuery() {
  const title = document.getElementById('qTitle').value.trim()||'Untitled Query';
  const opsData = ops.map(o=>({op_type:o.type,op_config:o.config}));
  try {
    if (savedQueryId) {
      await api(`/query-builder/saved/${savedQueryId}`,{method:'PUT',body:JSON.stringify({title,operations:opsData})});
      toast('Query saved','ok');
    } else {
      const r = await api('/query-builder/saved',{method:'POST',body:JSON.stringify({title,operations:opsData})});
      if (r.success) { savedQueryId = r.data.query_id; toast('Query saved','ok'); }
      else toast(r.message||'Save failed','err');
    }
  } catch(e) { toast('Save error: '+e.message,'err'); }
}

async function saveQueryAs() {
  const title = prompt('Enter query title:', document.getElementById('qTitle').value);
  if (!title) return;
  document.getElementById('qTitle').value = title;
  savedQueryId = null; // Force new save
  saveQuery();
}

// ==============================================================
// EXPLAIN
// ==============================================================
async function runExplain() {
  const sql = buildSql();
  if (!sql) { toast('No query to explain','err'); return; }
  try {
    const r = await api('/query-builder/explain',{method:'POST',body:JSON.stringify({sql})});
    if (r.success) {
      resultData = r.data.plan||[];
      resultMeta = {rowCount:resultData.length,executionTime:r.data.executionTime};
      colMeta = {}; // EXPLAIN has its own columns
      renderGrid();
      document.getElementById('topTitle').textContent = 'EXPLAIN — Execution Plan';
      document.getElementById('topStatus').style.display='flex';
      document.getElementById('topStatusText').textContent = `Explained in ${r.data.executionTime}`;
      toast('Execution plan loaded','inf');
    } else toast(r.message,'err');
  } catch(e) { toast('Explain error: '+e.message,'err'); }
}

// ==============================================================
// EXPORT CSV
// ==============================================================
async function exportCsv() {
  const sql = buildSql();
  if (!sql) { toast('No query to export','err'); return; }
  try {
    const r = await fetch(`${API}/query-builder/export-csv`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({sql})});
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'export.csv'; a.click();
    URL.revokeObjectURL(url);
    toast('CSV downloaded','ok');
  } catch(e) { toast('Export error','err'); }
}

// ==============================================================
// DBMS THEORY DEMOS
// ==============================================================
function runTheory(demo) {
  const demos = {
    '3nf': {title:'3NF Normalization — Table Structure',sql:`SELECT t.TABLE_NAME, c.COLUMN_NAME, c.DATA_TYPE, c.COLUMN_KEY, c.IS_NULLABLE, c.EXTRA, kcu.REFERENCED_TABLE_NAME AS fk_references\nFROM INFORMATION_SCHEMA.TABLES t\nJOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME AND t.TABLE_SCHEMA = c.TABLE_SCHEMA\nLEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON c.TABLE_NAME = kcu.TABLE_NAME AND c.COLUMN_NAME = kcu.COLUMN_NAME AND c.TABLE_SCHEMA = kcu.TABLE_SCHEMA AND kcu.REFERENCED_TABLE_NAME IS NOT NULL\nWHERE t.TABLE_SCHEMA = 'student_portal' AND t.TABLE_TYPE = 'BASE TABLE'\nORDER BY t.TABLE_NAME, c.ORDINAL_POSITION`},
    'acid': {title:'ACID Transactions — Stored Procedures',sql:`SELECT ROUTINE_NAME AS procedure_name, ROUTINE_TYPE AS type, ROUTINE_COMMENT AS comment, CREATED AS created_at, LAST_ALTERED AS last_modified, ROUTINE_DEFINITION AS definition\nFROM INFORMATION_SCHEMA.ROUTINES\nWHERE ROUTINE_SCHEMA = 'student_portal' AND ROUTINE_TYPE = 'PROCEDURE'\nORDER BY ROUTINE_NAME`},
    'referential': {title:'Referential Integrity — Foreign Keys',sql:`SELECT tc.TABLE_NAME, kcu.COLUMN_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME, rc.UPDATE_RULE AS on_update, rc.DELETE_RULE AS on_delete, tc.CONSTRAINT_NAME\nFROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc\nJOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA\nJOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc ON tc.CONSTRAINT_NAME = rc.CONSTRAINT_NAME AND tc.TABLE_SCHEMA = rc.CONSTRAINT_SCHEMA\nWHERE tc.TABLE_SCHEMA = 'student_portal' AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'\nORDER BY tc.TABLE_NAME`},
    'triggers': {title:'Triggers & Audit',sql:`SELECT TRIGGER_NAME AS name, EVENT_OBJECT_TABLE AS table_name, ACTION_TIMING AS timing, EVENT_MANIPULATION AS event, ACTION_STATEMENT AS trigger_body, CREATED\nFROM INFORMATION_SCHEMA.TRIGGERS\nWHERE TRIGGER_SCHEMA = 'student_portal'\nORDER BY EVENT_OBJECT_TABLE`},
    'views': {title:'Views — Virtual Tables',sql:`SELECT TABLE_NAME AS view_name, VIEW_DEFINITION AS definition, CHECK_OPTION, IS_UPDATABLE\nFROM INFORMATION_SCHEMA.VIEWS\nWHERE TABLE_SCHEMA = 'student_portal'\nORDER BY TABLE_NAME`},
    'indexing': {title:'Indexing & EXPLAIN',sql:`SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX, NON_UNIQUE, INDEX_TYPE, CARDINALITY, NULLABLE\nFROM INFORMATION_SCHEMA.STATISTICS\nWHERE TABLE_SCHEMA = 'student_portal'\nORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX`},
    'ledger': {title:'Blockchain Ledger — Immutable Hash Chain',sql:`SELECT event_id, event_time, actor_user_id, event_type, entity_type, entity_id, LEFT(CAST(payload AS CHAR), 80) AS payload_preview, LEFT(prev_hash, 16) AS prev_hash_short, LEFT(curr_hash, 16) AS curr_hash_short, CASE WHEN LAG(curr_hash) OVER (ORDER BY event_id) = prev_hash THEN 'VALID' WHEN event_id = (SELECT MIN(event_id) FROM ledger_events) THEN 'GENESIS' ELSE 'BROKEN' END AS chain_status\nFROM ledger_events\nORDER BY event_id\nLIMIT 100`},
    'rbac': {title:'RBAC — Role-Based Access Control',sql:`SELECT u.user_id, u.email, u.full_name, u.status, GROUP_CONCAT(DISTINCT r.role_name ORDER BY r.role_name) AS roles, GROUP_CONCAT(DISTINCT p.perm_code ORDER BY p.perm_code) AS permissions\nFROM users u\nLEFT JOIN user_roles ur ON u.user_id = ur.user_id\nLEFT JOIN roles r ON ur.role_id = r.role_id\nLEFT JOIN role_permissions rp ON r.role_id = rp.role_id\nLEFT JOIN permissions p ON rp.perm_id = p.perm_id\nGROUP BY u.user_id, u.email, u.full_name, u.status\nORDER BY u.user_id`}
  };
  const d = demos[demo];
  if (!d) return;
  ops = [{type:'custom',config:{sql:d.sql},id:opIdSeq++}];
  document.getElementById('qTitle').value = d.title;
  document.getElementById('topTitle').textContent = d.title;
  const bar = document.getElementById('sqlBar');
  if (!bar.classList.contains('open')) bar.classList.add('open');
  renderOps(); execQuery();
}

// ==============================================================
// HELPERS
// ==============================================================
function showLoading(show) {
  document.getElementById('loadingState').style.display = show?'flex':'none';
  if (show) { document.getElementById('dataGrid').style.display='none'; document.getElementById('emptyState').style.display='none'; }
}
function showError(msg) {
  document.getElementById('dataGrid').style.display='none';
  const el = document.getElementById('emptyState');
  el.style.display='flex';
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><h3>Query Error</h3><p style="color:var(--danger)">${esc(msg)}</p>`;
}
function setStatus(type, text, count) {
  document.getElementById('stDot').style.background = type==='ok'?'var(--success)':type==='err'?'var(--danger)':'var(--txt3)';
  document.getElementById('stText').textContent = text;
  document.getElementById('stTime').textContent = resultMeta.executionTime||'-';
}
function esc(s) { const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
function toast(msg, type='inf') {
  const box = document.getElementById('toastBox');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(()=>t.remove(), 3500);
}

// ==============================================================
// INIT
// ==============================================================
auth();
