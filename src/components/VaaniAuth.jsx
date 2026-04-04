import React, { useEffect, useRef, useState } from 'react'
import '../vaaniauth.css'

const PHRASES = [
  'My voice is my passport',
  'Authorize this transaction now',
  'VaaniAuth security check',
]

export default function VaaniAuth() {
  const [screen, setScreen] = useState('s-welcome')
  const regTimerRef = useRef(null)
  const regStepRef = useRef(0)
  const [regStep, setRegStep] = useState(0)
  const [regRecording, setRegRecording] = useState(false)
  const [loginRecording, setLoginRecording] = useState(false)
  const [payRecording, setPayRecording] = useState(false)

  useEffect(() => {
    buildWave('reg-wave', 16, false)
    buildWave('login-wave', 18, false)
    buildWave('pay-wave', 18, false)
    buildWave('proc-wave', 14, true)
    resetReg()
    // cleanup
    return () => {
      clearTimeout(regTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (screen === 's-register') resetReg()
    if (screen === 's-login') resetLogin()
    if (screen === 's-payment') resetPayment()
    if (screen === 's-success') spawnConfetti('confetti-zone')
    if (screen === 's-pay-success') spawnConfetti('pay-confetti')
  }, [screen])

  function go(id) {
    setScreen(id)
  }

  function buildWave(containerId, count, color) {
    const el = document.getElementById(containerId)
    if (!el) return
    el.innerHTML = ''
    for (let i = 0; i < count; i++) {
      const b = document.createElement('div')
      b.className = 'wave-bar' + (color ? ' teal' : '')
      b.style.height = 8 + Math.random() * 20 + 'px'
      el.appendChild(b)
    }
  }

  function animateWave(containerId, active) {
    const el = document.getElementById(containerId)
    if (!el) return
    el.querySelectorAll('.wave-bar').forEach((b, i) => {
      if (active) {
        b.style.animationDelay = i * 0.06 + 's'
        b.classList.add('active')
      } else {
        b.classList.remove('active')
        b.style.height = 8 + Math.random() * 12 + 'px'
      }
    })
  }

  function resetReg() {
    regStepRef.current = 0
    setRegStep(0)
    setRegRecording(false)
    clearTimeout(regTimerRef.current)
    for (let i = 0; i < 3; i++) {
      const pc = document.getElementById('pc' + i)
      const pn = document.getElementById('pn' + i)
      if (pc) pc.className = 'phrase-card' + (i === 0 ? ' active' : '')
      if (pn) pn.className = 'phrase-num' + (i === 0 ? ' active' : '')
      if (pn) pn.textContent = i + 1
      const dots = ['dot0', 'dot1', 'dot2']
      const d = document.getElementById(dots[i])
      if (d) d.className = 'dot' + (i === 0 ? ' active' : '')
    }
    const regPhrase = document.getElementById('reg-phrase')
    if (regPhrase) regPhrase.textContent = '"' + PHRASES[0] + '"'
    const regStatus = document.getElementById('reg-status')
    if (regStatus) {
      regStatus.textContent = 'Ready to record'
      regStatus.className = 'badge badge-blue'
    }
    const btn = document.getElementById('reg-btn')
    if (btn) btn.textContent = 'Start Recording'
    animateWave('reg-wave', false)
  }

  function startRegPhrase() {
    if (regRecording) return
    // if already finished all phrases, complete registration
    if (regStepRef.current >= 3) {
      showProcessing('Registering Voice...', 'Saving voiceprint securely', 1800, () => go('s-success'))
      return
    }
    setRegRecording(true)
    const btn = document.getElementById('reg-btn')
    if (btn) {
      btn.textContent = 'Recording...'
      btn.disabled = true
    }
    const regStatus = document.getElementById('reg-status')
    if (regStatus) {
      regStatus.textContent = 'Listening...'
      regStatus.className = 'badge badge-red'
    }
    animateWave('reg-wave', true)
    regTimerRef.current = setTimeout(() => {
      animateWave('reg-wave', false)
      const pc = document.getElementById('pc' + regStepRef.current)
      const pn = document.getElementById('pn' + regStepRef.current)
      if (pc) pc.className = 'phrase-card done'
      if (pn) pn.className = 'phrase-num done'
      if (pn) pn.innerHTML = '<span class="check">✓</span>'
      const dots = ['dot0', 'dot1', 'dot2']
      const d = document.getElementById(dots[regStepRef.current])
      if (d) d.className = 'dot done'
      regStepRef.current++
      setRegStep(regStepRef.current)
      setRegRecording(false)
      if (btn) btn.disabled = false
      if (regStepRef.current < 3) {
        const pc2 = document.getElementById('pc' + regStepRef.current)
        const pn2 = document.getElementById('pn' + regStepRef.current)
        if (pc2) pc2.className = 'phrase-card active'
        if (pn2) pn2.className = 'phrase-num active'
        const d2 = document.getElementById(dots[regStepRef.current])
        if (d2) d2.className = 'dot active'
        const regPhrase2 = document.getElementById('reg-phrase')
        if (regPhrase2) regPhrase2.textContent = '"' + PHRASES[regStepRef.current] + '"'
        const regStatus2 = document.getElementById('reg-status')
        if (regStatus2) {
          regStatus2.textContent = 'Phrase ' + regStepRef.current + ' of 3 saved'
          regStatus2.className = 'badge badge-teal'
        }
        if (btn) btn.textContent = 'Record Phrase ' + (regStepRef.current + 1)
      } else {
        const regStatus3 = document.getElementById('reg-status')
        if (regStatus3) {
          regStatus3.textContent = 'All phrases recorded!'
          regStatus3.className = 'badge badge-teal'
        }
        if (btn) btn.textContent = 'Complete Registration'
      }
    }, 2200)
  }

  function resetLogin() {
    setLoginRecording(false)
    const mic = document.getElementById('login-mic')
    const ring = document.getElementById('login-ring')
    if (mic) mic.className = 'mic-btn'
    if (ring) ring.className = 'mic-ring'
    const st = document.getElementById('login-status')
    if (st) {
      st.textContent = 'Tap mic to begin'
      st.className = 'badge badge-blue'
    }
    animateWave('login-wave', false)
  }

  function startLogin() {
    if (loginRecording) return
    setLoginRecording(true)
    const mic = document.getElementById('login-mic')
    const ring = document.getElementById('login-ring')
    if (mic) mic.className = 'mic-btn recording'
    if (ring) ring.className = 'mic-ring recording'
    const st = document.getElementById('login-status')
    if (st) {
      st.textContent = 'Listening...'
      st.className = 'badge badge-red'
    }
    animateWave('login-wave', true)
    setTimeout(() => {
      animateWave('login-wave', false)
      showProcessing('Analyzing Voice...', 'Running biometric match', 2000, () => go('s-success'))
    }, 2000)
  }

  function resetPayment() {
    setPayRecording(false)
    const mic = document.getElementById('pay-mic')
    const ring = document.getElementById('pay-ring')
    if (mic) mic.className = 'mic-btn'
    if (ring) ring.className = 'mic-ring'
    const st = document.getElementById('pay-status')
    if (st) {
      st.textContent = 'Tap mic to confirm'
      st.className = 'badge badge-blue'
    }
    animateWave('pay-wave', false)
  }

  function startPayment() {
    if (payRecording) return
    setPayRecording(true)
    const mic = document.getElementById('pay-mic')
    const ring = document.getElementById('pay-ring')
    if (mic) mic.className = 'mic-btn recording'
    if (ring) ring.className = 'mic-ring recording'
    const st = document.getElementById('pay-status')
    if (st) {
      st.textContent = 'Authorizing...'
      st.className = 'badge badge-red'
    }
    animateWave('pay-wave', true)
    setTimeout(() => {
      animateWave('pay-wave', false)
      showProcessing('Authorizing Payment...', 'Voice confirmation in progress', 2200, () => go('s-pay-success'))
    }, 2000)
  }

  function showProcessing(title, sub, duration, callback) {
    const overlay = document.getElementById('processing')
    const t = document.getElementById('proc-title')
    const s = document.getElementById('proc-sub')
    if (t) t.textContent = title
    if (s) s.textContent = sub
    if (overlay) overlay.style.display = 'flex'
    animateWave('proc-wave', true)
    setTimeout(() => {
      animateWave('proc-wave', false)
      if (overlay) overlay.style.display = 'none'
      callback()
    }, duration)
  }

  function spawnConfetti(containerId) {
    const container = document.getElementById(containerId)
    if (!container) return
    container.innerHTML = ''
    const colors = ['#2580ff', '#00c9a7', '#f59e0b', '#ff4d6a', '#6aaeff', '#00e5b8']
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div')
      p.className = 'confetti-piece'
      p.style.left = 5 + Math.random() * 90 + '%'
      p.style.top = '-10px'
      p.style.background = colors[Math.floor(Math.random() * colors.length)]
      p.style.animationDelay = Math.random() * 0.8 + 's'
      p.style.animationDuration = 1.5 + Math.random() * 1 + 's'
      p.style.width = 6 + Math.random() * 6 + 'px'
      p.style.height = 6 + Math.random() * 6 + 'px'
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
      container.appendChild(p)
    }
  }

  return (
    <div className="app" id="app">
      {/* SCREEN 1: WELCOME */}
      <div className={`screen ${screen !== 's-welcome' ? 'hidden' : ''}`} id="s-welcome">
        <div className="status-bar"><div className="status-icons"><div className="status-dot"></div><div className="status-dot"></div><div className="status-dot"></div></div></div>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:28}}>
          <div style={{width:80,height:80,borderRadius:24,background:'linear-gradient(145deg,#0e2a56,var(--navy3))',border:'0.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:24,position:'relative'}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            <div style={{position:'absolute',top:-4,right:-4,width:18,height:18,borderRadius:'50%',background:'var(--teal)',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div>
          </div>
          <div style={{fontFamily:'Syne',fontSize:13,fontWeight:700,letterSpacing:3,color:'var(--teal)',textTransform:'uppercase',textAlign:'center',marginBottom:12}}>VaaniAuth</div>
          <div style={{fontFamily:'Syne',fontSize:32,fontWeight:800,textAlign:'center',lineHeight:1.1,color:'var(--text)',marginBottom:12}}>Your Voice.<br/>Your Bank.</div>
          <div style={{fontSize:15,color:'var(--text2)',textAlign:'center',lineHeight:1.6,maxWidth:280}}>Advanced voice biometrics for secure, passwordless banking authentication.</div>
          <div style={{display:'flex',gap:8,alignItems:'center',marginTop:28}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'var(--teal)'}}></div>
            <span style={{fontSize:12,color:'var(--text2)'}}>256-bit voice encryption</span>
            <div style={{width:6,height:6,borderRadius:'50%',background:'var(--blue2)'}}></div>
            <span style={{fontSize:12,color:'var(--text2)'}}>Zero-knowledge auth</span>
          </div>
        </div>
        <div className="bottom">
          <button className="btn btn-primary" onClick={() => go('s-register')}>Register Voice</button>
          <button className="btn btn-ghost" style={{marginTop:10}} onClick={() => go('s-login')}>Sign In</button>
        </div>
      </div>

      {/* SCREEN 2: VOICE REGISTRATION */}
      <div className={`screen ${screen !== 's-register' ? 'hidden' : ''}`} id="s-register">
        <div className="status-bar"><div className="status-icons"></div></div>
        <div className="header">
          <button className="back-btn" onClick={() => go('s-welcome')}><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>Back</button>
          <div className="brand" style={{marginTop:14}}>Step 1 of 3</div>
          <div className="page-title">Voice Registration</div>
          <div className="page-sub">Say each phrase clearly when prompted</div>
        </div>
        <div className="content">
          <div className="step-dots" id="reg-dots">
            <div className="dot active" id="dot0"></div>
            <div className="dot" id="dot1"></div>
            <div className="dot" id="dot2"></div>
          </div>
          <div style={{height:16}} />
          <div className="phrase-card" id="pc0">
            <div className="phrase-num active" id="pn0">1</div>
            <div className="phrase-text"><strong>"My voice is my passport"</strong>Primary authentication phrase</div>
          </div>
          <div className="phrase-card" id="pc1">
            <div className="phrase-num" id="pn1">2</div>
            <div className="phrase-text"><strong>"Authorize this transaction now"</strong>Payment confirmation phrase</div>
          </div>
          <div className="phrase-card" id="pc2">
            <div className="phrase-num" id="pn2">3</div>
            <div className="phrase-text"><strong>"VaaniAuth security check"</strong>Backup verification phrase</div>
          </div>
          <div style={{height:16}} />
          <div className="voice-prompt center" id="reg-prompt">
            <div className="text-xs" style={{letterSpacing:1.5,textTransform:'uppercase'}}>Say this phrase</div>
            <div className="voice-phrase" id="reg-phrase">"My voice is my passport"</div>
          </div>
          <div className="waveform" id="reg-wave" style={{marginTop:16}}></div>
          <div className="center" style={{marginTop:8}}><span className="badge badge-blue" id="reg-status">Ready to record</span></div>
        </div>
        <div className="bottom">
          <button className="btn btn-primary" id="reg-btn" onClick={startRegPhrase}>Start Recording</button>
        </div>
      </div>

      {/* SCREEN 3: VOICE LOGIN */}
      <div className={`screen ${screen !== 's-login' ? 'hidden' : ''}`} id="s-login">
        <div className="status-bar"><div className="status-icons"></div></div>
        <div className="header">
          <button className="back-btn" onClick={() => go('s-welcome')}><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>Back</button>
          <div className="brand" style={{marginTop:14}}>Authentication</div>
          <div className="page-title">Voice Login</div>
          <div className="page-sub">Speak your passphrase to continue</div>
        </div>
        <div className="content">
          <div style={{height:20}} />
          <div className="voice-prompt center" style={{marginBottom:24}}>
            <div className="text-xs" style={{letterSpacing:1.5,textTransform:'uppercase',marginBottom:8}}>Say your passphrase</div>
            <div className="voice-phrase">"My voice is my passport"</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:20,marginTop:8}}>
            <div className="mic-ring" id="login-ring">
              <div className="pulse-ring ring1"></div>
              <div className="pulse-ring ring2"></div>
              <div className="pulse-ring ring3"></div>
              <button className="mic-btn" id="login-mic" onClick={startLogin}>
                <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </button>
            </div>
            <div className="waveform" id="login-wave"></div>
            <span className="badge badge-blue" id="login-status">Tap mic to begin</span>
          </div>
          <div style={{height:16}}></div>
          <div className="card" style={{marginTop:8}}>
            <div className="row mb8"><span className="text-xs" style={{textTransform:'uppercase',letterSpacing:1}} >Security Features</span></div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div className="row"><span className="text-sm">Voice liveness detection</span><span className="badge badge-teal" style={{fontSize:10,padding:'4px 10px'}}>Active</span></div>
              <div className="row"><span className="text-sm">Anti-replay protection</span><span className="badge badge-teal" style={{fontSize:10,padding:'4px 10px'}}>Active</span></div>
              <div className="row"><span className="text-sm">Ambient noise filtering</span><span className="badge badge-teal" style={{fontSize:10,padding:'4px 10px'}}>Active</span></div>
            </div>
          </div>
        </div>
        <div className="bottom">
        </div>
      </div>

      {/* SCREEN 4: AUTH SUCCESS */}
      <div className={`screen ${screen !== 's-success' ? 'hidden' : ''}`} id="s-success">
        <div className="status-bar"><div className="status-icons"></div></div>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:28}} id="success-body">
          <div className="confetti" id="confetti-zone"></div>
          <div className="result-circle success" style={{marginBottom:24}}>
            <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" fill="none" stroke="var(--teal)" strokeWidth="1.5"/><polyline className="check-path" points="14,26 22,34 38,18" fill="none" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{fontFamily:'Syne',fontSize:28,fontWeight:800,textAlign:'center',color:'var(--text)',marginBottom:8}}>Voice Verified</div>
          <div style={{fontSize:15,color:'var(--text2)',textAlign:'center',marginBottom:24}}>Identity confirmed with 98.7% match</div>
          <div className="badge badge-teal" style={{marginBottom:24}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
            Authentication Successful
          </div>
          <div style={{background:'var(--glass)',border:'0.5px solid var(--border)',borderRadius:16,padding:'16px 20px',width:'100%'}}>
            <div className="row" style={{marginBottom:10}}><span className="text-sm">Voice match score</span><span style={{fontSize:14,fontWeight:600,color:'var(--teal)'}}>98.7%</span></div>
            <div className="row" style={{marginBottom:10}}><span className="text-sm">Liveness check</span><span style={{fontSize:14,fontWeight:600,color:'var(--teal)'}}>Passed</span></div>
            <div className="row"><span className="text-sm">Session expires</span><span className="text-sm">30 min</span></div>
          </div>
        </div>
        <div className="bottom">
          <button className="btn btn-teal" onClick={() => go('s-dashboard')}>Enter Dashboard</button>
        </div>
      </div>

      {/* SCREEN 5: AUTH FAIL */}
      <div className={`screen ${screen !== 's-fail' ? 'hidden' : ''}`} id="s-fail">
        <div className="status-bar"><div className="status-icons"></div></div>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:28}}>
          <div className="result-circle fail" style={{marginBottom:24}}>
            <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" fill="none" stroke="var(--danger)" strokeWidth="1.5"/><line x1="17" y1="17" x2="35" y2="35" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round"/><line x1="35" y1="17" x2="17" y2="35" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round"/></svg>
          </div>
          <div style={{fontFamily:'Syne',fontSize:28,fontWeight:800,textAlign:'center',color:'var(--text)',marginBottom:8}}>Verification Failed</div>
          <div style={{fontSize:15,color:'var(--text2)',textAlign:'center',marginBottom:24}}>Voice not recognized. Please try again.</div>
          <div className="badge badge-red" style={{marginBottom:24}}>Authentication Failed</div>
          <div style={{background:'var(--glass)',border:'0.5px solid var(--border)',borderRadius:16,padding:'16px 20px',width:'100%'}}>
            <div className="row" style={{marginBottom:10}}><span className="text-sm">Voice match score</span><span style={{fontSize:14,fontWeight:600,color:'var(--danger)'}}>42.1%</span></div>
            <div className="row" style={{marginBottom:10}}><span className="text-sm">Threshold required</span><span className="text-sm">≥ 85%</span></div>
            <div className="row"><span className="text-sm">Attempts remaining</span><span style={{fontSize:14,fontWeight:600,color:'var(--warn)'}}>2 of 3</span></div>
          </div>
        </div>
        <div className="bottom">
          <button className="btn btn-primary" onClick={() => go('s-login')}>Try Again</button>
          <button className="btn btn-ghost" style={{marginTop:10}} onClick={() => go('s-welcome')}>Back to Home</button>
        </div>
      </div>

      {/* SCREEN 6: DASHBOARD */}
      <div className={`screen ${screen !== 's-dashboard' ? 'hidden' : ''}`} id="s-dashboard">
        <div className="status-bar"><div className="status-icons"><div className="status-dot" style={{background:'var(--teal)'}}></div><div className="status-dot" style={{background:'var(--teal)'}}></div><div className="status-dot" style={{background:'var(--teal)'}}></div></div></div>
        <div style={{padding:'12px 28px 0',flexShrink:0}}>
          <div className="row">
            <div><div className="text-xs" style={{textTransform:'uppercase',letterSpacing:1.5}}>Welcome back</div><div style={{fontFamily:'Syne',fontSize:20,fontWeight:700,color:'var(--text)',marginTop:2}}>Arjun Mehta</div></div>
            <div style={{width:42,height:42,borderRadius:14,background:'linear-gradient(145deg,var(--blue),#0a3b7a)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Syne',fontSize:14,fontWeight:700,color:'#fff'}}>AM</div>
          </div>
        </div>
        <div className="content" style={{paddingTop:16}}>
          <div className="bank-card">
            <div className="card-row"><div><div className="card-label">Total Balance</div><div className="card-balance">₹2,47,850</div></div><div style={{opacity:0.6}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="3"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div></div>
            <div className="card-number">•••• •••• •••• 4829</div>
            <div className="card-row" style={{marginTop:12}}><div><div className="card-label">Account holder</div><div style={{fontSize:13,color:'#ccd9ee'}}>Arjun K. Mehta</div></div><div style={{textAlign:'right'}}><div className="card-label">Valid thru</div><div style={{fontSize:13,color:'#ccd9ee'}}>12/27</div></div></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
            <div className="card" style={{padding:14}}><div className="text-xs" style={{textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Savings</div><div style={{fontFamily:'Syne',fontSize:18,fontWeight:700,color:'var(--teal)'}}>₹1,12,400</div></div>
            <div className="card" style={{padding:14}}><div className="text-xs" style={{textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>This Month</div><div style={{fontFamily:'Syne',fontSize:18,fontWeight:700,color:'var(--text)'}}>₹24,600</div><div style={{fontSize:11,color:'var(--danger)',marginTop:2}}>↓ Spent</div></div>
          </div>
          <div className="quick-actions">
            <div className="qa-btn" onClick={() => go('s-payment')}>
              <div className="qa-icon" style={{background:'rgba(37,128,255,0.12)'}}><svg viewBox="0 0 24 24" fill="none" stroke="#6aaeff" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg></div>
              <span className="qa-label">Send Money</span>
            </div>
            <div className="qa-btn">
              <div className="qa-icon" style={{background:'rgba(0,201,167,0.12)'}}><svg viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round"><path d="M12 2v20M2 12h20"/></svg></div>
              <span className="qa-label">Add Money</span>
            </div>
            <div className="qa-btn">
              <div className="qa-icon" style={{background:'rgba(245,158,11,0.12)'}}><svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
              <span className="qa-label">Statements</span>
            </div>
          </div>
          <div className="row mb8"><div style={{fontFamily:'Syne',fontSize:16,fontWeight:700}}>Transactions</div><span className="text-xs" style={{textTransform:'uppercase',letterSpacing:1,color:'var(--blue2)',cursor:'pointer'}}>View All</span></div>
          <div className="card" style={{padding:'4px 16px'}}>
            <div className="tx-row"><div className="tx-icon">🛒</div><div className="tx-info"><div className="tx-name">Amazon Shopping</div><div className="tx-date">Today, 8:24 AM</div></div><div className="tx-amount debit">- ₹3,249</div></div>
            <div className="tx-row"><div className="tx-icon">💸</div><div className="tx-info"><div className="tx-name">Salary Credit</div><div className="tx-date">Dec 31, 2024</div></div><div className="tx-amount credit">+ ₹85,000</div></div>
            <div className="tx-row"><div className="tx-icon">🍔</div><div className="tx-info"><div className="tx-name">Swiggy Order</div><div className="tx-date">Dec 30, 2024</div></div><div className="tx-amount debit">- ₹648</div></div>
            <div className="tx-row"><div className="tx-icon">⚡</div><div className="tx-info"><div className="tx-name">Electricity Bill</div><div className="tx-date">Dec 29, 2024</div></div><div className="tx-amount debit">- ₹2,100</div></div>
          </div>
          <div style={{height:16}}></div>
        </div>
        <div className="nav-bar">
          <div className="nav-item active"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span className="nav-label">Home</span></div>
          <div className="nav-item" onClick={() => go('s-payment')}><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg><span className="nav-label">Transfer</span></div>
          <div className="nav-item"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="3"/><line x1="1" y1="10" x2="23" y2="10"/></svg><span className="nav-label">Cards</span></div>
          <div className="nav-item"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span className="nav-label">Profile</span></div>
        </div>
      </div>

      {/* SCREEN 7: VOICE PAYMENT */}
      <div className={`screen ${screen !== 's-payment' ? 'hidden' : ''}`} id="s-payment">
        <div className="status-bar"><div className="status-icons"></div></div>
        <div className="header">
          <button className="back-btn" onClick={() => go('s-dashboard')}><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>Dashboard</button>
          <div className="brand" style={{marginTop:14}}>Voice Payment</div>
          <div className="page-title">Send Money</div>
        </div>
        <div className="content">
          <div className="card" style={{marginBottom:12}}>
            <div className="row mb8"><span className="text-xs" style={{textTransform:'uppercase',letterSpacing:1}}>Recipient</span></div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:44,height:44,borderRadius:14,background:'linear-gradient(145deg,#1a3a6e,#0e2552)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Syne',fontSize:14,fontWeight:700,color:'var(--blue2)'}}>PS</div>
              <div><div style={{fontSize:15,fontWeight:500,color:'var(--text)'}}>Priya Sharma</div><div className="text-xs" style={{marginTop:2}}>SBI • ••••9127</div></div>
              <div style={{marginLeft:'auto'}}><span className="badge badge-teal" style={{fontSize:10,padding:'4px 10px'}}>Trusted</span></div>
            </div>
          </div>
          <div className="amount-display"><span>₹</span>12,500</div>
          <div style={{textAlign:'center',marginBottom:20}}><span className="badge badge-blue">IMPS Transfer</span></div>
          <div className="voice-prompt center" style={{marginBottom:20}}>
            <div className="text-xs" style={{letterSpacing:1.5,textTransform:'uppercase',marginBottom:8}}>Say to confirm payment</div>
            <div className="voice-phrase">"Authorize this transaction now"</div>
            <div className="text-sm" style={{marginTop:8,opacity:0.6}}>Voice biometric confirmation required</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
            <div className="mic-ring" id="pay-ring">
              <div className="pulse-ring ring1"></div>
              <div className="pulse-ring ring2"></div>
              <div className="pulse-ring ring3"></div>
              <button className="mic-btn" id="pay-mic" onClick={startPayment}>
                <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </button>
            </div>
            <div className="waveform" id="pay-wave"></div>
            <span className="badge badge-blue" id="pay-status">Tap mic to confirm</span>
          </div>
        </div>
        <div className="bottom">
          <button className="btn btn-ghost" onClick={() => go('s-dashboard')}>Cancel</button>
        </div>
      </div>

      {/* SCREEN 8: PAYMENT SUCCESS */}
      <div className={`screen ${screen !== 's-pay-success' ? 'hidden' : ''}`} id="s-pay-success">
        <div className="status-bar"><div className="status-icons"></div></div>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:28}}>
          <div className="confetti" id="pay-confetti"></div>
          <div className="result-circle success" style={{marginBottom:24}}>
            <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" fill="none" stroke="var(--teal)" strokeWidth="1.5"/><polyline className="check-path" points="14,26 22,34 38,18" fill="none" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{fontFamily:'Syne',fontSize:28,fontWeight:800,textAlign:'center',marginBottom:8}}>Payment Sent!</div>
          <div style={{fontFamily:'Syne',fontSize:40,fontWeight:800,color:'var(--teal)',margin:'12px 0'}}>₹12,500</div>
          <div style={{fontSize:15,color:'var(--text2)',marginBottom:24}}>Sent to Priya Sharma · SBI</div>
          <div style={{background:'var(--glass)',border:'0.5px solid var(--border)',borderRadius:16,padding:'16px 20px',width:'100%'}}>
            <div className="row" style={{marginBottom:10}}><span className="text-sm">Transaction ID</span><span className="text-sm" style={{fontFamily:'monospace',fontSize:12}}>VN20241231084739</span></div>
            <div className="row" style={{marginBottom:10}}><span className="text-sm">Auth method</span><span className="badge badge-teal" style={{fontSize:10,padding:'4px 10px'}}>Voice Biometric</span></div>
            <div className="row"><span className="text-sm">Status</span><span style={{fontSize:14,fontWeight:600,color:'var(--teal)'}}>Completed</span></div>
          </div>
        </div>
        <div className="bottom">
          <button className="btn btn-primary" onClick={() => go('s-dashboard')}>Back to Dashboard</button>
        </div>
      </div>

      {/* PROCESSING OVERLAY */}
      <div className="processing-overlay" id="processing" style={{display:'none'}}>
        <div className="voice-ring-anim">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
        </div>
        <div style={{fontFamily:'Syne',fontSize:18,fontWeight:700,color:'var(--text)'}} id="proc-title">Analyzing Voice...</div>
        <div className="processing-text" id="proc-sub">Running biometric verification</div>
        <div className="waveform" id="proc-wave"></div>
      </div>

    </div>
  )
}
