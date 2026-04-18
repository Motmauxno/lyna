import React, { useState } from 'react';

function App() {
  const [page, setPage] = useState('dashboard');

  const [commandes, setCommandes] = useState([
    { id: '#143', client: 'Fatou Ba', montant: '7 000', statut: 'Nouveau', couleur: '#0C447C', bg: '#E6F1FB' },
    { id: '#142', client: 'Moussa Diop', montant: '3 500', statut: 'En prép.', couleur: '#633806', bg: '#FAEEDA' },
    { id: '#141', client: 'Aïssatou N.', montant: '6 500', statut: 'Livré', couleur: '#27500A', bg: '#EAF3DE' },
  ]);

  const [produits, setProduits] = useState([
    { id: 1, nom: 'Thiéboudienne', prix: '3 500', stock: 12 },
    { id: 2, nom: 'Yassa poulet', prix: '3 000', stock: 8 },
    { id: 3, nom: 'Mafé', prix: '3 500', stock: 3 },
    { id: 4, nom: 'Bissap', prix: '500', stock: 30 },
  ]);

  const [factures, setFactures] = useState([
    { id: 'FAC-001', client: 'Boutique Sow', montant: '45 000', statut: 'Payé', moyen: 'Wave' },
    { id: 'FAC-002', client: 'Import Diallo', montant: '120 000', statut: 'En attente', moyen: 'Orange Money' },
    { id: 'FAC-003', client: 'Pharma Plus', montant: '78 000', statut: 'En retard', moyen: 'Mobile Money' },
  ]);

  const [livraisons, setLivraisons] = useState([
    { id: 'LIV-01', destination: 'Plateau, Dakar', chauffeur: 'Ibou D.', statut: 'En route', heure: '14:30' },
    { id: 'LIV-02', destination: 'Almadies', chauffeur: 'Cheikh N.', statut: 'Livré', heure: '13:15' },
    { id: 'LIV-03', destination: 'Pikine', chauffeur: 'Modou F.', statut: 'En attente', heure: '16:00' },
  ]);

  const [nomCmd, setNomCmd] = useState('');
  const [montantCmd, setMontantCmd] = useState('');
  const [nomProd, setNomProd] = useState('');
  const [prixProd, setPrixProd] = useState('');
  const [stockProd, setStockProd] = useState('');
  const [clientFac, setClientFac] = useState('');
  const [montantFac, setMontantFac] = useState('');
  const [moyenFac, setMoyenFac] = useState('Wave');

  function ajouterCommande() {
    if (!nomCmd || !montantCmd) return;
    const nouvelle = {
      id: '#' + (parseInt(commandes[0].id.slice(1)) + 1),
      client: nomCmd, montant: montantCmd,
      statut: 'Nouveau', couleur: '#0C447C', bg: '#E6F1FB'
    };
    setCommandes([nouvelle, ...commandes]);
    setNomCmd(''); setMontantCmd('');
  }

  function ajouterProduit() {
    if (!nomProd || !prixProd) return;
    setProduits([...produits, { id: produits.length + 1, nom: nomProd, prix: prixProd, stock: parseInt(stockProd) || 0 }]);
    setNomProd(''); setPrixProd(''); setStockProd('');
  }

  function ajouterFacture() {
    if (!clientFac || !montantFac) return;
    const num = 'FAC-00' + (factures.length + 1);
    setFactures([{ id: num, client: clientFac, montant: montantFac, statut: 'En attente', moyen: moyenFac }, ...factures]);
    setClientFac(''); setMontantFac('');
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
    badge: (bg, col) => ({ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: bg, color: col, whiteSpace: 'nowrap' }),
    metric: { background: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #eee', flex: 1 },
    sectionTitle: { fontSize: '14px', fontWeight: '500', margin: '0 0 12px', color: '#111' },
  };

  const navItems = [
    { id: 'dashboard', label: 'Accueil', icon: '⊞' },
    { id: 'commandes', label: 'Ventes', icon: '◎' },
    { id: 'catalogue', label: 'Stock', icon: '▦' },
    { id: 'facturation', label: 'Factures', icon: '◈' },
    { id: 'livraison', label: 'Livraison', icon: '⬡' },
  ];

  const statutColors = {
    'Nouveau': { bg: '#E6F1FB', col: '#0C447C' },
    'En prép.': { bg: '#FAEEDA', col: '#633806' },
    'Livré': { bg: '#EAF3DE', col: '#27500A' },
    'Payé': { bg: '#EAF3DE', col: '#27500A' },
    'En attente': { bg: '#FAEEDA', col: '#633806' },
    'En retard': { bg: '#FCEBEB', col: '#791F1F' },
    'En route': { bg: '#E6F1FB', col: '#0C447C' },
  };

  return (
    <div style={s.wrap}>
      <div style={s.nav}>
        <h1 style={s.logo}><span style={{ color: '#1D9E75' }}>LY</span>NA</h1>
        <span style={{ fontSize: '12px', color: '#888', background: '#f5f5f5', padding: '4px 10px', borderRadius: '999px' }}>Chez Aminata</span>
      </div>

      {/* DASHBOARD */}
      {page === 'dashboard' && (
        <div style={s.page}>
          <p style={{ fontSize: '13px', color: '#888', margin: '0 0 16px' }}>Bonjour Aminata, voici votre résumé</p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <div style={s.metric}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Revenus</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111' }}>847 500</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75' }}>FCFA ce mois</p>
            </div>
            <div style={s.metric}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Commandes</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111' }}>{commandes.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75' }}>ce mois</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={s.metric}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Factures</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111' }}>{factures.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#EF9F27' }}>dont 1 en retard</p>
            </div>
            <div style={s.metric}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888' }}>Livraisons</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111' }}>{livraisons.length}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75' }}>aujourd'hui</p>
            </div>
          </div>

          <p style={s.sectionTitle}>Alertes stock</p>
          {produits.filter(p => p.stock < 6).map(p => (
            <div key={p.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid #E24B4A' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '500' }}>{p.nom}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Stock faible</p>
              </div>
              <span style={s.badge('#FCEBEB', '#791F1F')}>Stock : {p.stock}</span>
            </div>
          ))}

          <p style={{ ...s.sectionTitle, marginTop: '16px' }}>Dernières commandes</p>
          {commandes.slice(0, 3).map(cmd => (
            <div key={cmd.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '500' }}>{cmd.client}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{cmd.montant} FCFA</p>
              </div>
              <span style={s.badge(cmd.bg, cmd.couleur)}>{cmd.statut}</span>
            </div>
          ))}
        </div>
      )}

      {/* COMMANDES */}
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
          {commandes.map(cmd => (
            <div key={cmd.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '500' }}>{cmd.id} — {cmd.client}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{cmd.montant} FCFA</p>
              </div>
              <span style={s.badge(cmd.bg, cmd.couleur)}>{cmd.statut}</span>
            </div>
          ))}
        </div>
      )}

      {/* CATALOGUE / STOCK */}
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
          {produits.map(p => (
            <div key={p.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '500' }}>{p.nom}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#1D9E75', fontWeight: '500' }}>{p.prix} FCFA</p>
              </div>
              <span style={s.badge(p.stock < 6 ? '#FCEBEB' : '#EAF3DE', p.stock < 6 ? '#791F1F' : '#27500A')}>
                {p.stock < 6 ? '⚠ ' : ''}Stock : {p.stock}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* FACTURATION */}
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
          {factures.map(f => {
            const sc = statutColors[f.statut] || { bg: '#eee', col: '#555' };
            return (
              <div key={f.id} style={{ ...s.card, borderLeft: f.statut === 'En retard' ? '3px solid #E24B4A' : '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '500' }}>{f.id} — {f.client}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{f.montant} FCFA · {f.moyen}</p>
                  </div>
                  <span style={s.badge(sc.bg, sc.col)}>{f.statut}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIVRAISON */}
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
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Heure prévue : {l.heure}</p>
                  </div>
                  <span style={s.badge(sc.bg, sc.col)}>{l.statut}</span>
                </div>
              </div>
            );
          })}
          <div style={{ ...s.card, background: '#f0faf6', border: '1px solid #9FE1CB', marginTop: '16px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '500', color: '#085041' }}>Prochaine étape</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#085041' }}>Le tracking GPS en temps réel arrive dans la version 2.0 de LYNA</p>
          </div>
        </div>
      )}

      {/* Barre de navigation mobile */}
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