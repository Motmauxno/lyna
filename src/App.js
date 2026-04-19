import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Auth from './Auth';

function App() {
  const [page, setPage] = useState('dashboard');
  const [commandes, setCommandes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [nomCmd, setNomCmd] = useState('');
  const [montantCmd, setMontantCmd] = useState('');
  const [nomProd, setNomProd] = useState('');
  const [prixProd, setPrixProd] = useState('');
  const [stockProd, setStockProd] = useState('');
  const [clientFac, setClientFac] = useState('');
  const [montantFac, setMontantFac] = useState('');
  const [moyenFac, setMoyenFac] = useState('Wave');

  const livraisons = [
    { id: 'LIV-01', destination: 'Plateau, Dakar', chauffeur: 'Ibou D.', statut: 'En route', heure: '14:30' },
    { id: 'LIV-02', destination: 'Almadies', chauffeur: 'Cheikh N.', statut: 'Livré', heure: '13:15' },
    { id: 'LIV-03', destination: 'Pikine', chauffeur: 'Modou F.', statut: 'En attente', heure: '16:00' },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) chargerDonnees(session.user.id);
      else setLoading(false);
    });
  }, []);

  async function chargerDonnees(uid) {
    setLoading(true);
    const id = uid || user?.id;
    const { data: cmds } = await supabase.from('commandes').select('*').eq('user_id', id).order('created_at', { ascending: false });
    const { data: prods } = await supabase.from('produits').select('*').eq('user_id', id).order('created_at', { ascending: false });
    const { data: facts } = await supabase.from('factures').select('*').eq('user_id', id).order('created_at', { ascending: false });
    if (cmds) setCommandes(cmds);
    if (prods) setProduits(prods);
    if (facts) setFactures(facts);
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

  async function deconnexion() {
    await supabase.auth.signOut();
    setUser(null);
    setCommandes([]); setProduits([]); setFactures([]);
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
    row: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' },
    metric: { background: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #eee', flex: 1 },
    sectionTitle: { fontSize: '14px', fontWeight: '500', margin: '0 0 12px', color: '#111' },
  };

  const statutColors = {
    'Nouveau': { bg: '#E6F1FB', col: '#0C447C' },
    'En prép.': { bg: '#FAEEDA', col: '#633806' },
    'Livré': { bg: '#EAF3DE', col: '#27500A' },
    'Payé': { bg: '#EAF3DE', col: '#27500A' },
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
            <div style={s.metric}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Commandes</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{commandes.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75' }}>total</p>
            </div>
            <div style={s.metric}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Produits</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{produits.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75' }}>au catalogue</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={s.metric}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Factures</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{factures.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#EF9F27' }}>{factures.filter(f => f.statut === 'En retard').length} en retard</p>
            </div>
            <div style={s.metric}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Livraisons</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{livraisons.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75' }}>aujourd'hui</p>
            </div>
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
              <p style={{ ...s.sectionTitle, marginTop: '16px' }}>Dernières commandes</p>
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
          <p style={s.sectionTitle}>Toutes les ventes ({commandes.length})</p>
          {commandes.length === 0 && <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>Aucune vente pour l'instant</p>}
          {commandes.map(cmd => {
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
            return (
              <div key={f.id} style={{ ...s.card, borderLeft: f.statut === 'En retard' ? '3px solid #E24B4A' : '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '500' }}>{f.client}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{f.montant} FCFA · {f.moyen}</p>
                  </div>
                  {badge(sc.bg, sc.col, f.statut)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {page === 'livraison' && (
        <div style={s.page}>
          <p style={s.sectionTitle}>Livraisons du jour</p>
          {livraisons.map(l => {
            const sc = statutColors[l.statut] || { bg: '#eee', col: '#555' };
            return (
              <div key={l.id} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '500' }}>{l.id} — {l.destination}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#888' }}>Chauffeur : {l.chauffeur}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Heure : {l.heure}</p>
                  </div>
                  {badge(sc.bg, sc.col, l.statut)}
                </div>
              </div>
            );
          })}
          <div style={{ ...s.card, background: '#f0faf6', border: '1px solid #9FE1CB', marginTop: '8px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '500', color: '#085041' }}>Prochaine version</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#085041' }}>Tracking GPS en temps réel dans LYNA 2.0</p>
          </div>
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