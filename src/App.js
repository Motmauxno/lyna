import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Auth from './Auth';
import Landing from './Landing';
import Stock from './Stock';
function App() {
  const [page, setPage] = useState('dashboard');
  const [theme, setTheme] = useState('clair');
  const [couleur, setCouleur] = useState('#1D9E75');
  const [showSettings, setShowSettings] = useState(false);
  const [detail, setDetail] = useState(null);

  const [commandes, setCommandes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [factures, setFactures] = useState([]);
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [voirLanding, setVoirLanding] = useState(true);

  const [nomCmd, setNomCmd] = useState('');
  const [montantCmd, setMontantCmd] = useState('');
  const [notesCmd, setNotesCmd] = useState('');
  const [editCmd, setEditCmd] = useState(null);

  const [nomProd, setNomProd] = useState('');
  const [prixProd, setPrixProd] = useState('');
  const [stockProd, setStockProd] = useState('');
  const [categorieProd, setCategorieProd] = useState('Général');
  const [editProd, setEditProd] = useState(null);

  const [clientFac, setClientFac] = useState('');
  const [montantFac, setMontantFac] = useState('');
  const [moyenFac, setMoyenFac] = useState('Wave');

  const [destLiv, setDestLiv] = useState('');
  const [chauffeurLiv, setChauffeurLiv] = useState('');
  const [heureLiv, setHeureLiv] = useState('');

  const categories = ['Général', 'Alimentation', 'Boissons', 'Vêtements', 'Électronique', 'Pharmacie', 'Autre'];
  const couleurs = ['#1D9E75', '#2563EB', '#DC2626', '#7C3AED', '#EA580C', '#0891B2', '#BE185D'];

  const sombre = theme === 'sombre';
  const T = {
    bg: sombre ? '#0F0F0F' : '#F5F5F5',
    card: sombre ? '#1A1A1A' : '#FFFFFF',
    nav: sombre ? '#111111' : '#FFFFFF',
    border: sombre ? '#2A2A2A' : '#EEEEEE',
    text: sombre ? '#FFFFFF' : '#111111',
    textSec: sombre ? '#888888' : '#666666',
    input: sombre ? '#222222' : '#FFFFFF',
    inputBorder: sombre ? '#333333' : '#DDDDDD',
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) chargerDonnees(session.user.id);
      else setLoading(false);
    });
  }, []); // eslint-disable-line

  async function chargerDonnees(uid) {
    setLoading(true);
    const id = uid || user?.id;
    const [c, p, f, l] = await Promise.all([
      supabase.from('commandes').select('*').eq('user_id', id).order('created_at', { ascending: false }),
      supabase.from('produits').select('*').eq('user_id', id).order('created_at', { ascending: false }),
      supabase.from('factures').select('*').eq('user_id', id).order('created_at', { ascending: false }),
      supabase.from('livraisons').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    ]);
    if (c.data) setCommandes(c.data);
    if (p.data) setProduits(p.data);
    if (f.data) setFactures(f.data);
    if (l.data) setLivraisons(l.data);
    setLoading(false);
  }

  async function ajouterCommande() {
    if (!nomCmd || !montantCmd) return;
    if (editCmd) {
      await supabase.from('commandes').update({ client: nomCmd, montant: parseInt(montantCmd), notes: notesCmd }).eq('id', editCmd);
      setCommandes(commandes.map(c => c.id === editCmd ? { ...c, client: nomCmd, montant: parseInt(montantCmd), notes: notesCmd } : c));
      setEditCmd(null);
    } else {
      const { data } = await supabase.from('commandes').insert([{ client: nomCmd, montant: parseInt(montantCmd), notes: notesCmd, statut: 'Nouveau', user_id: user.id }]).select();
      if (data) setCommandes([data[0], ...commandes]);
    }
    setNomCmd(''); setMontantCmd(''); setNotesCmd('');
  }

  async function supprimerCommande(id) {
    await supabase.from('commandes').delete().eq('id', id);
    setCommandes(commandes.filter(c => c.id !== id));
    setDetail(null);
  }

  async function majStatutCmd(id, statut) {
    await supabase.from('commandes').update({ statut }).eq('id', id);
    setCommandes(commandes.map(c => c.id === id ? { ...c, statut } : c));
    setDetail(prev => prev && prev.id === id ? { ...prev, statut } : prev);
  }

  async function ajouterProduit() {
    if (!nomProd || !prixProd) return;
    if (editProd) {
      await supabase.from('produits').update({ nom: nomProd, prix: parseInt(prixProd), stock: parseInt(stockProd) || 0, categorie: categorieProd }).eq('id', editProd);
      setProduits(produits.map(p => p.id === editProd ? { ...p, nom: nomProd, prix: parseInt(prixProd), stock: parseInt(stockProd) || 0, categorie: categorieProd } : p));
      setEditProd(null);
    } else {
      const { data } = await supabase.from('produits').insert([{ nom: nomProd, prix: parseInt(prixProd), stock: parseInt(stockProd) || 0, categorie: categorieProd, user_id: user.id }]).select();
      if (data) setProduits([data[0], ...produits]);
    }
    setNomProd(''); setPrixProd(''); setStockProd(''); setCategorieProd('Général');
  }

  async function supprimerProduit(id) {
    await supabase.from('produits').delete().eq('id', id);
    setProduits(produits.filter(p => p.id !== id));
    setDetail(null);
  }

  async function ajouterFacture() {
    if (!clientFac || !montantFac) return;
    const { data } = await supabase.from('factures').insert([{ client: clientFac, montant: parseInt(montantFac), statut: 'En attente', moyen: moyenFac, user_id: user.id }]).select();
    if (data) setFactures([data[0], ...factures]);
    setClientFac(''); setMontantFac('');
  }

  async function majFacture(id, statut) {
    await supabase.from('factures').update({ statut }).eq('id', id);
    setFactures(factures.map(f => f.id === id ? { ...f, statut } : f));
  }

  async function supprimerFacture(id) {
    await supabase.from('factures').delete().eq('id', id);
    setFactures(factures.filter(f => f.id !== id));
  }

  async function ajouterLivraison() {
    if (!destLiv || !chauffeurLiv) return;
    const { data } = await supabase.from('livraisons').insert([{ destination: destLiv, chauffeur: chauffeurLiv, heure: heureLiv || '--:--', statut: 'En attente', user_id: user.id, lat: 14.6928, lng: -17.4467 }]).select();
    if (data) setLivraisons([data[0], ...livraisons]);
    setDestLiv(''); setChauffeurLiv(''); setHeureLiv('');
  }

  async function majLivraison(id, statut) {
    await supabase.from('livraisons').update({ statut }).eq('id', id);
    setLivraisons(livraisons.map(l => l.id === id ? { ...l, statut } : l));
  }

  async function supprimerLivraison(id) {
    await supabase.from('livraisons').delete().eq('id', id);
    setLivraisons(livraisons.filter(l => l.id !== id));
  }

  async function deconnexion() {
    await supabase.auth.signOut();
    setUser(null); setVoirLanding(true);
    setCommandes([]); setProduits([]); setFactures([]); setLivraisons([]);
  }

  const statutColors = {
    'Nouveau': { bg: '#E6F1FB', col: '#0C447C' },
    'Livré': { bg: '#EAF3DE', col: '#27500A' },
    'Réglé': { bg: '#EAF3DE', col: '#27500A' },
    'En attente': { bg: '#FAEEDA', col: '#633806' },
    'En retard': { bg: '#FCEBEB', col: '#791F1F' },
    'En route': { bg: '#E6F1FB', col: '#0C447C' },
    'Terminé': { bg: '#EAF3DE', col: '#27500A' },
  };

  const badge = (statut) => {
    const sc = statutColors[statut] || { bg: '#eee', col: '#555' };
    return <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: sc.bg, color: sc.col, whiteSpace: 'nowrap', fontWeight: '500' }}>{statut}</span>;
  };

  const navItems = [
    { id: 'dashboard', label: 'Accueil', icon: '🏠' },
    { id: 'commandes', label: 'Ventes', icon: '🛒' },
    { id: 'catalogue', label: 'Stock', icon: '📦' },
    { id: 'facturation', label: 'Factures', icon: '🧾' },
    { id: 'livraison', label: 'Livraison', icon: '🚚' },
  ];

  const s = {
    wrap: { fontFamily: 'sans-serif', minHeight: '100vh', background: T.bg, maxWidth: '480px', margin: '0 auto', color: T.text },
    topNav: { background: T.nav, padding: '14px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
    page: { padding: '16px 16px 90px' },
    card: { background: T.card, borderRadius: '14px', padding: '14px 16px', border: `1px solid ${T.border}`, marginBottom: '10px' },
    input: { flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${T.inputBorder}`, fontSize: '13px', minWidth: '80px', background: T.input, color: T.text, outline: 'none' },
    btn: (bg) => ({ padding: '10px 18px', background: bg || couleur, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }),
    btnSm: (bg, col) => ({ padding: '5px 12px', background: bg, color: col, border: 'none', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }),
    row: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' },
    metricCard: { background: T.card, borderRadius: '14px', padding: '16px', border: `1px solid ${T.border}`, flex: 1, cursor: 'pointer', textAlign: 'left' },
    sectionTitle: { fontSize: '14px', fontWeight: '600', margin: '16px 0 10px', color: T.text },
    label: { fontSize: '11px', color: T.textSec, margin: '0 0 4px' },
    bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: T.nav, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-around', padding: '8px 0', zIndex: 10 },
    navBtn: (active) => ({ border: 'none', background: active ? (sombre ? '#1A1A1A' : '#F0FAF6') : 'transparent', fontSize: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 10px', borderRadius: '10px', color: active ? couleur : T.textSec, fontWeight: active ? '600' : '400' }),
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
    sheet: { background: T.card, borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto' },
    sheetHandle: { width: '40px', height: '4px', background: T.border, borderRadius: '2px', margin: '0 auto 20px' },
  };

  if (voirLanding && !user) return <Landing onCommencer={() => setVoirLanding(false)} />;
  if (!user) return <Auth onConnexion={(u) => { setUser(u); chargerDonnees(u.id); }} />;
  if (loading) return (
    <div style={{ ...s.wrap, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '28px', fontWeight: '800', color: couleur }}>LYNA</p>
        <p style={{ fontSize: '13px', color: T.textSec }}>Chargement...</p>
      </div>
    </div>
  );

  const stockTotal = produits.reduce((a, p) => a + (p.stock || 0), 0);
  const alertesStock = produits.filter(p => p.stock < 6).length;
  const categoriesActives = [...new Set(produits.map(p => p.categorie || 'Général'))];

  return (
    <div style={s.wrap}>

      {/* TOP NAV */}
      <div style={s.topNav}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-1px' }}>
          <span style={{ color: couleur }}>LY</span><span style={{ color: T.text }}>NA</span>
        </h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>⚙️</button>
          <button onClick={deconnexion} style={{ fontSize: '11px', color: T.textSec, background: sombre ? '#222' : '#f5f5f5', padding: '5px 12px', borderRadius: '999px', border: 'none', cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </div>

      {/* SETTINGS PANEL */}
      {showSettings && (
        <div style={s.overlay} onClick={() => setShowSettings(false)}>
          <div style={s.sheet} onClick={e => e.stopPropagation()}>
            <div style={s.sheetHandle} />
            <p style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 20px', color: T.text }}>Personnalisation</p>
            <p style={{ ...s.label, marginBottom: '10px' }}>Thème</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {['clair', 'sombre'].map(t => (
                <button key={t} onClick={() => setTheme(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `2px solid ${theme === t ? couleur : T.border}`, background: T.card, color: T.text, cursor: 'pointer', fontWeight: theme === t ? '600' : '400', fontSize: '13px' }}>
                  {t === 'clair' ? '☀️ Clair' : '🌙 Sombre'}
                </button>
              ))}
            </div>
            <p style={{ ...s.label, marginBottom: '10px' }}>Couleur principale</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {couleurs.map(c => (
                <button key={c} onClick={() => setCouleur(c)} style={{ width: '44px', height: '44px', borderRadius: '50%', background: c, border: couleur === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer', outline: couleur === c ? `3px solid ${c}` : 'none' }} />
              ))}
            </div>
            <input type="color" value={couleur} onChange={e => setCouleur(e.target.value)} style={{ width: '100%', height: '44px', borderRadius: '10px', border: 'none', cursor: 'pointer' }} />
          </div>
        </div>
      )}

      {/* DETAIL PANEL */}
      {detail && (
        <div style={s.overlay} onClick={() => setDetail(null)}>
          <div style={s.sheet} onClick={e => e.stopPropagation()}>
            <div style={s.sheetHandle} />
            {detail.type === 'vente' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: T.text }}>Détail vente #{detail.num}</p>
                  {badge(detail.statut)}
                </div>
                <div style={{ background: sombre ? '#222' : '#f9f9f9', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: T.textSec }}>Client</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: T.text }}>{detail.client}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: T.textSec }}>Montant</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: couleur }}>{detail.montant.toLocaleString()} FCFA</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: T.textSec }}>Date</span>
                    <span style={{ fontSize: '13px', color: T.text }}>{new Date(detail.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {detail.notes && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${T.border}` }}>
                      <span style={{ fontSize: '12px', color: T.textSec }}>Notes : {detail.notes}</span>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: T.text, margin: '0 0 8px' }}>Changer le statut</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {['Nouveau', 'En prép.', 'Livré', 'Terminé'].map(st => (
                    <button key={st} onClick={() => majStatutCmd(detail.id, st)} style={{ ...s.btnSm(detail.statut === st ? couleur : sombre ? '#333' : '#eee', detail.statut === st ? '#fff' : T.text) }}>{st}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ ...s.btn(), flex: 1 }} onClick={() => { setEditCmd(detail.id); setNomCmd(detail.client); setMontantCmd(String(detail.montant)); setNotesCmd(detail.notes || ''); setDetail(null); setPage('commandes'); }}>Modifier</button>
                  <button style={{ ...s.btn('#DC2626'), flex: 1 }} onClick={() => supprimerCommande(detail.id)}>Supprimer</button>
                </div>
              </>
            )}
            {detail.type === 'produit' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: T.text }}>{detail.nom}</p>
                  {badge(detail.stock < 6 ? 'En retard' : 'Livré')}
                </div>
                <div style={{ background: sombre ? '#222' : '#f9f9f9', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: T.textSec }}>Catégorie</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: T.text }}>{detail.categorie || 'Général'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: T.textSec }}>Prix unitaire</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: couleur }}>{detail.prix.toLocaleString()} FCFA</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: T.textSec }}>Stock restant</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: detail.stock < 6 ? '#DC2626' : '#16A34A' }}>{detail.stock} unités</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: T.textSec }}>Valeur stock</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: T.text }}>{(detail.prix * detail.stock).toLocaleString()} FCFA</span>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: T.textSec, margin: '0 0 6px' }}>Niveau de stock</p>
                  <div style={{ height: '8px', background: sombre ? '#333' : '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (detail.stock / 100) * 100)}%`, background: detail.stock < 6 ? '#DC2626' : couleur, borderRadius: '4px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ ...s.btn(), flex: 1 }} onClick={() => { setEditProd(detail.id); setNomProd(detail.nom); setPrixProd(String(detail.prix)); setStockProd(String(detail.stock)); setCategorieProd(detail.categorie || 'Général'); setDetail(null); setPage('catalogue'); }}>Modifier</button>
                  <button style={{ ...s.btn('#DC2626'), flex: 1 }} onClick={() => supprimerProduit(detail.id)}>Supprimer</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {page === 'dashboard' && (
        <div style={s.page}>
          <p style={{ fontSize: '13px', color: T.textSec, margin: '0 0 16px' }}>Bonjour, voici votre résumé</p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button style={s.metricCard} onClick={() => setPage('commandes')}>
              <p style={{ ...s.label }}>Ventes</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: T.text }}>{commandes.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: couleur, marginTop: '2px' }}>Voir tout →</p>
            </button>
            <button style={s.metricCard} onClick={() => setPage('catalogue')}>
              <p style={{ ...s.label }}>Produits</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: T.text }}>{produits.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: couleur, marginTop: '2px' }}>Voir stock →</p>
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button style={s.metricCard} onClick={() => setPage('facturation')}>
              <p style={{ ...s.label }}>Factures</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: T.text }}>{factures.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#EF9F27', marginTop: '2px' }}>{factures.filter(f => f.statut === 'En attente').length} en attente →</p>
            </button>
            <button style={s.metricCard} onClick={() => setPage('livraison')}>
              <p style={{ ...s.label }}>Livraisons</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: T.text }}>{livraisons.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: couleur, marginTop: '2px' }}>Suivre →</p>
            </button>
          </div>

          {alertesStock > 0 && (
            <>
              <p style={s.sectionTitle}>⚠️ Alertes stock ({alertesStock})</p>
              {produits.filter(p => p.stock < 6).map(p => (
                <div key={p.id} onClick={() => setDetail({ ...p, type: 'produit' })} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `3px solid #DC2626`, cursor: 'pointer' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: T.text }}>{p.nom}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: T.textSec }}>{p.categorie || 'Général'}</p>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#DC2626' }}>{p.stock} restant</span>
                </div>
              ))}
            </>
          )}

          {commandes.length > 0 && (
            <>
              <p style={s.sectionTitle}>Dernières ventes</p>
              {commandes.slice(0, 3).map((cmd, i) => (
                <div key={cmd.id} onClick={() => setDetail({ ...cmd, type: 'vente', num: commandes.length - i })} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: T.text }}>{cmd.client}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: T.textSec }}>{cmd.montant.toLocaleString()} FCFA</p>
                  </div>
                  {badge(cmd.statut)}
                </div>
              ))}
            </>
          )}

          {commandes.length === 0 && produits.length === 0 && (
            <div style={{ ...s.card, textAlign: 'center', padding: '40px' }}>
              <p style={{ fontSize: '32px', margin: '0 0 8px' }}>🚀</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: T.text, margin: '0 0 4px' }}>Bienvenue sur LYNA</p>
              <p style={{ fontSize: '13px', color: T.textSec, margin: 0 }}>Commencez par ajouter vos produits et vos premières ventes</p>
            </div>
          )}
        </div>
      )}

      {/* VENTES */}
      {page === 'commandes' && (
        <div style={s.page}>
          <div style={s.card}>
            <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 12px', color: T.text }}>{editCmd ? '✏️ Modifier la vente' : '+ Nouvelle vente'}</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Nom client" value={nomCmd} onChange={e => setNomCmd(e.target.value)} />
              <input style={s.input} placeholder="Montant FCFA" value={montantCmd} onChange={e => setMontantCmd(e.target.value)} />
            </div>
            <div style={{ ...s.row }}>
              <input style={{ ...s.input, width: '100%' }} placeholder="Notes (optionnel)" value={notesCmd} onChange={e => setNotesCmd(e.target.value)} />
            </div>
            <div style={{ ...s.row, marginTop: '10px' }}>
              <button style={s.btn()} onClick={ajouterCommande}>{editCmd ? 'Enregistrer' : 'Ajouter'}</button>
              {editCmd && <button style={s.btn('#888')} onClick={() => { setEditCmd(null); setNomCmd(''); setMontantCmd(''); setNotesCmd(''); }}>Annuler</button>}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={s.sectionTitle}>Registre des ventes</p>
            <span style={{ fontSize: '12px', color: couleur, fontWeight: '600' }}>{commandes.length} ventes · {commandes.reduce((a, c) => a + c.montant, 0).toLocaleString()} FCFA</span>
          </div>
          {commandes.length === 0 && <p style={{ fontSize: '13px', color: T.textSec, textAlign: 'center', padding: '20px' }}>Aucune vente pour l'instant</p>}
          {commandes.map((cmd, i) => (
            <div key={cmd.id} onClick={() => setDetail({ ...cmd, type: 'vente', num: commandes.length - i })} style={{ ...s.card, cursor: 'pointer', borderLeft: `3px solid ${couleur}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: T.textSec, fontWeight: '600' }}>#{commandes.length - i}</span>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: T.text }}>{cmd.client}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: couleur, fontWeight: '700' }}>{cmd.montant.toLocaleString()} FCFA</p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: T.textSec }}>{new Date(cmd.created_at).toLocaleDateString('fr-FR')} {cmd.notes ? '· ' + cmd.notes : ''}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  {badge(cmd.statut)}
                  <span style={{ fontSize: '11px', color: T.textSec }}>Détails →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STOCK */}
      {page === 'catalogue' && (
  <Stock user={user} couleur={couleur} T={T} sombre={sombre} />
)}

      {/* FACTURES */}
      {page === 'facturation' && (
        <div style={s.page}>
          <div style={s.card}>
            <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 12px', color: T.text }}>+ Nouvelle facture</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Client" value={clientFac} onChange={e => setClientFac(e.target.value)} />
              <input style={s.input} placeholder="Montant FCFA" value={montantFac} onChange={e => setMontantFac(e.target.value)} />
            </div>
            <div style={s.row}>
              <select style={{ ...s.input, flex: 1 }} value={moyenFac} onChange={e => setMoyenFac(e.target.value)}>
                <option>Wave</option>
                <option>Orange Money</option>
                <option>Mobile Money</option>
                <option>Espèces</option>
              </select>
              <button style={s.btn()} onClick={ajouterFacture}>Créer</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={s.sectionTitle}>Factures ({factures.length})</p>
            <span style={{ fontSize: '12px', color: '#EF9F27', fontWeight: '600' }}>{factures.filter(f => f.statut === 'En attente').length} en attente</span>
          </div>
          {factures.length === 0 && <p style={{ fontSize: '13px', color: T.textSec, textAlign: 'center', padding: '20px' }}>Aucune facture pour l'instant</p>}
          {factures.map(f => (
            <div key={f.id} style={{ ...s.card, borderLeft: f.statut === 'En retard' ? '3px solid #DC2626' : f.statut === 'Réglé' ? `3px solid ${couleur}` : `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: T.text }}>{f.client}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: couleur, fontWeight: '700' }}>{f.montant.toLocaleString()} FCFA · {f.moyen}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: T.textSec }}>{new Date(f.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                {badge(f.statut)}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {f.statut !== 'Réglé' && <button style={s.btnSm('#EAF3DE', '#27500A')} onClick={() => majFacture(f.id, 'Réglé')}>✓ Réglé</button>}
                {f.statut === 'En attente' && <button style={s.btnSm('#FAEEDA', '#633806')} onClick={() => majFacture(f.id, 'En retard')}>En retard</button>}
                <button style={s.btnSm('#FCEBEB', '#791F1F')} onClick={() => supprimerFacture(f.id)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIVRAISONS */}
      {page === 'livraison' && (
        <div style={s.page}>
          <div style={s.card}>
            <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 12px', color: T.text }}>+ Nouvelle livraison</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Destination" value={destLiv} onChange={e => setDestLiv(e.target.value)} />
              <input style={s.input} placeholder="Chauffeur" value={chauffeurLiv} onChange={e => setChauffeurLiv(e.target.value)} />
            </div>
            <div style={s.row}>
              <input style={{ ...s.input, maxWidth: '100px' }} placeholder="Heure" value={heureLiv} onChange={e => setHeureLiv(e.target.value)} />
              <button style={s.btn()} onClick={ajouterLivraison}>Ajouter</button>
            </div>
          </div>

          {livraisons.filter(l => l.statut !== 'Livré').length > 0 && (
            <>
              <p style={s.sectionTitle}>Carte des livraisons actives</p>
              <div style={{ ...s.card, padding: 0, overflow: 'hidden', marginBottom: '16px' }}>
                <iframe
                  title="Carte livraisons"
                  width="100%"
                  height="220"
                  style={{ border: 'none', display: 'block' }}
                  src={`https://maps.google.com/maps?q=Dakar,Senegal&output=embed&z=12`}
                />
                <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.border}` }}>
                  <p style={{ margin: 0, fontSize: '12px', color: T.textSec }}>📍 {livraisons.filter(l => l.statut !== 'Livré').length} livraison(s) active(s) à Dakar</p>
                </div>
              </div>
            </>
          )}

          <p style={s.sectionTitle}>Toutes les livraisons ({livraisons.length})</p>
          {livraisons.length === 0 && (
            <div style={{ ...s.card, textAlign: 'center', padding: '40px' }}>
              <p style={{ fontSize: '32px', margin: '0 0 8px' }}>🚚</p>
              <p style={{ fontSize: '13px', color: T.textSec, margin: 0 }}>Aucune livraison pour l'instant</p>
            </div>
          )}
          {livraisons.map(l => (
            <div key={l.id} style={{ ...s.card, borderLeft: l.statut === 'En retard' ? '3px solid #DC2626' : l.statut === 'Livré' ? `3px solid ${couleur}` : `3px solid #EF9F27` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: T.text }}>📍 {l.destination}</p>
                  <p style={{ margin: '0 0 2px', fontSize: '12px', color: T.textSec }}>🧑‍✈️ {l.chauffeur}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: T.textSec }}>🕐 {l.heure}</p>
                </div>
                {badge(l.statut)}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {l.statut === 'En attente' && <button style={s.btnSm('#E6F1FB', '#0C447C')} onClick={() => majLivraison(l.id, 'En route')}>En route</button>}
                {l.statut !== 'Livré' && <button style={s.btnSm('#EAF3DE', '#27500A')} onClick={() => majLivraison(l.id, 'Livré')}>Livré ✓</button>}
                {l.statut !== 'En retard' && l.statut !== 'Livré' && <button style={s.btnSm('#FAEEDA', '#633806')} onClick={() => majLivraison(l.id, 'En retard')}>En retard</button>}
                {l.statut === 'Livré' && <button style={s.btnSm('#FCEBEB', '#791F1F')} onClick={() => supprimerLivraison(l.id)}>Supprimer</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={s.bottomNav}>
        {navItems.map(item => (
          <button key={item.id} style={s.navBtn(page === item.id)} onClick={() => setPage(item.id)}>
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;