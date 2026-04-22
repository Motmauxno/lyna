import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Auth from './Auth';
import Landing from './Landing';

function App() {
  const [page, setPage] = useState('dashboard');
  const [commandes, setCommandes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [factures, setFactures] = useState([]);
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [voirLanding, setVoirLanding] = useState(true);

  const [nomCmd, setNomCmd] = useState('');
  const [montantCmd, setMontantCmd] = useState('');
  const [nomProd, setNomProd] = useState('');
  const [prixProd, setPrixProd] = useState('');
  const [stockProd, setStockProd] = useState('');
  const [categorieProd, setCategorieProd] = useState('');
  const [editProd, setEditProd] = useState(null);
  const [clientFac, setClientFac] = useState('');
  const [montantFac, setMontantFac] = useState('');
  const [moyenFac, setMoyenFac] = useState('Wave');
  const [destLiv, setDestLiv] = useState('');
  const [chauffeurLiv, setChauffeurLiv] = useState('');
  const [heureLiv, setHeureLiv] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) chargerDonnees(u.id);
      else setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) chargerDonnees(u.id);
      else { setLoading(false); setVoirLanding(true); }
    });
    return () => listener.subscription.unsubscribe();
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
    const { data } = await supabase.from('commandes').insert([
      { client: nomCmd, montant: parseInt(montantCmd), statut: 'Nouveau', user_id: user.id }
    ]).select();
    if (data) setCommandes([data[0], ...commandes]);
    setNomCmd(''); setMontantCmd('');
  }

  async function ajouterOuModifierProduit() {
    if (!nomProd || !prixProd) return;
    if (editProd) {
      const { data } = await supabase.from('produits').update({
        nom: nomProd, prix: parseInt(prixProd), stock: parseInt(stockProd) || 0, categorie: categorieProd
      }).eq('id', editProd.id).select();
      if (data) setProduits(produits.map(p => p.id === editProd.id ? data[0] : p));
      setEditProd(null);
    } else {
      const { data } = await supabase.from('produits').insert([
        { nom: nomProd, prix: parseInt(prixProd), stock: parseInt(stockProd) || 0, categorie: categorieProd || 'Général', user_id: user.id }
      ]).select();
      if (data) setProduits([data[0], ...produits]);
    }
    setNomProd(''); setPrixProd(''); setStockProd(''); setCategorieProd('');
  }

  async function supprimerProduit(id) {
    await supabase.from('produits').delete().eq('id', id);
    setProduits(produits.filter(p => p.id !== id));
  }

  async function ajouterFacture() {
    if (!clientFac || !montantFac) return;
    const { data } = await supabase.from('factures').insert([
      { client: clientFac, montant: parseInt(montantFac), statut: 'En attente', moyen: moyenFac, user_id: user.id }
    ]).select();
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
    const { data } = await supabase.from('livraisons').insert([
      { destination: destLiv, chauffeur: chauffeurLiv, heure: heureLiv || '--:--', statut: 'En attente', user_id: user.id }
    ]).select();
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
  }

  const s = {
    wrap: { fontFamily: 'sans-serif', minHeight: '100vh', background: '#f5f5f5', maxWidth: '480px', margin: '0 auto' },
    nav: { background: '#fff', padding: '14px 20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
    bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', zIndex: 10 },
    navBtn: { border: 'none', background: 'none', fontSize: '11px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '4px 8px', borderRadius: '8px', color: '#888' },
    navBtnActive: { border: 'none', background: '#f0faf6', fontSize: '11px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '4px 8px', borderRadius: '8px', color: '#1D9E75', fontWeight: '500' },
    page: { padding: '16px 16px 100px' },
    card: { background: '#fff', borderRadius: '12px', padding: '14px 16px', border: '1px solid #eee', marginBottom: '10px' },
    input: { flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', minWidth: '80px', background: '#fff' },
    btn: { padding: '9px 16px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500' },
    btnSm: (bg, col) => ({ padding: '5px 10px', background: bg, color: col, border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500' }),
    row: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' },
    metricBtn: { background: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #eee', flex: 1, cursor: 'pointer', textAlign: 'left' },
    sectionTitle: { fontSize: '14px', fontWeight: '600', margin: '0 0 12px', color: '#111' },
    tag: (bg, col) => ({ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: bg, color: col, whiteSpace: 'nowrap', fontWeight: '500' }),
  };

  const statutColors = {
    'Nouveau': { bg: '#E6F1FB', col: '#0C447C' },
    'En prép.': { bg: '#FAEEDA', col: '#633806' },
    'Livré': { bg: '#EAF3DE', col: '#27500A' },
    'Payé': { bg: '#EAF3DE', col: '#27500A' },
    'Réglé': { bg: '#EAF3DE', col: '#27500A' },
    'En attente': { bg: '#FAEEDA', col: '#633806' },
    'En retard': { bg: '#FCEBEB', col: '#791F1F' },
    'En route': { bg: '#E6F1FB', col: '#0C447C' },
  };

  const badge = (statut) => {
    const sc = statutColors[statut] || { bg: '#eee', col: '#555' };
    return <span style={s.tag(sc.bg, sc.col)}>{statut}</span>;
  };

  const navItems = [
    { id: 'dashboard', label: 'Accueil', icon: '🏠' },
    { id: 'commandes', label: 'Ventes', icon: '🛒' },
    { id: 'catalogue', label: 'Stock', icon: '📦' },
    { id: 'facturation', label: 'Factures', icon: '🧾' },
    { id: 'livraison', label: 'Livraison', icon: '🚚' },
  ];

  const categories = [...new Set(produits.map(p => p.categorie || 'Général'))];
  const totalStock = produits.reduce((sum, p) => sum + (p.stock || 0), 0);
  const alertes = produits.filter(p => p.stock < 6);

  if (voirLanding && !user) return <Landing onCommencer={() => setVoirLanding(false)} />;
  if (!user) return <Auth onConnexion={(u) => { setUser(u); chargerDonnees(u.id); }} />;

  if (loading) return (
    <div style={{ ...s.wrap, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '24px', fontWeight: '700', color: '#1D9E75', margin: '0 0 8px' }}>LYNA</p>
        <p style={{ fontSize: '13px', color: '#888' }}>Chargement...</p>
      </div>
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={s.nav}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}><span style={{ color: '#1D9E75' }}>LY</span>NA</h1>
        <button onClick={deconnexion} style={{ fontSize: '12px', color: '#888', background: '#f5f5f5', padding: '5px 12px', borderRadius: '999px', border: 'none', cursor: 'pointer' }}>
          Déconnexion
        </button>
      </div>

      {/* DASHBOARD */}
      {page === 'dashboard' && (
        <div style={s.page}>
          <p style={{ fontSize: '13px', color: '#888', margin: '0 0 14px' }}>Bonjour, voici votre résumé</p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button style={s.metricBtn} onClick={() => setPage('commandes')}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Commandes</p>
              <p style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: '700' }}>{commandes.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75' }}>total →</p>
            </button>
            <button style={s.metricBtn} onClick={() => setPage('catalogue')}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Produits</p>
              <p style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: '700' }}>{produits.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75' }}>au catalogue →</p>
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button style={s.metricBtn} onClick={() => setPage('facturation')}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Factures</p>
              <p style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: '700' }}>{factures.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#EF9F27' }}>{factures.filter(f => f.statut === 'En attente').length} en attente →</p>
            </button>
            <button style={s.metricBtn} onClick={() => setPage('livraison')}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Livraisons</p>
              <p style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: '700' }}>{livraisons.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75' }}>aujourd'hui →</p>
            </button>
          </div>

          {alertes.length > 0 && (
            <>
              <p style={s.sectionTitle}>⚠ Alertes stock</p>
              {alertes.map(p => (
                <div key={p.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid #E24B4A', borderRadius: '0 12px 12px 0' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600' }}>{p.nom}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{p.categorie || 'Général'}</p>
                  </div>
                  {badge('En retard')}
                </div>
              ))}
            </>
          )}

          {commandes.length > 0 && (
            <>
              <p style={{ ...s.sectionTitle, marginTop: '16px' }}>Dernières ventes</p>
              {commandes.slice(0, 3).map(cmd => (
                <div key={cmd.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600' }}>{cmd.client}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{cmd.montant.toLocaleString()} FCFA</p>
                  </div>
                  {badge(cmd.statut)}
                </div>
              ))}
            </>
          )}

          {commandes.length === 0 && produits.length === 0 && (
            <div style={{ ...s.card, textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: '32px', margin: '0 0 8px' }}>👋</p>
              <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px' }}>Bienvenue sur LYNA</p>
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Commencez par ajouter vos produits dans Stock</p>
            </div>
          )}
        </div>
      )}

      {/* VENTES */}
      {page === 'commandes' && (
        <div style={s.page}>
          <div style={s.card}>
            <p style={s.sectionTitle}>Nouvelle vente</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Nom client" value={nomCmd} onChange={e => setNomCmd(e.target.value)} />
              <input style={s.input} placeholder="Montant FCFA" type="number" value={montantCmd} onChange={e => setMontantCmd(e.target.value)} />
              <button style={s.btn} onClick={ajouterCommande}>Ajouter</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ ...s.sectionTitle, margin: 0 }}>Registre des ventes</p>
            <span style={s.tag('#E6F1FB', '#0C447C')}>{commandes.length} ventes</span>
          </div>

          {commandes.length === 0 && (
            <div style={{ ...s.card, textAlign: 'center', padding: '32px', color: '#888' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>Aucune vente enregistrée</p>
            </div>
          )}

          {commandes.map((cmd, i) => (
            <div key={cmd.id} style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600' }}>
                    #{commandes.length - i} — {cmd.client}
                  </p>
                  <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#888' }}>
                    {cmd.montant.toLocaleString()} FCFA · {new Date(cmd.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  {badge(cmd.statut)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STOCK */}
      {page === 'catalogue' && (
        <div style={s.page}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid #eee', flex: 1, textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '700' }}>{produits.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Produits</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid #eee', flex: 1, textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '700' }}>{totalStock}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Total stock</p>
            </div>
            <div style={{ background: alertes.length > 0 ? '#FCEBEB' : '#EAF3DE', borderRadius: '10px', padding: '12px', border: '1px solid #eee', flex: 1, textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '700', color: alertes.length > 0 ? '#E24B4A' : '#1D9E75' }}>{alertes.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: alertes.length > 0 ? '#E24B4A' : '#1D9E75' }}>Alertes</p>
            </div>
          </div>

          <div style={s.card}>
            <p style={s.sectionTitle}>{editProd ? '✏️ Modifier le produit' : '+ Ajouter un produit'}</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Nom produit" value={nomProd} onChange={e => setNomProd(e.target.value)} />
              <input style={{ ...s.input, maxWidth: '110px' }} placeholder="Catégorie" value={categorieProd} onChange={e => setCategorieProd(e.target.value)} />
            </div>
            <div style={{ ...s.row }}>
              <input style={s.input} placeholder="Prix FCFA" type="number" value={prixProd} onChange={e => setPrixProd(e.target.value)} />
              <input style={{ ...s.input, maxWidth: '80px' }} placeholder="Stock" type="number" value={stockProd} onChange={e => setStockProd(e.target.value)} />
              <button style={s.btn} onClick={ajouterOuModifierProduit}>{editProd ? 'Modifier' : 'Ajouter'}</button>
              {editProd && <button style={s.btnSm('#f5f5f5', '#888')} onClick={() => { setEditProd(null); setNomProd(''); setPrixProd(''); setStockProd(''); setCategorieProd(''); }}>Annuler</button>}
            </div>
          </div>

          {categories.map(cat => {
            const prodsCat = produits.filter(p => (p.categorie || 'Général') === cat);
            const totalCat = prodsCat.reduce((sum, p) => sum + (p.stock || 0), 0);
            return (
              <div key={cat} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>{cat}</p>
                    <span style={s.tag('#E6F1FB', '#0C447C')}>{prodsCat.length} produits</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#888' }}>Total : {totalCat} unités</span>
                </div>
                {prodsCat.map(p => {
                  const pct = Math.min(100, Math.round((p.stock / 20) * 100));
                  const couleur = p.stock < 3 ? '#E24B4A' : p.stock < 6 ? '#EF9F27' : '#1D9E75';
                  return (
                    <div key={p.id} style={{ paddingBottom: '10px', marginBottom: '10px', borderBottom: '0.5px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div>
                          <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600' }}>{p.nom}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{p.prix.toLocaleString()} FCFA</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: couleur }}>{p.stock}</span>
                          <button style={s.btnSm('#E6F1FB', '#0C447C')} onClick={() => { setEditProd(p); setNomProd(p.nom); setPrixProd(String(p.prix)); setStockProd(String(p.stock)); setCategorieProd(p.categorie || ''); }}>✏</button>
                          <button style={s.btnSm('#FCEBEB', '#791F1F')} onClick={() => supprimerProduit(p.id)}>✕</button>
                        </div>
                      </div>
                      <div style={{ height: '5px', background: '#f0f0f0', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: pct + '%', background: couleur, borderRadius: '999px', transition: 'width 0.3s' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {produits.length === 0 && (
            <div style={{ ...s.card, textAlign: 'center', padding: '32px', color: '#888' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>Aucun produit — ajoutez votre premier produit ci-dessus</p>
            </div>
          )}
        </div>
      )}

      {/* FACTURES */}
      {page === 'facturation' && (
        <div style={s.page}>
          <div style={s.card}>
            <p style={s.sectionTitle}>Nouvelle facture</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Client" value={clientFac} onChange={e => setClientFac(e.target.value)} />
              <input style={s.input} placeholder="Montant FCFA" type="number" value={montantFac} onChange={e => setMontantFac(e.target.value)} />
            </div>
            <div style={s.row}>
              <select style={{ ...s.input }} value={moyenFac} onChange={e => setMoyenFac(e.target.value)}>
                <option>Wave</option>
                <option>Orange Money</option>
                <option>Mobile Money</option>
                <option>Espèces</option>
              </select>
              <button style={s.btn} onClick={ajouterFacture}>Créer</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ ...s.sectionTitle, margin: 0 }}>Factures</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={s.tag('#EAF3DE', '#27500A')}>{factures.filter(f => f.statut === 'Réglé').length} réglées</span>
              <span style={s.tag('#FAEEDA', '#633806')}>{factures.filter(f => f.statut === 'En attente').length} en attente</span>
            </div>
          </div>

          {factures.length === 0 && (
            <div style={{ ...s.card, textAlign: 'center', padding: '32px', color: '#888' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>Aucune facture</p>
            </div>
          )}

          {factures.map(f => (
            <div key={f.id} style={{ ...s.card, borderLeft: f.statut === 'En retard' ? '3px solid #E24B4A' : f.statut === 'Réglé' ? '3px solid #1D9E75' : '1px solid #eee', borderRadius: f.statut !== 'En attente' ? '0 12px 12px 0' : '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600' }}>{f.client}</p>
                  <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#888' }}>
                    {f.montant.toLocaleString()} FCFA · {f.moyen} · {new Date(f.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  {badge(f.statut)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {f.statut !== 'Réglé' && <button style={s.btnSm('#EAF3DE', '#27500A')} onClick={() => majFacture(f.id, 'Réglé')}>✓ Réglé</button>}
                {f.statut === 'En attente' && <button style={s.btnSm('#FAEEDA', '#633806')} onClick={() => majFacture(f.id, 'En retard')}>⚠ En retard</button>}
                <button style={s.btnSm('#FCEBEB', '#791F1F')} onClick={() => supprimerFacture(f.id)}>✕ Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIVRAISONS */}
      {page === 'livraison' && (
        <div style={s.page}>
          <div style={s.card}>
            <p style={s.sectionTitle}>Nouvelle livraison</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Destination" value={destLiv} onChange={e => setDestLiv(e.target.value)} />
              <input style={s.input} placeholder="Chauffeur" value={chauffeurLiv} onChange={e => setChauffeurLiv(e.target.value)} />
            </div>
            <div style={s.row}>
              <input style={{ ...s.input, maxWidth: '100px' }} placeholder="Heure ex: 14:30" value={heureLiv} onChange={e => setHeureLiv(e.target.value)} />
              <button style={s.btn} onClick={ajouterLivraison}>+ Ajouter</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ ...s.sectionTitle, margin: 0 }}>Livraisons du jour</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={s.tag('#EAF3DE', '#27500A')}>{livraisons.filter(l => l.statut === 'Livré').length} livrées</span>
              <span style={s.tag('#E6F1FB', '#0C447C')}>{livraisons.filter(l => l.statut === 'En route').length} en route</span>
            </div>
          </div>

          {livraisons.length === 0 && (
            <div style={{ ...s.card, textAlign: 'center', padding: '32px', color: '#888' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>Aucune livraison enregistrée</p>
            </div>
          )}

          {livraisons.map(l => (
            <div key={l.id} style={{ ...s.card, borderLeft: l.statut === 'En retard' ? '3px solid #E24B4A' : l.statut === 'Livré' ? '3px solid #1D9E75' : l.statut === 'En route' ? '3px solid #378ADD' : '1px solid #eee', borderRadius: '0 12px 12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600' }}>{l.destination}</p>
                  <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#888' }}>Chauffeur : {l.chauffeur} · {l.heure}</p>
                  {badge(l.statut)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {l.statut === 'En attente' && <button style={s.btnSm('#E6F1FB', '#0C447C')} onClick={() => majLivraison(l.id, 'En route')}>🚚 En route</button>}
                {l.statut === 'En route' && <button style={s.btnSm('#EAF3DE', '#27500A')} onClick={() => majLivraison(l.id, 'Livré')}>✓ Livré</button>}
                {l.statut !== 'Livré' && l.statut !== 'En retard' && <button style={s.btnSm('#FAEEDA', '#633806')} onClick={() => majLivraison(l.id, 'En retard')}>⚠ En retard</button>}
                {l.statut === 'Livré' && <button style={s.btnSm('#FCEBEB', '#791F1F')} onClick={() => supprimerLivraison(l.id)}>✕ Supprimer</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={s.bottomNav}>
        {navItems.map(item => (
          <button key={item.id} style={page === item.id ? s.navBtnActive : s.navBtn} onClick={() => setPage(item.id)}>
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;