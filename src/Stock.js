import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

function Stock({ user, couleur, T, sombre }) {
  const [onglet, setOnglet] = useState('apercu');
  const [produits, setProduits] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [scanMode, setScanMode] = useState(false);

  const [nomProd, setNomProd] = useState('');
  const [prixProd, setPrixProd] = useState('');
  const [stockProd, setStockProd] = useState('');
  const [stockMin, setStockMin] = useState('5');
  const [stockMax, setStockMax] = useState('100');
  const [categorieProd, setCategorieProd] = useState('Général');
  const [uniteProd, setUniteProd] = useState('unité');
  const [codeBarreProd, setCodeBarreProd] = useState('');
  const [fournisseurProd, setFournisseurProd] = useState('');
  const [editProd, setEditProd] = useState(null);

  const [nomFourn, setNomFourn] = useState('');
  const [telFourn, setTelFourn] = useState('');
  const [emailFourn, setEmailFourn] = useState('');

  const [mvtProduit, setMvtProduit] = useState('');
  const [mvtType, setMvtType] = useState('entree');
  const [mvtQte, setMvtQte] = useState('');
  const [mvtRaison, setMvtRaison] = useState('');
  const [mvtLot, setMvtLot] = useState('');

  const [lotProduit, setLotProduit] = useState('');
  const [lotNumero, setLotNumero] = useState('');
  const [lotQte, setLotQte] = useState('');
  const [lotExpiration, setLotExpiration] = useState('');

  const [recherche, setRecherche] = useState('');

  const categories = ['Général', 'Alimentation', 'Boissons', 'Vêtements', 'Électronique', 'Pharmacie', 'Autre'];
  const unites = ['unité', 'kg', 'g', 'litre', 'ml', 'boîte', 'sac', 'carton', 'pièce'];

  const charger = useCallback(async () => {
    setLoading(true);
    const [p, f, m, l] = await Promise.all([
      supabase.from('produits').select('*').eq('user_id', user.id).order('nom'),
      supabase.from('fournisseurs').select('*').eq('user_id', user.id).order('nom'),
      supabase.from('mouvements_stock').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('lots').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    if (p.data) setProduits(p.data);
    if (f.data) setFournisseurs(f.data);
    if (m.data) setMouvements(m.data);
    if (l.data) setLots(l.data);
    setLoading(false);
  }, [user.id]);

  useEffect(() => { charger(); }, [charger]);

  async function ajouterProduit() {
    if (!nomProd || !prixProd) return;
    const payload = { nom: nomProd, prix: parseInt(prixProd), stock: parseInt(stockProd) || 0, stock_min: parseInt(stockMin) || 5, stock_max: parseInt(stockMax) || 100, categorie: categorieProd, unite: uniteProd, code_barre: codeBarreProd, fournisseur_id: fournisseurProd || null, user_id: user.id };
    if (editProd) {
      await supabase.from('produits').update(payload).eq('id', editProd);
      setProduits(produits.map(p => p.id === editProd ? { ...p, ...payload } : p));
      setEditProd(null);
    } else {
      const { data } = await supabase.from('produits').insert([payload]).select();
      if (data) {
        setProduits([...produits, data[0]]);
        if (parseInt(stockProd) > 0) {
          await supabase.from('mouvements_stock').insert([{ produit_id: data[0].id, type: 'entree', quantite: parseInt(stockProd), raison: 'Stock initial', user_id: user.id }]);
        }
      }
    }
    setNomProd(''); setPrixProd(''); setStockProd(''); setStockMin('5'); setStockMax('100');
    setCategorieProd('Général'); setUniteProd('unité'); setCodeBarreProd(''); setFournisseurProd('');
  }

  async function supprimerProduit(id) {
    await supabase.from('produits').delete().eq('id', id);
    setProduits(produits.filter(p => p.id !== id));
    setDetail(null);
  }

  async function ajouterFournisseur() {
    if (!nomFourn) return;
    const { data } = await supabase.from('fournisseurs').insert([{ nom: nomFourn, telephone: telFourn, email: emailFourn, user_id: user.id }]).select();
    if (data) setFournisseurs([...fournisseurs, data[0]]);
    setNomFourn(''); setTelFourn(''); setEmailFourn('');
  }

  async function enregistrerMouvement() {
    if (!mvtProduit || !mvtQte) return;
    const qte = parseInt(mvtQte);
    const produit = produits.find(p => p.id === mvtProduit);
    if (!produit) return;
    const nouveauStock = mvtType === 'entree' ? produit.stock + qte : Math.max(0, produit.stock - qte);
    await supabase.from('produits').update({ stock: nouveauStock }).eq('id', mvtProduit);
    await supabase.from('mouvements_stock').insert([{ produit_id: mvtProduit, type: mvtType, quantite: qte, raison: mvtRaison, lot: mvtLot, user_id: user.id }]);
    setProduits(produits.map(p => p.id === mvtProduit ? { ...p, stock: nouveauStock } : p));
    await charger();
    setMvtProduit(''); setMvtQte(''); setMvtRaison(''); setMvtLot('');
  }

  async function ajouterLot() {
    if (!lotProduit || !lotNumero || !lotQte) return;
    const { data } = await supabase.from('lots').insert([{ produit_id: lotProduit, numero_lot: lotNumero, quantite: parseInt(lotQte), date_expiration: lotExpiration || null, user_id: user.id }]).select();
    if (data) {
      setLots([data[0], ...lots]);
      await enregistrerEntreeLot(lotProduit, parseInt(lotQte), lotNumero);
    }
    setLotProduit(''); setLotNumero(''); setLotQte(''); setLotExpiration('');
  }

  async function enregistrerEntreeLot(produitId, qte, lot) {
    const produit = produits.find(p => p.id === produitId);
    if (!produit) return;
    const nouveauStock = produit.stock + qte;
    await supabase.from('produits').update({ stock: nouveauStock }).eq('id', produitId);
    await supabase.from('mouvements_stock').insert([{ produit_id: produitId, type: 'entree', quantite: qte, raison: 'Réception lot', lot, user_id: user.id }]);
    setProduits(produits.map(p => p.id === produitId ? { ...p, stock: nouveauStock } : p));
  }

  const produitsAlerte = produits.filter(p => p.stock <= (p.stock_min || 5));
  const stockTotal = produits.reduce((a, p) => a + (p.stock || 0), 0);
  const valeurTotale = produits.reduce((a, p) => a + ((p.stock || 0) * (p.prix || 0)), 0);
  const produitsFiltres = produits.filter(p => p.nom.toLowerCase().includes(recherche.toLowerCase()) || (p.code_barre || '').includes(recherche) || (p.categorie || '').toLowerCase().includes(recherche.toLowerCase()));

  const vitesseEcoulement = (produitId) => {
    const mvts = mouvements.filter(m => m.produit_id === produitId && m.type === 'sortie');
    if (mvts.length === 0) return 0;
    const total = mvts.reduce((a, m) => a + m.quantite, 0);
    return Math.round(total / 30);
  };

  const joursRestants = (produit) => {
    const vitesse = vitesseEcoulement(produit.id);
    if (vitesse === 0) return null;
    return Math.round(produit.stock / vitesse);
  };

  const s = {
    card: { background: T.card, borderRadius: '14px', padding: '14px 16px', border: `1px solid ${T.border}`, marginBottom: '10px' },
    input: { flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${T.inputBorder}`, fontSize: '13px', minWidth: '80px', background: T.input, color: T.text, outline: 'none' },
    btn: (bg) => ({ padding: '10px 18px', background: bg || couleur, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }),
    btnSm: (bg, col) => ({ padding: '5px 12px', background: bg, color: col, border: 'none', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }),
    row: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' },
    tab: (active) => ({ padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: active ? '600' : '400', background: active ? couleur : sombre ? '#222' : '#eee', color: active ? '#fff' : T.textSec }),
    sectionTitle: { fontSize: '14px', fontWeight: '700', margin: '16px 0 10px', color: T.text },
    label: { fontSize: '11px', color: T.textSec, marginBottom: '4px' },
  };

  const onglets = [
    { id: 'apercu', label: '📊 Aperçu' },
    { id: 'produits', label: '📦 Produits' },
    { id: 'mouvements', label: '🔄 Mouvements' },
    { id: 'lots', label: '🏷️ Lots' },
    { id: 'fournisseurs', label: '🤝 Fournisseurs' },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: T.textSec }}>Chargement...</div>;

  return (
    <div style={{ padding: '16px 16px 90px', background: T.bg, minHeight: '100vh' }}>

      {/* ONGLETS */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '4px' }}>
        {onglets.map(o => (
          <button key={o.id} style={{ ...s.tab(onglet === o.id), whiteSpace: 'nowrap' }} onClick={() => setOnglet(o.id)}>{o.label}</button>
        ))}
      </div>

      {/* APERCU */}
      {onglet === 'apercu' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Produits', val: produits.length, sub: 'références', color: T.text },
              { label: 'Stock total', val: stockTotal, sub: 'unités', color: T.text },
              { label: 'Valeur stock', val: valeurTotale.toLocaleString() + ' F', sub: 'FCFA', color: couleur },
              { label: 'Alertes', val: produitsAlerte.length, sub: 'ruptures imminentes', color: produitsAlerte.length > 0 ? '#DC2626' : '#16A34A' },
            ].map(m => (
              <div key={m.label} style={{ ...s.card, textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: T.textSec }}>{m.label}</p>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: m.color }}>{m.val}</p>
                <p style={{ margin: 0, fontSize: '11px', color: T.textSec }}>{m.sub}</p>
              </div>
            ))}
          </div>

          {produitsAlerte.length > 0 && (
            <>
              <p style={s.sectionTitle}>⚠️ Alertes réapprovisionnement</p>
              {produitsAlerte.map(p => {
                const jours = joursRestants(p);
                const vitesse = vitesseEcoulement(p.id);
                const qteRecommandee = Math.max(p.stock_max || 100, (vitesse * 30));
                return (
                  <div key={p.id} style={{ ...s.card, borderLeft: '3px solid #DC2626' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: T.text }}>{p.nom}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: T.textSec }}>{p.categorie || 'Général'} · {p.unite || 'unité'}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: '800', color: '#DC2626' }}>{p.stock}</p>
                        <p style={{ margin: 0, fontSize: '10px', color: T.textSec }}>restant / min {p.stock_min || 5}</p>
                      </div>
                    </div>
                    {vitesse > 0 && (
                      <div style={{ background: sombre ? '#222' : '#FFF5F5', borderRadius: '8px', padding: '8px 12px', marginBottom: '8px' }}>
                        <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#DC2626', fontWeight: '600' }}>
                          🔮 Rupture dans ~{jours} jour{jours > 1 ? 's' : ''}
                        </p>
                        <p style={{ margin: 0, fontSize: '11px', color: T.textSec }}>
                          Vitesse : {vitesse} {p.unite || 'unité'}/jour · Commander ~{qteRecommandee} unités
                        </p>
                      </div>
                    )}
                    <div style={{ height: '6px', background: sombre ? '#333' : '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (p.stock / (p.stock_max || 100)) * 100)}%`, background: p.stock <= (p.stock_min || 5) ? '#DC2626' : '#EF9F27', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </>
          )}

          <p style={s.sectionTitle}>📈 Vue d'ensemble par catégorie</p>
          {[...new Set(produits.map(p => p.categorie || 'Général'))].map(cat => {
            const prods = produits.filter(p => (p.categorie || 'Général') === cat);
            const stockCat = prods.reduce((a, p) => a + p.stock, 0);
            const valeurCat = prods.reduce((a, p) => a + p.stock * p.prix, 0);
            const alertesCat = prods.filter(p => p.stock <= (p.stock_min || 5)).length;
            return (
              <div key={cat} style={{ ...s.card, borderLeft: alertesCat > 0 ? '3px solid #DC2626' : `3px solid ${couleur}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: T.text }}>{cat}</p>
                  {alertesCat > 0 && <span style={{ fontSize: '11px', background: '#FCEBEB', color: '#791F1F', padding: '2px 8px', borderRadius: '999px' }}>⚠️ {alertesCat} alerte(s)</span>}
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div><p style={{ margin: 0, fontSize: '11px', color: T.textSec }}>Références</p><p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: T.text }}>{prods.length}</p></div>
                  <div><p style={{ margin: 0, fontSize: '11px', color: T.textSec }}>Unités</p><p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: T.text }}>{stockCat}</p></div>
                  <div><p style={{ margin: 0, fontSize: '11px', color: T.textSec }}>Valeur</p><p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: couleur }}>{valeurCat.toLocaleString()} F</p></div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* PRODUITS */}
      {onglet === 'produits' && (
        <>
          <div style={s.card}>
            <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px', color: T.text }}>{editProd ? '✏️ Modifier' : '+ Nouveau produit'}</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Nom produit *" value={nomProd} onChange={e => setNomProd(e.target.value)} />
              <input style={s.input} placeholder="Prix FCFA *" type="number" value={prixProd} onChange={e => setPrixProd(e.target.value)} />
            </div>
            <div style={s.row}>
              <input style={{ ...s.input, maxWidth: '90px' }} placeholder="Stock" type="number" value={stockProd} onChange={e => setStockProd(e.target.value)} />
              <input style={{ ...s.input, maxWidth: '80px' }} placeholder="Min" type="number" value={stockMin} onChange={e => setStockMin(e.target.value)} />
              <input style={{ ...s.input, maxWidth: '80px' }} placeholder="Max" type="number" value={stockMax} onChange={e => setStockMax(e.target.value)} />
            </div>
            <div style={s.row}>
              <select style={{ ...s.input, flex: 1 }} value={categorieProd} onChange={e => setCategorieProd(e.target.value)}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <select style={{ ...s.input, flex: 1 }} value={uniteProd} onChange={e => setUniteProd(e.target.value)}>
                {unites.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div style={s.row}>
              <input style={s.input} placeholder="Code barre (optionnel)" value={codeBarreProd} onChange={e => setCodeBarreProd(e.target.value)} />
              <select style={{ ...s.input, flex: 1 }} value={fournisseurProd} onChange={e => setFournisseurProd(e.target.value)}>
                <option value="">Fournisseur</option>
                {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
            <div style={s.row}>
              <button style={s.btn()} onClick={ajouterProduit}>{editProd ? 'Enregistrer' : 'Ajouter'}</button>
              {editProd && <button style={s.btn('#888')} onClick={() => { setEditProd(null); setNomProd(''); setPrixProd(''); setStockProd(''); }}>Annuler</button>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input style={{ ...s.input, flex: 1 }} placeholder="🔍 Rechercher par nom, code barre, catégorie..." value={recherche} onChange={e => setRecherche(e.target.value)} />
            <button style={{ ...s.btnSm(sombre ? '#222' : '#eee', T.textSec), padding: '10px 14px' }} onClick={() => setScanMode(!scanMode)}>📷</button>
          </div>

          {scanMode && (
            <div style={{ ...s.card, textAlign: 'center', padding: '20px', marginBottom: '12px' }}>
              <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📷</p>
              <p style={{ fontSize: '13px', color: T.textSec, margin: '0 0 12px' }}>Mode scan activé — entrez le code barre manuellement</p>
              <input style={{ ...s.input, width: '100%', textAlign: 'center' }} placeholder="Code barre..." autoFocus onKeyDown={e => { if (e.key === 'Enter') { setRecherche(e.target.value); setScanMode(false); }}} />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: T.text }}>Catalogue ({produitsFiltres.length})</p>
            <span style={{ fontSize: '12px', color: couleur, fontWeight: '600' }}>Valeur : {produitsFiltres.reduce((a, p) => a + p.stock * p.prix, 0).toLocaleString()} FCFA</span>
          </div>

          {produitsFiltres.length === 0 && <div style={{ ...s.card, textAlign: 'center', padding: '40px' }}><p style={{ fontSize: '13px', color: T.textSec }}>Aucun produit trouvé</p></div>}
          {produitsFiltres.map(p => {
            const jours = joursRestants(p);
            const pct = Math.min(100, (p.stock / (p.stock_max || 100)) * 100);
            const alerte = p.stock <= (p.stock_min || 5);
            const fourn = fournisseurs.find(f => f.id === p.fournisseur_id);
            return (
              <div key={p.id} onClick={() => setDetail(p)} style={{ ...s.card, cursor: 'pointer', borderLeft: alerte ? '3px solid #DC2626' : `3px solid ${couleur}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: T.text }}>{p.nom}</p>
                      {p.code_barre && <span style={{ fontSize: '10px', background: sombre ? '#333' : '#f0f0f0', color: T.textSec, padding: '1px 6px', borderRadius: '4px' }}>#{p.code_barre}</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: T.textSec }}>{p.categorie || 'Général'} · {p.prix.toLocaleString()} FCFA/{p.unite || 'unité'}</p>
                    {fourn && <p style={{ margin: '2px 0 0', fontSize: '11px', color: T.textSec }}>🤝 {fourn.nom}</p>}
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '60px' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '800', color: alerte ? '#DC2626' : T.text }}>{p.stock}</p>
                    <p style={{ margin: 0, fontSize: '10px', color: T.textSec }}>{p.unite || 'unité'}</p>
                  </div>
                </div>
                <div style={{ height: '5px', background: sombre ? '#333' : '#eee', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: alerte ? '#DC2626' : pct < 50 ? '#EF9F27' : couleur, borderRadius: '3px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: T.textSec }}>Valeur : {(p.stock * p.prix).toLocaleString()} FCFA</span>
                  {jours !== null && <span style={{ fontSize: '11px', color: alerte ? '#DC2626' : '#EF9F27', fontWeight: '600' }}>🔮 ~{jours}j restants</span>}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* MOUVEMENTS */}
      {onglet === 'mouvements' && (
        <>
          <div style={s.card}>
            <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px', color: T.text }}>📝 Enregistrer un mouvement</p>
            <div style={s.row}>
              <select style={{ ...s.input, flex: 1 }} value={mvtProduit} onChange={e => setMvtProduit(e.target.value)}>
                <option value="">Sélectionner un produit</option>
                {produits.map(p => <option key={p.id} value={p.id}>{p.nom} (stock: {p.stock})</option>)}
              </select>
            </div>
            <div style={s.row}>
              <select style={{ ...s.input, maxWidth: '120px' }} value={mvtType} onChange={e => setMvtType(e.target.value)}>
                <option value="entree">📥 Entrée</option>
                <option value="sortie">📤 Sortie</option>
                <option value="ajustement">⚖️ Ajustement</option>
                <option value="perte">🗑️ Perte</option>
                <option value="retour">↩️ Retour</option>
              </select>
              <input style={{ ...s.input, maxWidth: '100px' }} placeholder="Quantité" type="number" value={mvtQte} onChange={e => setMvtQte(e.target.value)} />
            </div>
            <div style={s.row}>
              <input style={s.input} placeholder="Raison (ex: Vente, Achat...)" value={mvtRaison} onChange={e => setMvtRaison(e.target.value)} />
              <input style={{ ...s.input, maxWidth: '120px' }} placeholder="N° Lot (opt.)" value={mvtLot} onChange={e => setMvtLot(e.target.value)} />
            </div>
            <div style={s.row}>
              <button style={s.btn()} onClick={enregistrerMouvement}>Enregistrer</button>
            </div>
          </div>

          <p style={{ fontSize: '14px', fontWeight: '700', margin: '16px 0 10px', color: T.text }}>Historique des mouvements</p>
          {mouvements.length === 0 && <div style={{ ...s.card, textAlign: 'center', padding: '30px' }}><p style={{ fontSize: '13px', color: T.textSec }}>Aucun mouvement enregistré</p></div>}
          {mouvements.map(m => {
            const prod = produits.find(p => p.id === m.produit_id);
            const icons = { entree: '📥', sortie: '📤', ajustement: '⚖️', perte: '🗑️', retour: '↩️' };
            const colors = { entree: '#16A34A', sortie: '#DC2626', ajustement: '#EF9F27', perte: '#DC2626', retour: '#2563EB' };
            return (
              <div key={m.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px' }}>{icons[m.type] || '📦'}</span>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: T.text }}>{prod ? prod.nom : 'Produit supprimé'}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: T.textSec }}>{m.raison || m.type} {m.lot ? `· Lot ${m.lot}` : ''}</p>
                    <p style={{ margin: 0, fontSize: '10px', color: T.textSec }}>{new Date(m.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: colors[m.type] || T.text }}>
                  {m.type === 'entree' || m.type === 'retour' ? '+' : '-'}{m.quantite}
                </p>
              </div>
            );
          })}
        </>
      )}

      {/* LOTS */}
      {onglet === 'lots' && (
        <>
          <div style={s.card}>
            <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px', color: T.text }}>🏷️ Nouveau lot</p>
            <div style={s.row}>
              <select style={{ ...s.input, flex: 1 }} value={lotProduit} onChange={e => setLotProduit(e.target.value)}>
                <option value="">Sélectionner un produit</option>
                {produits.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </div>
            <div style={s.row}>
              <input style={s.input} placeholder="N° de lot *" value={lotNumero} onChange={e => setLotNumero(e.target.value)} />
              <input style={{ ...s.input, maxWidth: '100px' }} placeholder="Quantité *" type="number" value={lotQte} onChange={e => setLotQte(e.target.value)} />
            </div>
            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <p style={s.label}>Date d'expiration (optionnel)</p>
                <input style={{ ...s.input, width: '100%' }} type="date" value={lotExpiration} onChange={e => setLotExpiration(e.target.value)} />
              </div>
            </div>
            <div style={s.row}>
              <button style={s.btn()} onClick={ajouterLot}>Créer le lot</button>
            </div>
          </div>

          <p style={{ fontSize: '14px', fontWeight: '700', margin: '16px 0 10px', color: T.text }}>Lots enregistrés</p>
          {lots.length === 0 && <div style={{ ...s.card, textAlign: 'center', padding: '30px' }}><p style={{ fontSize: '13px', color: T.textSec }}>Aucun lot enregistré</p></div>}
          {lots.map(l => {
            const prod = produits.find(p => p.id === l.produit_id);
            const expire = l.date_expiration ? new Date(l.date_expiration) : null;
            const joursExpiration = expire ? Math.round((expire - new Date()) / (1000 * 60 * 60 * 24)) : null;
            const expirationAlerte = joursExpiration !== null && joursExpiration < 30;
            return (
              <div key={l.id} style={{ ...s.card, borderLeft: expirationAlerte ? '3px solid #EF9F27' : `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: T.text }}>Lot {l.numero_lot}</p>
                    <p style={{ margin: '0 0 2px', fontSize: '12px', color: T.textSec }}>{prod ? prod.nom : 'Produit supprimé'}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: T.textSec }}>Quantité : {l.quantite} unités</p>
                    {expire && (
                      <p style={{ margin: '4px 0 0', fontSize: '11px', color: expirationAlerte ? '#EF9F27' : T.textSec, fontWeight: expirationAlerte ? '600' : '400' }}>
                        {expirationAlerte ? '⚠️ ' : ''}Expire le {expire.toLocaleDateString('fr-FR')} {joursExpiration !== null ? `(${joursExpiration}j)` : ''}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: T.text }}>{l.quantite}</span>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* FOURNISSEURS */}
      {onglet === 'fournisseurs' && (
        <>
          <div style={s.card}>
            <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px', color: T.text }}>+ Nouveau fournisseur</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Nom *" value={nomFourn} onChange={e => setNomFourn(e.target.value)} />
              <input style={s.input} placeholder="Téléphone" value={telFourn} onChange={e => setTelFourn(e.target.value)} />
            </div>
            <div style={s.row}>
              <input style={{ ...s.input, flex: 1 }} placeholder="Email" value={emailFourn} onChange={e => setEmailFourn(e.target.value)} />
            </div>
            <div style={s.row}>
              <button style={s.btn()} onClick={ajouterFournisseur}>Ajouter</button>
            </div>
          </div>

          <p style={{ fontSize: '14px', fontWeight: '700', margin: '16px 0 10px', color: T.text }}>Fournisseurs ({fournisseurs.length})</p>
          {fournisseurs.length === 0 && <div style={{ ...s.card, textAlign: 'center', padding: '30px' }}><p style={{ fontSize: '13px', color: T.textSec }}>Aucun fournisseur</p></div>}
          {fournisseurs.map(f => {
            const prodsFourn = produits.filter(p => p.fournisseur_id === f.id);
            return (
              <div key={f.id} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '700', color: T.text }}>🤝 {f.nom}</p>
                    {f.telephone && <p style={{ margin: '0 0 2px', fontSize: '12px', color: T.textSec }}>📞 {f.telephone}</p>}
                    {f.email && <p style={{ margin: 0, fontSize: '12px', color: T.textSec }}>✉️ {f.email}</p>}
                  </div>
                  <span style={{ fontSize: '11px', background: sombre ? '#222' : '#f0f0f0', color: T.textSec, padding: '3px 10px', borderRadius: '999px' }}>{prodsFourn.length} produit{prodsFourn.length > 1 ? 's' : ''}</span>
                </div>
                {prodsFourn.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {prodsFourn.map(p => (
                      <span key={p.id} style={{ fontSize: '11px', background: sombre ? '#333' : '#f5f5f5', color: T.textSec, padding: '2px 8px', borderRadius: '6px' }}>{p.nom}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* DETAIL PRODUIT */}
      {detail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 30, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setDetail(null)}>
          <div style={{ background: T.card, borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '40px', height: '4px', background: T.border, borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '800', color: T.text }}>{detail.nom}</p>
                <p style={{ margin: 0, fontSize: '13px', color: T.textSec }}>{detail.categorie || 'Général'} · {detail.unite || 'unité'}</p>
              </div>
              <span style={{ fontSize: '22px', fontWeight: '900', color: detail.stock <= (detail.stock_min || 5) ? '#DC2626' : couleur }}>{detail.stock}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Prix', val: detail.prix.toLocaleString() + ' FCFA' },
                { label: 'Valeur stock', val: (detail.stock * detail.prix).toLocaleString() + ' FCFA' },
                { label: 'Stock min', val: detail.stock_min || 5 },
                { label: 'Stock max', val: detail.stock_max || 100 },
              ].map(item => (
                <div key={item.label} style={{ background: sombre ? '#222' : '#f9f9f9', borderRadius: '10px', padding: '10px 12px' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '11px', color: T.textSec }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: T.text }}>{item.val}</p>
                </div>
              ))}
            </div>
            {detail.code_barre && <p style={{ fontSize: '12px', color: T.textSec, marginBottom: '8px' }}>Code barre : {detail.code_barre}</p>}
            <div style={{ height: '8px', background: sombre ? '#333' : '#eee', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (detail.stock / (detail.stock_max || 100)) * 100)}%`, background: detail.stock <= (detail.stock_min || 5) ? '#DC2626' : couleur, borderRadius: '4px' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 10px', color: T.text }}>Historique des mouvements</p>
            {mouvements.filter(m => m.produit_id === detail.id).slice(0, 5).map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: T.text }}>{m.type} {m.raison ? `· ${m.raison}` : ''}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: T.textSec }}>{new Date(m.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: m.type === 'entree' || m.type === 'retour' ? '#16A34A' : '#DC2626' }}>
                  {m.type === 'entree' || m.type === 'retour' ? '+' : '-'}{m.quantite}
                </p>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button style={{ flex: 1, padding: '12px', background: couleur, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }} onClick={() => { setEditProd(detail.id); setNomProd(detail.nom); setPrixProd(String(detail.prix)); setStockProd(String(detail.stock)); setStockMin(String(detail.stock_min || 5)); setStockMax(String(detail.stock_max || 100)); setCategorieProd(detail.categorie || 'Général'); setUniteProd(detail.unite || 'unité'); setCodeBarreProd(detail.code_barre || ''); setFournisseurProd(detail.fournisseur_id || ''); setDetail(null); setOnglet('produits'); }}>Modifier</button>
              <button style={{ flex: 1, padding: '12px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }} onClick={() => supprimerProduit(detail.id)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stock;