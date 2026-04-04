export default function ChallengePhrase({ phrase, caption = 'Say your passphrase' }) {
  return (
    <section className="voice-prompt center">
      <div className="text-xs" style={{ letterSpacing: 1.5, textTransform: 'uppercase' }}>
        {caption}
      </div>
      <div className="voice-phrase">&quot;{phrase}&quot;</div>
    </section>
  )
}
