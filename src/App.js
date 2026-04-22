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
  const [clientFac, setClientFac] = useState('');
  const [montantFac, setMontantFac] = useState('');
  const [moyenFac, setMoyenFac] = useState('Wave');
  const [destLiv, setDestLiv] = useState('');
  const [chauffeurLiv, setChauffeurLiv] = useState('');
  const [heureLiv, setHeureLiv] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) chargerDonnees(session.user.id);
      else setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function chargerDonnees(uid) {
    setLoading(true);
    const id = uid || user?.id;
    const { data: cmds } = await supabase.from('commandes').select('*').eq('user_id', id).order('created_at', { ascending: false });
    const { data: prods } = await supabase.from('produits').select('*').eq('user_id', id).order('created_at', { ascending: false });
    const { data: facts } = await supabase.from('factures').select('*').eq('user_id', id).order('created_at', { ascending: false });
    const { data: livs } = await supabase.from('livraisons').select('*').eq('user_id', id).order('created_at', { ascending: false });
    if (cmds) setCommandes(cmds);
    if (prods) setProduits(prods);
    if (facts) setFactures(facts);
    if (livs) setLivraisons(livs);
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

  async function ajouterProduit() {
    if (!nomProd || !prixProd) return;
    const { data } = await supabase.from('produits').insert([
      { nom: nomProd, prix: parseInt(prixProd), stock: parseInt(stockProd) || 0, user_id: user.id }
    ]).select();
    if (data) setProduits([data[0], ...produits]);
    setNomProd(''); setPrixProd(''); setStockProd('');
  }

  async function ajouterFacture() {
    if (!clientFac || !montantFac) return;
    const { data } = await supabase.from('factures').insert([
      { client: clientFac, montant: parseInt(montantFac), statut: 'En attente', moyen: moyenFac, user_id: user.id }
    ]).select();
    if (data) setFactures([data[0], ...factures]);
    setClientFac(''); setMontantFac('');
  }

  async function ajouterLivraison() {
    if (!destLiv || !chauffeurLiv) return;
    const { data } = await supabase.from('livraisons').insert([
      { destination: destLiv, chauffeur: chauffeurLiv, heure: heureLiv || '--:--', statut: 'En attente', user_id: user.id }
    ]).select();
    if (data) setLivraisons([data[0], ...livraisons]);
    setDestLiv(''); setChauffeurLiv(''); setHeureLiv('');
  }

  async function majFacture(id, statut) {
    await supabase.from('factures').update({ statut }).eq('id', id);
    setFactures(factures.map(f => f.id === id ? { ...f, statut } : f));
  }

  async function supprimerFacture(id) {
    await supabase.from('factures').delete().eq('id', id);
    setFactures(factures.filter(f => f.id !== id));
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
    setUser(null);
    setVoirLanding(true);
    setCommandes([]); setProduits([]); setFactures([]); setLivraisons([]);
  }

  const s = {
    wrap: { fontFamily: 'sans-serif', minHeight: '100vh', background: '#f5f5f5', maxWidth: '480px', margin: '0 auto' },
    nav: { background: '#fff', padding: '14px 20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
    logo: { margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' },
    bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', padding: '10px 0', zIndex: 10 },
    navBtn: { border: 'none', background: 'none', fontSize: '11px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '4px 8px', borderRadius: '8px', color: '#888' },
    navBtnActive: { border: 'none', background: '#f0faf6', fontSize: '11px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '4px 8px', borderRadius: '8px', color: '#1D9E75', fontWeight: '500' },
    page: { padding: '20px 16px 90px' },
    card: { background: '#fff', borderRadius: '12px', padding: '14px 16px', border: '1px solid #eee', marginBottom: '10px' },
    input: { flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', minWidth: '80px', background: '#fff' },
    btn: { padding: '8px 16px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
    btnSm: (bg, col) => ({ padding: '4px 10px', background: bg, color: col, border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }),
    row: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' },
    metricBtn: { background: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #eee', flex: 1, cursor: 'pointer', textAlign: 'left' },
    sectionTitle: { fontSize: '14px', fontWeight: '500', margin: '0 0 12px', color: '#111' },
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

  const badge = (bg, col, text) => (
    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: bg, color: col, whiteSpace: 'nowrap' }}>{text}</span>
  );

  const navItems = [
    { id: 'dashboard', label: 'Accueil', icon: '🏠' },
    { id: 'commandes', label: 'Ventes', icon: '🛒' },
    { id: 'catalogue', label: 'Stock', icon: '📦' },
    { id: 'facturation', label: 'Factures', icon: '🧾' },
    { id: 'livraison', label: 'Livraison', icon: '🚚' },
  ];

  if (voirLanding && !user) return <Landing onCommencer={() => setVoirLanding(false)} />;
  if (!user) return <Auth onConnexion={(u) => { setUser(u); chargerDonnees(u.id); }} />;

  if (loading) return (
    <div style={{ ...s.wrap, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '22px', fontWeight: '700', color: '#1D9E75', marginBottom: '8px' }}>LYNA</p>
        <p style={{ fontSize: '13px', color: '#888' }}>Chargement...</p>
      </div>
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={s.nav}>
        <h1 style={s.logo}><span style={{ color: '#1D9E75' }}>LY</span>NA</h1>
        <button onClick={deconnexion} style={{ fontSize: '12px', color: '#888', background: '#f5f5f5', padding: '4px 10px', borderRadius: '999px', border: 'none', cursor: 'pointer' }}>
          Déconnexion
        </button>
      </div>

      {page === 'dashboard' && (
        <div style={s.page}>
          <p style={{ fontSize: '13px', color: '#888', margin: '0 0 16px' }}>Bonjour, voici votre résumé</p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <button style={s.metricBtn} onClick={() => setPage('commandes')}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Commandes</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{commandes.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75' }}>total →</p>
            </button>
            <button style={s.metricBtn} onClick={() => setPage('catalogue')}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Produits</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{produits.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75' }}>au catalogue →</p>
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button style={s.metricBtn} onClick={() => setPage('facturation')}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Factures</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{factures.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#EF9F27' }}>{factures.filter(f => f.statut === 'En attente').length} en attente →</p>
            </button>
            <button style={s.metricBtn} onClick={() => setPage('livraison')}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Livraisons</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{livraisons.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75' }}>aujourd'hui →</p>
            </button>
          </div>

          {produits.filter(p => p.stock < 6).length > 0 && (
            <>
              <p style={s.sectionTitle}>Alertes stock</p>
              {produits.filter(p => p.stock < 6).map(p => (
                <div key={p.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid #E24B4A' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '500' }}>{p.nom}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Stock faible</p>
                  </div>
                  {badge('#FCEBEB', '#791F1F', 'Stock : ' + p.stock)}
                </div>
              ))}
            </>
          )}

          {commandes.length > 0 && (
            <>
              <p style={{ ...s.sectionTitle, marginTop: '16px' }}>Dernières ventes</p>
              {commandes.slice(0, 3).map(cmd => {
                const sc = statutColors[cmd.statut] || { bg: '#eee', col: '#555' };
                return (
                  <div key={cmd.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '500' }}>{cmd.client}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{cmd.montant} FCFA</p>
                    </div>
                    {badge(sc.bg, sc.col, cmd.statut)}
                  </div>
                );
              })}
            </>
          )}

          {commandes.length === 0 && produits.length === 0 && (
            <div style={{ ...s.card, textAlign: 'center', padding: '32px', color: '#888' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>Ajoutez vos premiers produits et commandes pour voir votre résumé ici</p>
            </div>
          )}
        </div>
      )}

      {page === 'commandes' && (
        <div style={s.page}>
          <div style={s.card}>
            <p style={s.sectionTitle}>Nouvelle vente</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Nom client" value={nomCmd} onChange={e => setNomCmd(e.target.value)} />
              <input style={s.input} placeholder="Montant FCFA" value={montantCmd} onChange={e => setMontantCmd(e.target.value)} />
              <button style={s.btn} onClick={ajouterCommande}>Ajouter</button>
            </div>
          </div>
          <p style={s.sectionTitle}>Registre des ventes ({commandes.length})</p>
          {commandes.length === 0 && <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>Aucune vente pour l'instant</p>}
          {commandes.map((cmd, i) => {
            const sc = statutColors[cmd.statut] || { bg: '#eee', col: '#555' };
            const date = new Date(cmd.created_at).toLocaleDateString('fr-FR');
            return (
              <div key={cmd.id} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '500' }}>#{commandes.length - i} — {cmd.client}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{cmd.montant} FCFA · {date}</p>
                  </div>
                  {badge(sc.bg, sc.col, cmd.statut)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {page === 'catalogue' && (
        <div style={s.page}>
          <div style={s.card}>
            <p style={s.sectionTitle}>Ajouter un produit</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Produit" value={nomProd} onChange={e => setNomProd(e.target.value)} />
              <input style={s.input} placeholder="Prix FCFA" value={prixProd} onChange={e => setPrixProd(e.target.value)} />
              <input style={{ ...s.input, maxWidth: '70px' }} placeholder="Stock" type="number" value={stockProd} onChange={e => setStockProd(e.target.value)} />
              <button style={s.btn} onClick={ajouterProduit}>+</button>
            </div>
          </div>
          <p style={s.sectionTitle}>Catalogue ({produits.length} produits)</p>
          {produits.length === 0 && <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>Aucun produit pour l'instant</p>}
          {produits.map(p => (
            <div key={p.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '500' }}>{p.nom}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#1D9E75', fontWeight: '500' }}>{p.prix} FCFA</p>
              </div>
              {badge(p.stock < 6 ? '#FCEBEB' : '#EAF3DE', p.stock < 6 ? '#791F1F' : '#27500A', (p.stock < 6 ? '⚠ ' : '') + 'Stock : ' + p.stock)}
            </div>
          ))}
        </div>
      )}

      {page === 'facturation' && (
        <div style={s.page}>
          <div style={s.card}>
            <p style={s.sectionTitle}>Nouvelle facture</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Client" value={clientFac} onChange={e => setClientFac(e.target.value)} />
              <input style={s.input} placeholder="Montant FCFA" value={montantFac} onChange={e => setMontantFac(e.target.value)} />
              <select style={{ ...s.input, maxWidth: '130px' }} value={moyenFac} onChange={e => setMoyenFac(e.target.value)}>
                <option>Wave</option>
                <option>Orange Money</option>
                <option>Mobile Money</option>
                <option>Espèces</option>
              </select>
              <button style={s.btn} onClick={ajouterFacture}>Créer</button>
            </div>
          </div>
          <p style={s.sectionTitle}>Factures ({factures.length})</p>
          {factures.length === 0 && <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>Aucune facture pour l'instant</p>}
          {factures.map(f => {
            const sc = statutColors[f.statut] || { bg: '#eee', col: '#555' };
            const date = new Date(f.created_at).toLocaleDateString('fr-FR');
            return (
              <div key={f.id} style={{ ...s.card, borderLeft: f.statut === 'En retard' ? '3px solid #E24B4A' : '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '500' }}>{f.client}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{f.montant} FCFA · {f.moyen} · {date}</p>
                  </div>
                  {badge(sc.bg, sc.col, f.statut)}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {f.statut !== 'Réglé' && (
                    <button style={s.btnSm('#EAF3DE', '#27500A')} onClick={() => majFacture(f.id, 'Réglé')}>Réglé</button>
                  )}
                  {f.statut === 'En attente' && (
                    <button style={s.btnSm('#FAEEDA', '#633806')} onClick={() => majFacture(f.id, 'En retard')}>Marquer en retard</button>
                  )}
                  <button style={s.btnSm('#FCEBEB', '#791F1F')} onClick={() => supprimerFacture(f.id)}>Supprimer</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {page === 'livraison' && (
        <div style={s.page}>
          <div style={s.card}>
            <p style={s.sectionTitle}>Nouvelle livraison</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Destination" value={destLiv} onChange={e => setDestLiv(e.target.value)} />
              <input style={s.input} placeholder="Chauffeur" value={chauffeurLiv} onChange={e => setChauffeurLiv(e.target.value)} />
              <input style={{ ...s.input, maxWidth: '90px' }} placeholder="Heure" value={heureLiv} onChange={e => setHeureLiv(e.target.value)} />
              <button style={s.btn} onClick={ajouterLivraison}>+</button>
            </div>
          </div>
          <p style={s.sectionTitle}>Livraisons ({livraisons.length})</p>
          {livraisons.length === 0 && <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>Aucune livraison pour l'instant</p>}
          {livraisons.map(l => {
            const sc = statutColors[l.statut] || { bg: '#eee', col: '#555' };
            return (
              <div key={l.id} style={{ ...s.card, borderLeft: l.statut === 'En retard' ? '3px solid #E24B4A' : '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '500' }}>{l.destination}</p>
                    <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#888' }}>Chauffeur : {l.chauffeur}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Heure : {l.heure}</p>
                  </div>
                  {badge(sc.bg, sc.col, l.statut)}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {l.statut !== 'Livré' && (
                    <button style={s.btnSm('#EAF3DE', '#27500A')} onClick={() => majLivraison(l.id, 'Livré')}>Livré</button>
                  )}
                  {l.statut === 'En attente' && (
                    <button style={s.btnSm('#E6F1FB', '#0C447C')} onClick={() => majLivraison(l.id, 'En route')}>En route</button>
                  )}
                  {l.statut !== 'En retard' && l.statut !== 'Livré' && (
                    <button style={s.btnSm('#FAEEDA', '#633806')} onClick={() => majLivraison(l.id, 'En retard')}>En retard</button>
                  )}
                  {l.statut === 'Livré' && (
                    <button style={s.btnSm('#FCEBEB', '#791F1F')} onClick={() => supprimerLivraison(l.id)}>Supprimer</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={s.bottomNav}>
        {navItems.map(item => (
          <button key={item.id} style={page === item.id ? s.navBtnActive : s.navBtn} onClick={() => setPage(item.id)}>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;