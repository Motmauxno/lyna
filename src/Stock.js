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
  const [confirmation, setConfirmation] = useState(null);

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
  const [editFourn, setEditFourn] = useState(null);

  const [mvtProduit, setMvtProduit] = useState('');
  const [mvtType, setMvtType] = useState('entree');
  const [mvtQte, setMvtQte] = useState('');
  const [mvtRaison, setMvtRaison] = useState('');
  const [mvtLot, setMvtLot] = useState('');

  const [lotProduit, setLotProduit] = useState('');
  const [lotNumero, setLotNumero] = useState('');
  const [lotQte, setLotQte] = useState('');
  const [lotExpiration, setLotExpiration] = useState('');
  const [editLot, setEditLot] = useState(null);

  const [recherche, setRecherche] = useState('');
  const [categorieFiltree, setCategorieFiltree] = useState(null);

  const categories = ['Général', 'Alimentation', 'Boissons', 'Vêtements', 'Électronique', 'Pharmacie', 'Autre'];
  const unites = ['unité', 'kg', 'g', 'litre', 'ml', 'boîte', 'sac', 'carton', 'pièce'];

  const charger = useCallback(async () => {
    setLoading(true);
    const [p, f, m, l] = await Promise.all([
      supabase.from('produits').select('*').eq('user_id', user.id).order('nom'),
      supabase.from('fournisseurs').select('*').eq('user_id', user.id).order('nom'),
      supabase.from('mouvements_stock').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
      supabase.from('lots').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    if (p.data) setProduits(p.data);
    if (f.data) setFournisseurs(f.data);
    if (m.data) setMouvements(m.data);
    if (l.data) setLots(l.data);
    setLoading(false);
  }, [user.id]);

  useEffect(() => { charger(); }, [charger]);

  function confirmer(message, action) {
    setConfirmation({ message, action });
  }

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
    resetProd();
  }

  function resetProd() {
    setNomProd(''); setPrixProd(''); setStockProd(''); setStockMin('5'); setStockMax('100');
    setCategorieProd('Général'); setUniteProd('unité'); setCodeBarreProd(''); setFournisseurProd(''); setEditProd(null);
  }

  function chargerEditProd(p) {
    setEditProd(p.id); setNomProd(p.nom); setPrixProd(String(p.prix)); setStockProd(String(p.stock));
    setStockMin(String(p.stock_min || 5)); setStockMax(String(p.stock_max || 100));
    setCategorieProd(p.categorie || 'Général'); setUniteProd(p.unite || 'unité');
    setCodeBarreProd(p.code_barre || ''); setFournisseurProd(p.fournisseur_id || '');
    setDetail(null); setOnglet('produits');
    window.scrollTo(0, 0);
  }

  async function supprimerProduit(id) {
    await supabase.from('produits').delete().eq('id', id);
    setProduits(produits.filter(p => p.id !== id));
    setDetail(null); setConfirmation(null);
  }

  async function ajouterFournisseur() {
    if (!nomFourn) return;
    const payload = { nom: nomFourn, telephone: telFourn, email: emailFourn, user_id: user.id };
    if (editFourn) {
      await supabase.from('fournisseurs').update(payload).eq('id', editFourn);
      setFournisseurs(fournisseurs.map(f => f.id === editFourn ? { ...f, ...payload } : f));
      setEditFourn(null);
    } else {
      const { data } = await supabase.from('fournisseurs').insert([payload]).select();
      if (data) setFournisseurs([...fournisseurs, data[0]]);
    }
    setNomFourn(''); setTelFourn(''); setEmailFourn('');
  }

  async function supprimerFournisseur(id) {
    await supabase.from('fournisseurs').delete().eq('id', id);
    setFournisseurs(fournisseurs.filter(f => f.id !== id));
    setConfirmation(null);
  }

  async function enregistrerMouvement() {
    if (!mvtProduit || !mvtQte) return;
    const qte = parseInt(mvtQte);
    const produit = produits.find(p => p.id === mvtProduit);
    if (!produit) return;
    const nouveauStock = mvtType === 'entree' || mvtType === 'retour' ? produit.stock + qte : Math.max(0, produit.stock - qte);
    await supabase.from('produits').update({ stock: nouveauStock }).eq('id', mvtProduit);
    await supabase.from('mouvements_stock').insert([{ produit_id: mvtProduit, type: mvtType, quantite: qte, raison: mvtRaison, lot: mvtLot, user_id: user.id }]);
    setProduits(produits.map(p => p.id === mvtProduit ? { ...p, stock: nouveauStock } : p));
    await charger();
    setMvtProduit(''); setMvtQte(''); setMvtRaison(''); setMvtLot('');
  }

  async function supprimerMouvement(id, produitId, type, quantite) {
    const produit = produits.find(p => p.id === produitId);
    if (produit) {
      const stockCorrige = type === 'entree' || type === 'retour' ? produit.stock - quantite : produit.stock + quantite;
      await supabase.from('produits').update({ stock: Math.max(0, stockCorrige) }).eq('id', produitId);
      setProduits(produits.map(p => p.id === produitId ? { ...p, stock: Math.max(0, stockCorrige) } : p));
    }
    await supabase.from('mouvements_stock').delete().eq('id', id);
    setMouvements(mouvements.filter(m => m.id !== id));
    setConfirmation(null);
  }

  async function ajouterLot() {
    if (!lotProduit || !lotNumero || !lotQte) return;
    if (editLot) {
      await supabase.from('lots').update({ numero_lot: lotNumero, quantite: parseInt(lotQte), date_expiration: lotExpiration || null }).eq('id', editLot);
      setLots(lots.map(l => l.id === editLot ? { ...l, numero_lot: lotNumero, quantite: parseInt(lotQte), date_expiration: lotExpiration || null } : l));
      setEditLot(null);
    } else {
      const { data } = await supabase.from('lots').insert([{ produit_id: lotProduit, numero_lot: lotNumero, quantite: parseInt(lotQte), date_expiration: lotExpiration || null, user_id: user.id }]).select();
      if (data) {
        setLots([data[0], ...lots]);
        const produit = produits.find(p => p.id === lotProduit);
        if (produit) {
          const nouveauStock = produit.stock + parseInt(lotQte);
          await supabase.from('produits').update({ stock: nouveauStock }).eq('id', lotProduit);
          await supabase.from('mouvements_stock').insert([{ produit_id: lotProduit, type: 'entree', quantite: parseInt(lotQte), raison: 'Réception lot', lot: lotNumero, user_id: user.id }]);
          setProduits(produits.map(p => p.id === lotProduit ? { ...p, stock: nouveauStock } : p));
        }
      }
    }
    setLotProduit(''); setLotNumero(''); setLotQte(''); setLotExpiration(''); setEditLot(null);
  }

  async function supprimerLot(id) {
    await supabase.from('lots').delete().eq('id', id);
    setLots(lots.filter(l => l.id !== id));
    setConfirmation(null);
  }

  const stockTotal = produits.reduce((a, p) => a + (p.stock || 0), 0);
  const valeurTotale = produits.reduce((a, p) => a + ((p.stock || 0) * (p.prix || 0)), 0);
  const produitsAlerte = produits.filter(p => p.stock <= (p.stock_min || 5));
  const produitsFiltres = produits.filter(p =>
    (recherche === '' || p.nom.toLowerCase().includes(recherche.toLowerCase()) || (p.code_barre || '').includes(recherche)) &&
    (categorieFiltree === null || (p.categorie || 'Général') === categorieFiltree)
  );

  const vitesseEcoulement = (produitId) => {
    const mvts = mouvements.filter(m => m.produit_id === produitId && m.type === 'sortie');
    if (mvts.length === 0) return 0;
    return Math.round(mvts.reduce((a, m) => a + m.quantite, 0) / 30);
  };

  const joursRestants = (produit) => {
    const v = vitesseEcoulement(produit.id);
    return v === 0 ? null : Math.round(produit.stock / v);
  };

  const s = {
    card: { background: T.card, borderRadius: '14px', padding: '14px 16px', border: `1px solid ${T.border}`, marginBottom: '10px' },
    input: { flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${T.inputBorder}`, fontSize: '13px', minWidth: '80px', background: T.input, color: T.text, outline: 'none' },
    btn: (bg) => ({ padding: '10px 18px', background: bg || couleur, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }),
    btnSm: (bg, col) => ({ padding: '5px 12px', background: bg, color: col, border: 'none', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap' }),
    row: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' },
    tab: (active) => ({ padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: active ? '600' : '400', background: active ? couleur : sombre ? '#222' : '#eee', color: active ? '#fff' : T.textSec, whiteSpace: 'nowrap' }),
    title: { fontSize: '14px', fontWeight: '700', margin: '16px 0 10px', color: T.text },
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: T.textSec }}>Chargement...</div>;

  const onglets = [
    { id: 'apercu', label: '📊 Aperçu' },
    { id: 'produits', label: '📦 Produits' },
    { id: 'mouvements', label: '🔄 Mouvements' },
    { id: 'lots', label: '🏷️ Lots' },
    { id: 'fournisseurs', label: '🤝 Fournisseurs' },
  ];

  return (
    <div style={{ padding: '16px 16px 90px', background: T.bg, minHeight: '100vh' }}>

      {/* CONFIRMATION */}
      {confirmation && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: T.card, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '340px' }}>
            <p style={{ fontSize: '15px', fontWeight: '700', color: T.text, margin: '0 0 8px' }}>Confirmer la suppression</p>
            <p style={{ fontSize: '13px', color: T.textSec, margin: '0 0 20px' }}>{confirmation.message}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ ...s.btn('#DC2626'), flex: 1 }} onClick={confirmation.action}>Supprimer</button>
              <button style={{ ...s.btn(sombre ? '#333' : '#eee'), flex: 1, color: T.text }} onClick={() => setConfirmation(null)}>Annuler</button>
            </div>
          </div>
        </div>
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
              <span style={{ fontSize: '24px', fontWeight: '900', color: detail.stock <= (detail.stock_min || 5) ? '#DC2626' : couleur }}>{detail.stock}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Prix unitaire', val: detail.prix.toLocaleString() + ' FCFA' },
                { label: 'Valeur stock', val: (detail.stock * detail.prix).toLocaleString() + ' FCFA' },
                { label: 'Stock minimum', val: detail.stock_min || 5 },
                { label: 'Stock maximum', val: detail.stock_max || 100 },
              ].map(item => (
                <div key={item.label} style={{ background: sombre ? '#222' : '#f5f5f5', borderRadius: '10px', padding: '10px 12px' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '11px', color: T.textSec }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: T.text }}>{item.val}</p>
                </div>
              ))}
            </div>
            <div style={{ height: '8px', background: sombre ? '#333' : '#eee', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (detail.stock / (detail.stock_max || 100)) * 100)}%`, background: detail.stock <= (detail.stock_min || 5) ? '#DC2626' : couleur, borderRadius: '4px' }} />
            </div>
            {mouvements.filter(m => m.produit_id === detail.id).length > 0 && (
              <>
                <p style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 10px', color: T.text }}>Derniers mouvements</p>
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
              </>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button style={{ ...s.btn(), flex: 1 }} onClick={() => chargerEditProd(detail)}>✏️ Modifier</button>
              <button style={{ ...s.btn('#DC2626'), flex: 1 }} onClick={() => confirmer(`Supprimer "${detail.nom}" ?`, () => supprimerProduit(detail.id))}>🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ONGLETS */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '8px' }}>
        {onglets.map(o => <button key={o.id} style={s.tab(onglet === o.id)} onClick={() => setOnglet(o.id)}>{o.label}</button>)}
      </div>

      {/* ===== APERCU ===== */}
      {onglet === 'apercu' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Produits', val: produits.length, sub: 'références', color: T.text },
              { label: 'Stock total', val: stockTotal, sub: 'unités', color: T.text },
              { label: 'Valeur du stock', val: valeurTotale.toLocaleString() + ' F', sub: 'FCFA', color: couleur },
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
              <p style={s.title}>⚠️ Alertes réapprovisionnement</p>
              {produitsAlerte.map(p => {
                const jours = joursRestants(p);
                const vitesse = vitesseEcoulement(p.id);
                return (
                  <div key={p.id} style={{ ...s.card, borderLeft: '3px solid #DC2626' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: T.text }}>{p.nom}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: T.textSec }}>{p.categorie || 'Général'} · {p.unite || 'unité'}</p>
                        {vitesse > 0 && jours !== null && (
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#DC2626', fontWeight: '600' }}>🔮 Rupture dans ~{jours} jour{jours > 1 ? 's' : ''}</p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '800', color: '#DC2626' }}>{p.stock}</p>
                        <p style={{ margin: 0, fontSize: '10px', color: T.textSec }}>min : {p.stock_min || 5}</p>
                      </div>
                    </div>
                    <div style={{ height: '5px', background: sombre ? '#333' : '#eee', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (p.stock / (p.stock_max || 100)) * 100)}%`, background: '#DC2626', borderRadius: '3px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button style={s.btnSm(couleur, '#fff')} onClick={() => chargerEditProd(p)}>✏️ Modifier</button>
                      <button style={s.btnSm('#FCEBEB', '#791F1F')} onClick={() => confirmer(`Supprimer "${p.nom}" ?`, () => supprimerProduit(p.id))}>🗑️ Supprimer</button>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          <p style={s.title}>📈 Vue par catégorie</p>
          {[...new Set(produits.map(p => p.categorie || 'Général'))].map(cat => {
            const prods = produits.filter(p => (p.categorie || 'Général') === cat);
            const stockCat = prods.reduce((a, p) => a + p.stock, 0);
            const valeurCat = prods.reduce((a, p) => a + p.stock * p.prix, 0);
            const alertesCat = prods.filter(p => p.stock <= (p.stock_min || 5)).length;
            return (
              <div key={cat} style={{ ...s.card, borderLeft: alertesCat > 0 ? '3px solid #DC2626' : `3px solid ${couleur}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: T.text }}>{cat}</p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div><p style={{ margin: 0, fontSize: '11px', color: T.textSec }}>Références</p><p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: T.text }}>{prods.length}</p></div>
                      <div><p style={{ margin: 0, fontSize: '11px', color: T.textSec }}>Unités</p><p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: T.text }}>{stockCat}</p></div>
                      <div><p style={{ margin: 0, fontSize: '11px', color: T.textSec }}>Valeur</p><p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: couleur }}>{valeurCat.toLocaleString()} F</p></div>
                    </div>
                  </div>
                  {alertesCat > 0 && <span style={{ fontSize: '11px', background: '#FCEBEB', color: '#791F1F', padding: '3px 10px', borderRadius: '999px' }}>⚠️ {alertesCat}</span>}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '10px', borderTop: `1px solid ${T.border}` }}>
                  <button style={s.btnSm(sombre ? '#222' : '#f0f0f0', T.textSec)} onClick={() => { setCategorieFiltree(cat); setOnglet('produits'); }}>👁️ Voir produits</button>
                  <button style={s.btnSm(couleur, '#fff')} onClick={() => { prods.forEach(p => chargerEditProd(p)); }}>✏️ Modifier cat.</button>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ===== PRODUITS ===== */}
      {onglet === 'produits' && (
        <>
          <div style={s.card}>
            <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px', color: T.text }}>{editProd ? '✏️ Modifier le produit' : '+ Nouveau produit'}</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Nom *" value={nomProd} onChange={e => setNomProd(e.target.value)} />
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
                <option value="">Fournisseur (optionnel)</option>
                {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
            <div style={s.row}>
              <button style={s.btn()} onClick={ajouterProduit}>{editProd ? '✅ Enregistrer' : '+ Ajouter'}</button>
              {editProd && <button style={s.btn(sombre ? '#333' : '#888')} onClick={resetProd}>Annuler</button>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <input style={{ ...s.input, flex: 1 }} placeholder="🔍 Rechercher..." value={recherche} onChange={e => setRecherche(e.target.value)} />
            {categorieFiltree && (
              <button style={s.btnSm('#FAEEDA', '#633806')} onClick={() => setCategorieFiltree(null)}>✕ {categorieFiltree}</button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: T.text }}>Catalogue ({produitsFiltres.length})</p>
            <span style={{ fontSize: '12px', color: couleur, fontWeight: '600' }}>{produitsFiltres.reduce((a, p) => a + p.stock * p.prix, 0).toLocaleString()} FCFA</span>
          </div>

          {produitsFiltres.length === 0 && <div style={{ ...s.card, textAlign: 'center', padding: '40px' }}><p style={{ fontSize: '13px', color: T.textSec }}>Aucun produit</p></div>}
          {produitsFiltres.map(p => {
            const pct = Math.min(100, (p.stock / (p.stock_max || 100)) * 100);
            const alerte = p.stock <= (p.stock_min || 5);
            const jours = joursRestants(p);
            return (
              <div key={p.id} onClick={() => setDetail(p)} style={{ ...s.card, cursor: 'pointer', borderLeft: alerte ? '3px solid #DC2626' : `3px solid ${couleur}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: T.text }}>{p.nom}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: T.textSec }}>{p.categorie || 'Général'} · {p.prix.toLocaleString()} FCFA/{p.unite || 'unité'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '800', color: alerte ? '#DC2626' : T.text }}>{p.stock}</p>
                    <p style={{ margin: 0, fontSize: '10px', color: T.textSec }}>{p.unite || 'unité'}</p>
                  </div>
                </div>
                <div style={{ height: '4px', background: sombre ? '#333' : '#eee', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: alerte ? '#DC2626' : pct < 50 ? '#EF9F27' : couleur, borderRadius: '2px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: T.textSec }}>Valeur : {(p.stock * p.prix).toLocaleString()} FCFA</span>
                  {jours !== null && <span style={{ fontSize: '11px', color: alerte ? '#DC2626' : '#EF9F27', fontWeight: '600' }}>🔮 ~{jours}j</span>}
                </div>
                <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                  <button style={s.btnSm(couleur, '#fff')} onClick={() => chargerEditProd(p)}>✏️ Modifier</button>
                  <button style={s.btnSm('#FCEBEB', '#791F1F')} onClick={() => confirmer(`Supprimer "${p.nom}" ?`, () => supprimerProduit(p.id))}>🗑️ Supprimer</button>
                  <button style={s.btnSm('#E6F1FB', '#0C447C')} onClick={() => { setMvtProduit(p.id); setOnglet('mouvements'); }}>🔄 Mouvement</button>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ===== MOUVEMENTS ===== */}
      {onglet === 'mouvements' && (
        <>
          <div style={s.card}>
            <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px', color: T.text }}>📝 Nouveau mouvement</p>
            <div style={s.row}>
              <select style={{ ...s.input, flex: 1 }} value={mvtProduit} onChange={e => setMvtProduit(e.target.value)}>
                <option value="">Sélectionner un produit</option>
                {produits.map(p => <option key={p.id} value={p.id}>{p.nom} (stock: {p.stock})</option>)}
              </select>
            </div>
            <div style={s.row}>
              <select style={{ ...s.input, maxWidth: '140px' }} value={mvtType} onChange={e => setMvtType(e.target.value)}>
                <option value="entree">📥 Entrée</option>
                <option value="sortie">📤 Sortie</option>
                <option value="ajustement">⚖️ Ajustement</option>
                <option value="perte">🗑️ Perte</option>
                <option value="retour">↩️ Retour</option>
              </select>
              <input style={{ ...s.input, maxWidth: '100px' }} placeholder="Quantité" type="number" value={mvtQte} onChange={e => setMvtQte(e.target.value)} />
            </div>
            <div style={s.row}>
              <input style={s.input} placeholder="Raison" value={mvtRaison} onChange={e => setMvtRaison(e.target.value)} />
              <input style={{ ...s.input, maxWidth: '120px' }} placeholder="N° Lot" value={mvtLot} onChange={e => setMvtLot(e.target.value)} />
            </div>
            <div style={s.row}><button style={s.btn()} onClick={enregistrerMouvement}>Enregistrer</button></div>
          </div>

          <p style={s.title}>Historique ({mouvements.length})</p>
          {mouvements.length === 0 && <div style={{ ...s.card, textAlign: 'center', padding: '30px' }}><p style={{ fontSize: '13px', color: T.textSec }}>Aucun mouvement</p></div>}
          {mouvements.map(m => {
            const prod = produits.find(p => p.id === m.produit_id);
            const icons = { entree: '📥', sortie: '📤', ajustement: '⚖️', perte: '🗑️', retour: '↩️' };
            const colors = { entree: '#16A34A', sortie: '#DC2626', ajustement: '#EF9F27', perte: '#DC2626', retour: '#2563EB' };
            const isPositif = m.type === 'entree' || m.type === 'retour';
            return (
              <div key={m.id} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px' }}>{icons[m.type] || '📦'}</span>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: T.text }}>{prod ? prod.nom : 'Produit supprimé'}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: T.textSec }}>{m.raison || m.type} {m.lot ? `· Lot ${m.lot}` : ''}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: T.textSec }}>{new Date(m.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors[m.type] || T.text }}>
                    {isPositif ? '+' : '-'}{m.quantite}
                  </p>
                </div>
                <button style={s.btnSm('#FCEBEB', '#791F1F')} onClick={() => confirmer(`Annuler ce mouvement de ${m.quantite} unités ?`, () => supprimerMouvement(m.id, m.produit_id, m.type, m.quantite))}>
                  🗑️ Annuler mouvement
                </button>
              </div>
            );
          })}
        </>
      )}

      {/* ===== LOTS ===== */}
      {onglet === 'lots' && (
        <>
          <div style={s.card}>
            <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px', color: T.text }}>{editLot ? '✏️ Modifier le lot' : '🏷️ Nouveau lot'}</p>
            <div style={s.row}>
              <select style={{ ...s.input, flex: 1 }} value={lotProduit} onChange={e => setLotProduit(e.target.value)} disabled={!!editLot}>
                <option value="">Sélectionner un produit</option>
                {produits.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </div>
            <div style={s.row}>
              <input style={s.input} placeholder="N° de lot *" value={lotNumero} onChange={e => setLotNumero(e.target.value)} />
              <input style={{ ...s.input, maxWidth: '100px' }} placeholder="Qté *" type="number" value={lotQte} onChange={e => setLotQte(e.target.value)} />
            </div>
            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '11px', color: T.textSec, margin: '0 0 4px' }}>Date d'expiration</p>
                <input style={{ ...s.input, width: '100%' }} type="date" value={lotExpiration} onChange={e => setLotExpiration(e.target.value)} />
              </div>
            </div>
            <div style={s.row}>
              <button style={s.btn()} onClick={ajouterLot}>{editLot ? '✅ Enregistrer' : 'Créer'}</button>
              {editLot && <button style={s.btn(sombre ? '#333' : '#888')} onClick={() => { setEditLot(null); setLotNumero(''); setLotQte(''); setLotExpiration(''); }}>Annuler</button>}
            </div>
          </div>

          <p style={s.title}>Lots enregistrés ({lots.length})</p>
          {lots.length === 0 && <div style={{ ...s.card, textAlign: 'center', padding: '30px' }}><p style={{ fontSize: '13px', color: T.textSec }}>Aucun lot</p></div>}
          {lots.map(l => {
            const prod = produits.find(p => p.id === l.produit_id);
            const expire = l.date_expiration ? new Date(l.date_expiration) : null;
            const joursExp = expire ? Math.round((expire - new Date()) / (1000 * 60 * 60 * 24)) : null;
            const expirationAlerte = joursExp !== null && joursExp < 30;
            const expire2 = joursExp !== null && joursExp < 0;
            return (
              <div key={l.id} style={{ ...s.card, borderLeft: expire2 ? '3px solid #DC2626' : expirationAlerte ? '3px solid #EF9F27' : `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: T.text }}>🏷️ Lot {l.numero_lot}</p>
                    <p style={{ margin: '0 0 2px', fontSize: '12px', color: T.textSec }}>{prod ? prod.nom : 'Produit supprimé'}</p>
                    <p style={{ margin: '0 0 2px', fontSize: '12px', color: T.textSec }}>Quantité : {l.quantite} unités</p>
                    {expire && (
                      <p style={{ margin: 0, fontSize: '11px', color: expire2 ? '#DC2626' : expirationAlerte ? '#EF9F27' : T.textSec, fontWeight: expirationAlerte ? '600' : '400' }}>
                        {expire2 ? '❌ Expiré' : expirationAlerte ? '⚠️ Expire bientôt' : '✅ Expire'} le {expire.toLocaleDateString('fr-FR')} {joursExp !== null && !expire2 ? `(${joursExp}j)` : ''}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: T.text }}>{l.quantite}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button style={s.btnSm(couleur, '#fff')} onClick={() => { setEditLot(l.id); setLotProduit(l.produit_id); setLotNumero(l.numero_lot); setLotQte(String(l.quantite)); setLotExpiration(l.date_expiration || ''); }}>✏️ Modifier</button>
                  <button style={s.btnSm('#FCEBEB', '#791F1F')} onClick={() => confirmer(`Supprimer le lot ${l.numero_lot} ?`, () => supprimerLot(l.id))}>🗑️ Supprimer</button>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ===== FOURNISSEURS ===== */}
      {onglet === 'fournisseurs' && (
        <>
          <div style={s.card}>
            <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px', color: T.text }}>{editFourn ? '✏️ Modifier fournisseur' : '+ Nouveau fournisseur'}</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Nom *" value={nomFourn} onChange={e => setNomFourn(e.target.value)} />
              <input style={s.input} placeholder="Téléphone" value={telFourn} onChange={e => setTelFourn(e.target.value)} />
            </div>
            <div style={s.row}>
              <input style={{ ...s.input, flex: 1 }} placeholder="Email" value={emailFourn} onChange={e => setEmailFourn(e.target.value)} />
            </div>
            <div style={s.row}>
              <button style={s.btn()} onClick={ajouterFournisseur}>{editFourn ? '✅ Enregistrer' : '+ Ajouter'}</button>
              {editFourn && <button style={s.btn(sombre ? '#333' : '#888')} onClick={() => { setEditFourn(null); setNomFourn(''); setTelFourn(''); setEmailFourn(''); }}>Annuler</button>}
            </div>
          </div>

          <p style={s.title}>Fournisseurs ({fournisseurs.length})</p>
          {fournisseurs.length === 0 && <div style={{ ...s.card, textAlign: 'center', padding: '30px' }}><p style={{ fontSize: '13px', color: T.textSec }}>Aucun fournisseur</p></div>}
          {fournisseurs.map(f => {
            const prodsFourn = produits.filter(p => p.fournisseur_id === f.id);
            return (
              <div key={f.id} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: T.text }}>🤝 {f.nom}</p>
                    {f.telephone && <p style={{ margin: '0 0 2px', fontSize: '12px', color: T.textSec }}>📞 {f.telephone}</p>}
                    {f.email && <p style={{ margin: 0, fontSize: '12px', color: T.textSec }}>✉️ {f.email}</p>}
                  </div>
                  <span style={{ fontSize: '11px', background: sombre ? '#222' : '#f0f0f0', color: T.textSec, padding: '3px 10px', borderRadius: '999px' }}>{prodsFourn.length} produit{prodsFourn.length > 1 ? 's' : ''}</span>
                </div>
                {prodsFourn.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {prodsFourn.map(p => (
                      <span key={p.id} style={{ fontSize: '11px', background: sombre ? '#333' : '#f5f5f5', color: T.textSec, padding: '2px 8px', borderRadius: '6px' }}>{p.nom}</span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button style={s.btnSm(couleur, '#fff')} onClick={() => { setEditFourn(f.id); setNomFourn(f.nom); setTelFourn(f.telephone || ''); setEmailFourn(f.email || ''); window.scrollTo(0, 0); }}>✏️ Modifier</button>
                  <button style={s.btnSm('#FCEBEB', '#791F1F')} onClick={() => confirmer(`Supprimer "${f.nom}" ?`, () => supprimerFournisseur(f.id))}>🗑️ Supprimer</button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default Stock;