import React, { useState } from 'react';
import { supabase } from './supabase';

function Auth({ onConnexion }) {
  const [mode, setMode] = useState('connexion');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [nomBoutique, setNomBoutique] = useState('');
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(false);

  const s = {
    wrap: { fontFamily: 'sans-serif', minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card: { background: '#fff', borderRadius: '16px', padding: '32px 24px', border: '1px solid #eee', width: '100%', maxWidth: '400px' },
    logo: { textAlign: 'center', marginBottom: '24px' },
    input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box', background: '#fff' },
    btn: { width: '100%', padding: '12px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' },
    switch: { textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#888' },
    switchLink: { color: '#1D9E75', cursor: 'pointer', fontWeight: '500' },
    message: { fontSize: '12px', padding: '10px', borderRadius: '8px', marginBottom: '12px', textAlign: 'center' },
  };

  async function handleConnexion() {
    if (!email || !motDePasse) return setMessage('Remplis tous les champs');
    setChargement(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
    if (error) { setMessage('Email ou mot de passe incorrect'); setChargement(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) onConnexion(user);
    setChargement(false);
  }

  async function handleInscription() {
    if (!email || !motDePasse || !nomBoutique) return setMessage('Remplis tous les champs');
    if (motDePasse.length < 6) return setMessage('Mot de passe minimum 6 caractères');
    setChargement(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
      options: { data: { nom_boutique: nomBoutique } }
    });
    if (error) setMessage('Erreur : ' + error.message);
    else setMessage('Compte créé ! Tu peux te connecter maintenant.');
    setChargement(false);
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>
          <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '700' }}>
            <span style={{ color: '#1D9E75' }}>LY</span>NA
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>
            {mode === 'connexion' ? 'Connecte-toi à ta boutique' : 'Crée ton compte boutique'}
          </p>
        </div>

        {message && (
          <div style={{ ...s.message, background: message.includes('créé') ? '#EAF3DE' : '#FCEBEB', color: message.includes('créé') ? '#27500A' : '#791F1F' }}>
            {message}
          </div>
        )}

        {mode === 'inscription' && (
          <input
            style={s.input}
            type="text"
            placeholder="Nom de ta boutique"
            value={nomBoutique}
            onChange={e => setNomBoutique(e.target.value)}
          />
        )}

        <input
          style={s.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          style={s.input}
          type="password"
          placeholder="Mot de passe"
          value={motDePasse}
          onChange={e => setMotDePasse(e.target.value)}
        />

        <button
          style={{ ...s.btn, opacity: chargement ? 0.7 : 1 }}
          onClick={mode === 'connexion' ? handleConnexion : handleInscription}
          disabled={chargement}
        >
          {chargement ? 'Chargement...' : mode === 'connexion' ? 'Se connecter' : "Créer mon compte"}
        </button>

        <div style={s.switch}>
          {mode === 'connexion' ? (
            <span>Pas encore de compte ? <span style={s.switchLink} onClick={() => { setMode('inscription'); setMessage(''); }}>S'inscrire</span></span>
          ) : (
            <span>Déjà un compte ? <span style={s.switchLink} onClick={() => { setMode('connexion'); setMessage(''); }}>Se connecter</span></span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;