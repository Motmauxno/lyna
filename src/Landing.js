import React, { useState } from 'react';

function Landing({ onCommencer }) {
  const [email, setEmail] = useState('');
  const [inscrit, setInscrit] = useState(false);

  const s = {
    wrap: { fontFamily: 'sans-serif', background: '#fff', minHeight: '100vh' },
    nav: { padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' },
    hero: { padding: '60px 24px 40px', textAlign: 'center', background: '#f9fffe' },
    section: { padding: '40px 24px' },
    card: { background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '24px', marginBottom: '16px' },
    btn: { padding: '14px 28px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', cursor: 'pointer', fontWeight: '500' },
    btnOutline: { padding: '10px 20px', background: 'transparent', color: '#1D9E75', border: '1.5px solid #1D9E75', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },
    input: { flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', minWidth: '200px' },
    tag: { display: 'inline-block', background: '#E1F5EE', color: '#085041', fontSize: '12px', padding: '4px 12px', borderRadius: '999px', marginBottom: '16px' },
    prix: { background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '24px', marginBottom: '12px' },
    prixActive: { background: '#f9fffe', border: '2px solid #1D9E75', borderRadius: '16px', padding: '24px', marginBottom: '12px' },
  };

  const fonctionnalites = [
    { icon: '📦', titre: 'Gestion des stocks', desc: 'Suivez vos produits en temps réel avec alertes automatiques quand le stock est faible.' },
    { icon: '🛒', titre: 'Ventes et commandes', desc: 'Enregistrez chaque vente en quelques secondes. Historique complet accessible partout.' },
    { icon: '🧾', titre: 'Facturation Wave & OM', desc: 'Créez des factures professionnelles et acceptez les paiements Wave et Orange Money.' },
    { icon: '🚚', titre: 'Suivi des livraisons', desc: 'Gérez vos chauffeurs et suivez chaque livraison en temps réel.' },
    { icon: '📊', titre: 'Dashboard intelligent', desc: "Voyez d'un coup d'œil vos revenus, commandes et alertes importantes." },
    { icon: '🔐', titre: 'Données sécurisées', desc: 'Chaque boutique a son espace privé. Vos données ne sont visibles que par vous.' },
  ];

  return (
    <div style={s.wrap}>
      <div style={s.nav}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>
          <span style={{ color: '#1D9E75' }}>LY</span>NA
        </h1>
        <button style={s.btnOutline} onClick={onCommencer}>Se connecter</button>
      </div>

      <div style={s.hero}>
        <span style={s.tag}>Application mobile et ordinateur</span>
        <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 16px', lineHeight: 1.3, color: '#111' }}>
          Gérez votre boutique<br />
          <span style={{ color: '#1D9E75' }}>depuis votre téléphone</span>
        </h2>
        <p style={{ fontSize: '15px', color: '#666', margin: '0 0 32px', lineHeight: 1.6 }}>
          LYNA est la première application africaine tout-en-un pour les commerçants. Stock, ventes, factures et livraisons — tout au même endroit.
        </p>
        <button style={{ ...s.btn, fontSize: '16px', padding: '16px 36px' }} onClick={onCommencer}>
          Commencer gratuitement
        </button>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '12px' }}>
          Aucune carte bancaire requise · Gratuit 30 jours
        </p>
      </div>

      <div style={{ background: '#f5f5f5', padding: '16px 24px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {['Restaurants', 'Boutiques', 'Pharmacies', 'Import/Export', 'Entrepôts'].map(s => (
          <span key={s} style={{ background: '#fff', border: '1px solid #eee', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', whiteSpace: 'nowrap', color: '#555' }}>{s}</span>
        ))}
      </div>

      <div style={s.section}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px', color: '#111' }}>Tout ce dont vous avez besoin</h3>
        {fonctionnalites.map(f => (
          <div key={f.titre} style={s.card}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '24px' }}>{f.icon}</span>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: '#111' }}>{f.titre}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, background: '#f9fffe' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px', color: '#111' }}>Tarifs simples</h3>
        <p style={{ fontSize: '13px', color: '#888', margin: '0 0 20px' }}>Pas de surprise, pas de frais cachés</p>

        <div style={s.prix}>
          <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: '#111' }}>Starter</p>
          <p style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '700', color: '#111' }}>5 000 <span style={{ fontSize: '14px', fontWeight: '400', color: '#888' }}>FCFA/mois</span></p>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#666' }}>Pour les petites boutiques</p>
          {['Stock jusqu\'à 50 produits', 'Commandes illimitées', 'Facturation basique'].map(f => (
            <p key={f} style={{ margin: '0 0 6px', fontSize: '13px', color: '#555' }}>✓ {f}</p>
          ))}
        </div>

        <div style={s.prixActive}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111' }}>Pro</p>
            <span style={{ background: '#1D9E75', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '999px' }}>Populaire</span>
          </div>
          <p style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '700', color: '#1D9E75' }}>15 000 <span style={{ fontSize: '14px', fontWeight: '400', color: '#888' }}>FCFA/mois</span></p>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#666' }}>Pour les PME en croissance</p>
          {['Stock illimité', 'Commandes illimitées', 'Facturation Wave & OM', 'Gestion livraisons', 'Support prioritaire'].map(f => (
            <p key={f} style={{ margin: '0 0 6px', fontSize: '13px', color: '#555' }}>✓ {f}</p>
          ))}
        </div>
      </div>

      <div style={{ ...s.section, textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px', color: '#111' }}>Prêt à commencer ?</h3>
        <p style={{ fontSize: '13px', color: '#888', margin: '0 0 20px' }}>Rejoignez les commerçants qui gèrent leur boutique avec LYNA</p>
        {inscrit ? (
          <div style={{ background: '#EAF3DE', border: '1px solid #9FE1CB', borderRadius: '12px', padding: '16px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#085041', fontWeight: '500' }}>Merci ! On vous contacte très bientôt.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input style={s.input} type="email" placeholder="Votre email" value={email} onChange={e => setEmail(e.target.value)} />
            <button style={s.btn} onClick={() => { if (email) setInscrit(true); }}>Je m'inscris</button>
          </div>
        )}
      </div>

      <div style={{ padding: '24px', borderTop: '1px solid #eee', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>© 2026 LYNA · Fait avec ❤️ pour l'Afrique</p>
      </div>
    </div>
  );
}

export default Landing;